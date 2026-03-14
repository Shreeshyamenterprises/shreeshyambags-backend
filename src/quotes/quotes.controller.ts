import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.quotesService.update(id, body);
  }
}
