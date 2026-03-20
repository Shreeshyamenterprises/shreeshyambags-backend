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
    const slug = await this.products.ensureUniqueSlug(dto.title);

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        basePrice: dto.basePrice,
      },
      include: {
        images: true,
        variants: true,
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
        variants: true,
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
    dto: { price?: number; stock?: number; isActive?: boolean },
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
        price: dto.price ?? variant.price,
        stock: dto.stock ?? variant.stock,
        isActive: dto.isActive ?? variant.isActive,
      },
    });
  }

  async deleteVariant(id: string) {
    const variant = await this.prisma.variant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.variant.update({
      where: { id },
      data: {
        isActive: false,
        stock: 0,
      },
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
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

  async updateProduct(id: string, dto: { isActive?: boolean }) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isActive: dto.isActive ?? product.isActive,
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
