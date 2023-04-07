import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from '../order';
import { AppRequest } from '../shared';

@Controller('api/profile/order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  async findOrders(@Req() req: AppRequest) {
    try {
      const id = req.query?.id;
      const orders = await this.orderService.findOrders(id);

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: orders,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  @Put()
  async updateOrder(@Req() req: AppRequest, @Body() body) {
    try {
      const id = req.query.id;
      const order = await this.orderService.updateOrder({ id, ...body });

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: {
          order,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  @Delete()
  async clearUserCart(@Req() req: AppRequest) {
    try {
      const id = req.query.id;
      await this.orderService.removeById(id);

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        statusCode: HttpStatus.OK,
        message: 'OK',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }
}
