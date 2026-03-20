import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuoteDto) {
    return this.prisma.quoteRequest.create({
      data: { ...dto, enquiryType: 'QUOTE' },
    });
  }

  async createContact(dto: { name: string; phone: string; email?: string; message?: string }) {
    return this.prisma.quoteRequest.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        message: dto.message,
        enquiryType: 'CONTACT',
      },
    });
  }

  async findAll() {
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

  async update(id: string, data: any) {
    return this.prisma.quoteRequest.update({
      where: { id },
      data,
    });
  }
}
