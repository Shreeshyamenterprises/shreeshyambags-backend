import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@UseGuards(JwtAuthGuard)
@Controller("cart")
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  get(@CurrentUser() user: any) {
    return this.cart.getCart(user.id);
  }

  @Post("items")
  add(@CurrentUser() user: any, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(user.id, dto);
  }

  @Patch("items/:id")
  update(@CurrentUser() user: any, @Param("id") id: string, @Body() dto: UpdateCartItemDto) {
    return this.cart.updateItem(user.id, id, dto);
  }

  @Delete("items/:id")
  remove(@CurrentUser() user: any, @Param("id") id: string) {
    return this.cart.removeItem(user.id, id);
  }

  @Delete()
  clear(@CurrentUser() user: any) {
    return this.cart.clearCart(user.id);
  }
}