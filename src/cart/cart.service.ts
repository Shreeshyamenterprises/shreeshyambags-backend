import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    // Filter out orphaned items (variant or product was deleted)
    const validItems = items.filter((item) => item.variant && item.variant.product);

    // pricePerKg is stored in rupees; price is stored in paise.
    // Normalize everything to paise so the frontend can divide by 100 consistently.
    const subtotal = validItems.reduce((sum, item) => {
      const unitPricePaise =
        item.variant.pricePerKg != null
          ? item.variant.pricePerKg * 100
          : item.variant.price;
      return sum + unitPricePaise * item.quantity;
    }, 0);
    const totalKg = validItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = totalKg * 800; // ₹8 per kg (stored in paise)

    return {
      items: validItems,
      subtotal,
      shipping,
      totalKg,
      total: subtotal + shipping,
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const variant = await this.prisma.variant.findFirst({
      where: { id: dto.variantId, isActive: true, product: { isActive: true } },
      include: { product: true },
    });

    if (!variant) throw new NotFoundException('Variant not found');
    if ((dto.quantity ?? 1) < 1)
      throw new BadRequestException('Quantity must be >= 1');

    // Stock check only applies when stock tracking is enabled (stock > 0)
    if (variant.stock > 0 && variant.stock < (dto.quantity ?? 1)) {
      throw new BadRequestException('Not enough stock');
    }

    const customText = dto.customText?.trim() ?? '';

    const include = {
      variant: {
        include: {
          product: { select: { id: true, title: true, slug: true } },
        },
      },
    };

    // Check if this exact line already exists (same user + variant + customText)
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, variantId: dto.variantId, customText },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: dto.quantity ?? 1 } },
        include,
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, variantId: dto.variantId, customText, quantity: dto.quantity ?? 1 },
      include,
    });
  }

  async updateItem(userId: string, cartItemId: string, dto: UpdateCartItemDto) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });
    if (!existing) throw new NotFoundException('Cart item not found');

    const nextCustomText =
      dto.customText !== undefined
        ? (dto.customText?.trim() ?? '')
        : (existing.customText ?? '');

    // If customText changes, it may collide with unique constraint, so handle carefully:
    // We will:
    // 1) delete current item
    // 2) upsert into the target key and add quantity
    const wantsCustomTextChange =
      dto.customText !== undefined && nextCustomText !== existing.customText;

    if (wantsCustomTextChange) {
      const qty = dto.quantity ?? existing.quantity;

      await this.prisma.cartItem.delete({ where: { id: existing.id } });

      return this.prisma.cartItem.upsert({
        where: {
          userId_variantId_customText: {
            userId,
            variantId: existing.variantId,
            customText: nextCustomText,
          },
        },
        update: { quantity: qty }, // set exact
        create: {
          userId,
          variantId: existing.variantId,
          customText: nextCustomText,
          quantity: qty,
        },
        include: {
          variant: {
            include: {
              product: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      });
    }

    // Normal update (quantity only)
    return this.prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: dto.quantity ?? existing.quantity,
      },
      include: {
        variant: {
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
  }

  async removeItem(userId: string, cartItemId: string) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });
    if (!existing) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: existing.id } });
    return { ok: true };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { ok: true };
  }
}
