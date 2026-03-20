import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class OrdersService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async create(userId: string, dto: CreateOrderDto) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cartItems) {
      if (!item.variant.isActive || !item.variant.product.isActive) {
        throw new BadRequestException('One or more cart items are unavailable');
      }
      // Only enforce stock if stock tracking is enabled (stock > 0)
      if (item.variant.stock > 0 && item.variant.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.variant.product.title}`,
        );
      }
    }

    // pricePerKg is in rupees; price is in paise. Normalize to paise.
    const subtotal = cartItems.reduce((sum, item) => {
      const unitPricePaise =
        item.variant.pricePerKg != null
          ? item.variant.pricePerKg * 100
          : item.variant.price;
      return sum + unitPricePaise * item.quantity;
    }, 0);
    const totalKg = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = totalKg * 800; // ₹8 per kg (in paise)
    const total = subtotal + shipping;

    const order = await this.prisma.order.create({
      data: {
        userId,
        subtotal,
        shipping,
        total,
        shipName: dto.shipName,
        shipPhone: dto.shipPhone,
        shipAddressLine1: dto.shipAddressLine1,
        shipAddressLine2: dto.shipAddressLine2,
        shipCity: dto.shipCity,
        shipState: dto.shipState,
        shipPincode: dto.shipPincode,
        items: {
          create: cartItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.variant.price,
            customText: item.customText,
            productTitle: item.variant.product.title,
            size: item.variant.size,
            color: item.variant.color,
            shape: item.variant.shape,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    let razorpayOrderId: string | null = null;

    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const razorpayOrder = await this.razorpay.orders.create({
          amount: total,
          currency: 'INR',
          receipt: order.id.slice(0, 40),
          notes: { dbOrderId: order.id, userId },
        });
        razorpayOrderId = razorpayOrder.id;
        await this.prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId },
        });
      }
    } catch (err) {
      // Razorpay failure should not block order creation
      console.error('Razorpay order creation failed:', err);
    }

    return {
      orderId: order.id,
      razorpayOrderId,
      amount: total,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID ?? null,
    };
  }

  async verify(userId: string, dto: VerifyPaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!order.razorpayOrderId)
      throw new BadRequestException('Missing Razorpay order id');
    if (order.razorpayOrderId !== dto.razorpayOrderId) {
      throw new BadRequestException('Razorpay order id mismatch');
    }

    const expectedSignature = createHmac(
      'sha256',
      process.env.RAZORPAY_KEY_SECRET!,
    )
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySignature: dto.razorpaySignature,
        },
      });

      for (const item of order.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId },
      });
    });

    return { ok: true, status: 'PAID' };
  }

  async myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async byId(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
        },
      },
    });
  }
}
