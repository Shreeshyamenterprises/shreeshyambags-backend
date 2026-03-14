import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AdminModule } from './admin/admin.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    AdminModule,
    CartModule,
    OrdersModule,
    CloudinaryModule,
    QuotesModule,
  ],
})
export class AppModule {}
