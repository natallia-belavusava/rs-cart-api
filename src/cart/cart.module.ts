import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { OrderService } from '../order';

@Module({
  imports: [OrderModule],
  providers: [CartService, OrderService],
  controllers: [CartController],
})
export class CartModule {}
