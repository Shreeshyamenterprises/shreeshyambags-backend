import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async ensureUniqueSlug(title: string) {
    const base = this.slugify(title);
    let slug = base;
    let count = 1;

    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${base}-${count}`;
      count++;
    }

    return slug;
  }

  async findAll(query?: {
    search?: string;
    size?: string;
    color?: string;
    shape?: string;
  }) {
    const search = query?.search?.trim();
    const size = query?.size?.trim();
    const color = query?.color?.trim();
    const shape = query?.shape?.trim();

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
        ...(size || color || shape
          ? {
              variants: {
                some: {
                  isActive: true,
                  ...(size ? { size } : {}),
                  ...(color ? { color } : {}),
                  ...(shape ? { shape } : {}),
                },
              },
            }
          : {}),
      },
      include: {
        images: true,
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { items: products };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        images: true,
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
