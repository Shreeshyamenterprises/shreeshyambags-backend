import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('size') size?: string,
    @Query('color') color?: string,
    @Query('shape') shape?: string,
  ) {
    return this.productsService.findAll({
      search,
      size,
      color,
      shape,
    });
  }

  @Get(':slug')
  getProduct(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }
}
