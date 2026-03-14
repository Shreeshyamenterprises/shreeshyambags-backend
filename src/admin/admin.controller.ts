import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AdminService } from './admin.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AddVariantDto } from './dto/add-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateProductDto } from './dto/update-product.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private admin: AdminService,
    private cloudinary: CloudinaryService,
  ) {}

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.admin.createProduct(dto);
  }

  @Post('products/:id/variants')
  addVariant(@Param('id') productId: string, @Body() dto: AddVariantDto) {
    return this.admin.addVariant(productId, dto);
  }

  @Get('products')
  getProducts() {
    return this.admin.getProducts();
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.admin.getProduct(id);
  }

  @Get('orders')
  getOrders() {
    return this.admin.getOrders();
  }

  @Patch('variants/:id')
  updateVariant(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.admin.updateVariant(id, dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.admin.updateProduct(id, dto);
  }

  @Delete('variants/:id')
  deleteVariant(@Param('id') id: string) {
    return this.admin.deleteVariant(id);
  }

  @Delete('images/:id')
  deleteImage(@Param('id') id: string) {
    return this.admin.deleteImage(id);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.admin.deleteProduct(id);
  }

  @Post('products/:id/images')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadProductImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Image file is required');
    }

    const result = await this.cloudinary.uploadImage(file.path);
    return this.admin.addProductImage(productId, result.secure_url);
  }

  @Get('quotes')
  getQuotes() {
    return this.admin.getQuotes();
  }

  @Patch('quotes/:id')
  updateQuote(
    @Param('id') id: string,
    @Body()
    dto: {
      status?: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
      adminPricePerKg?: number;
      adminNote?: string;
    },
  ) {
    return this.admin.updateQuote(id, dto);
  }
}
