
import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  Post,
  HttpStatus,
} from '@nestjs/common';
import * as Joi from 'joi';
import { Controller, Get, Delete, Put, Body, Req, Post, UseGuards, HttpStatus } from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';

import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { getDBClient } from '../lib/db';

const cartSchema = Joi.object({
  id: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.object({
          id: Joi.string().required(),
          title: Joi.string().required(),
          description: Joi.string().required(),
          price: Joi.number().required(),
        }).required(),
        count: Joi.number().required(),
      }),
    )
    .required(),
});

const orderBodySchema = Joi.object({
  payment: Joi.object().required(),
  delivery: Joi.object().required(),
  comments: Joi.string().optional(),
});

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    try {
      const cart = await this.cartService.findOrCreateByUserId(
        getUserIdFromRequest(req),
      );

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { cart, total: calculateCartTotal(cart) },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) {
    const { error, value } = cartSchema.validate(body);

    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      value,
    );

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart,
        total: calculateCartTotal(cart),
      },
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete()
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const { error, value } = orderBodySchema.validate(body);

    if (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }

    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode;

      return {
        statusCode,
        message: 'Cart is empty',
      };
    }
    const { payment, delivery, comments } = value;
    const { id: cartId, items } = cart;
    const total = calculateCartTotal(cart);
    const client = await getDBClient();
    try {
      await client.query('BEGIN'); // start the transaction
      const order = await this.orderService.create(
        {
          userId,
          cartId,
          items,
          total,
          payment,
          delivery,
          comments,
        },
        client,
      );

      await this.cartService.setOrderedStatus(userId, client);
      await client.query('COMMIT'); //commit changes to the DB
      console.log('Transaction completed successfully!');

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { ...order },
      };
    } catch (e) {
      await client.query('ROLLBACK'); //rollback transaction
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Transaction failed',
      };
      console.log('Transaction failed:', e);
    } finally {
      await client.end();
    }
  }
}
