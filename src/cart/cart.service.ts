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

    const subtotal = items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0,
    );

    return {
      items,
      subtotal,
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

    // Optional: stock check
    if (variant.stock < (dto.quantity ?? 1)) {
      throw new BadRequestException('Not enough stock');
    }

    const customText = dto.customText?.trim() ?? '';

    // If same user + same variant + same customText exists, increase quantity
    const item = await this.prisma.cartItem.upsert({
      where: {
        userId_variantId_customText: {
          userId,
          variantId: dto.variantId,
          customText,
        },
      },
      update: {
        quantity: { increment: dto.quantity ?? 1 },
      },
      create: {
        userId,
        variantId: dto.variantId,
        customText,
        quantity: dto.quantity ?? 1,
      },
      include: {
        variant: {
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    return item;
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
