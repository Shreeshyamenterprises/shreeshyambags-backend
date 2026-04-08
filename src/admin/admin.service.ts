import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AddVariantDto } from './dto/add-variant.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private products: ProductsService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const slug = dto.slug
      ? dto.slug
      : await this.products.ensureUniqueSlug(dto.title);

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        basePrice: dto.basePrice,
        isActive: dto.isActive ?? true,
      },
      include: {
        images: true,
        variants: { include: { pricingTiers: true } },
      },
    });
  }

  async addVariant(productId: string, dto: AddVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.variant.create({
      data: {
        productId,
        size: dto.size,
        color: dto.color,
        shape: dto.shape,
        sku: dto.sku,
        stock: dto.stock ?? 0,
        price: dto.price ?? 0,
        gsm: dto.gsm,
        pricePerKg: dto.pricePerKg,
        pricingTiers: dto.pricingTiers?.length
          ? {
              create: dto.pricingTiers.map((tier) => ({
                minQtyKg: tier.minQtyKg,
                pricePerKg: tier.pricePerKg,
              })),
            }
          : undefined,
      },
      include: {
        pricingTiers: true,
      },
    });
  }

  async getProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        images: true,
      },
    });
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: { include: { pricingTiers: true } },
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateVariant(
    variantId: string,
    dto: {
      size?: string;
      color?: string;
      shape?: string;
      sku?: string;
      price?: number;
      stock?: number;
      gsm?: number;
      pricePerKg?: number;
      isActive?: boolean;
    },
  ) {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.variant.update({
      where: { id: variantId },
      data: {
        ...(dto.size !== undefined && { size: dto.size }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.shape !== undefined && { shape: dto.shape }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.gsm !== undefined && { gsm: dto.gsm }),
        ...(dto.pricePerKg !== undefined && { pricePerKg: dto.pricePerKg }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { pricingTiers: true },
    });
  }

  async deleteVariant(id: string) {
    const variant = await this.prisma.variant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.prisma.pricingTier.deleteMany({ where: { variantId: id } });
    await this.prisma.cartItem.deleteMany({ where: { variantId: id } });
    await this.prisma.orderItem.deleteMany({ where: { variantId: id } });
    await this.prisma.quoteRequest.deleteMany({ where: { variantId: id } });

    return this.prisma.variant.delete({ where: { id } });
  }

  async deleteProduct(id: string) {
    // Get all variant ids for this product
    const variants = await this.prisma.variant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const variantIds = variants.map((v) => v.id);

    // Delete deepest relations first
    if (variantIds.length > 0) {
      await this.prisma.pricingTier.deleteMany({ where: { variantId: { in: variantIds } } });
      await this.prisma.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
      await this.prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
      await this.prisma.quoteRequest.deleteMany({ where: { variantId: { in: variantIds } } });
    }
    await this.prisma.quoteRequest.deleteMany({ where: { productId: id } });
    await this.prisma.variant.deleteMany({ where: { productId: id } });
    await this.prisma.productImage.deleteMany({ where: { productId: id } });

    return this.prisma.product.delete({ where: { id } });
  }

  async bulkDeleteProducts(ids: string[]) {
    const variants = await this.prisma.variant.findMany({
      where: { productId: { in: ids } },
      select: { id: true },
    });
    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      await this.prisma.pricingTier.deleteMany({ where: { variantId: { in: variantIds } } });
      await this.prisma.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
      await this.prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
      await this.prisma.quoteRequest.deleteMany({ where: { variantId: { in: variantIds } } });
    }
    await this.prisma.quoteRequest.deleteMany({ where: { productId: { in: ids } } });
    await this.prisma.variant.deleteMany({ where: { productId: { in: ids } } });
    await this.prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
    await this.prisma.product.deleteMany({ where: { id: { in: ids } } });

    return { deleted: ids.length };
  }

  async bulkUpdateStatus(ids: string[], isActive: boolean) {
    await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
    return { updated: ids.length };
  }

  async deleteImage(id: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return this.prisma.productImage.delete({
      where: { id },
    });
  }

  async updateProduct(
    id: string,
    dto: {
      title?: string;
      slug?: string;
      description?: string;
      basePrice?: number;
      isActive?: boolean;
    },
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async addProductImage(productId: string, imageUrl: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        url: imageUrl,
      },
    });
  }

  async getQuotes() {
    return this.prisma.quoteRequest.findMany({
      include: {
        product: true,
        variant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateQuote(
    id: string,
    dto: {
      status?: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
      adminPricePerKg?: number;
      adminNote?: string;
    },
  ) {
    return this.prisma.quoteRequest.update({
      where: { id },
      data: {
        status: dto.status,
        adminPricePerKg: dto.adminPricePerKg,
        adminNote: dto.adminNote,
      },
    });
  }
}
