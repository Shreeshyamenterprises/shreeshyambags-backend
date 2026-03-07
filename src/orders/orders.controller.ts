import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto);
  }

  @Get('me')
  getMyOrders(@CurrentUser() user: any) {
    return this.orders.getUserOrders(user.id);
  }

  @Get(':id')
  byId(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orders.byId(user.id, id);
  }
}
