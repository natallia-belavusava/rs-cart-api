import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart, CartItem } from '../models';

import { getDBClient } from '../../lib/db';

@Injectable()
export class CartService {
  async findByUserId(userId: string): Promise<Cart> {
    try {
      const client = await getDBClient();
      const result = await client.query(
        'SELECT * FROM carts WHERE user_id = $1 AND status = $2',
        [userId, 'OPEN'],
      );
      if (result.rows.length === 0) {
        return null;
      }
      const cart = result.rows[0];
      const cartItems = await client.query(
        `SELECT * FROM cart_items WHERE cart_id = $1`,
        [result.rows[0].id],
      );

      const items = await Promise.all<CartItem>(
        cartItems.rows.map(async item => {
          try {
            const productResult = await client.query(
              `select *
               from products
               where id = $1`,
              [item.product_id],
            );
            const product = productResult.rows[0];

            return {
              product,
              count: item.count,
            };
          } catch (err) {
            console.log('err.stack', err.stack);
          }
        }),
      );
      await client.end();
      return {
        id: cart.id,
        items,
      };
    } catch (err) {
      console.log('err.stack', err.stack);
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    try {
      const client = await getDBClient();
      const id = v4(v4());
      const result = await client.query(
        'insert into carts (id, user_id, created_at, updated_at, status) values ($1, $2, $3, $4, $5) RETURNING *',
        [id, userId, new Date(), new Date(), 'OPEN'],
      );
      await client.end();
      console.log(result.rows[0]);
      return {
        id,
        items: [],
      };
    } catch (err) {
      console.log(err.stack);
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    console.log(userId, 'userId -1');
    const userCart = await this.findByUserId(userId);
    console.log('userCart', userCart);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    try {
      const client = await getDBClient();
      const cart = await this.findOrCreateByUserId(userId);
      const cartId = cart.id;

      for (const item of items) {
        const id = v4(v4());
        await client.query(
          `DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2`,
          [cartId, item.product.id],
        );
        if (item.count) {
          const product = await client.query(
            'insert into cart_items (id, cart_id, product_id, count) values ($1, $2, $3, $4) RETURNING *',
            [id, cartId, item.product.id, item.count],
          );
        }
      }
      await client.end();
      return { id: cartId, items: [...items] };
    } catch (err) {
      console.log(err.stack);
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    const client = await getDBClient();
    await client.query('DELETE FROM carts WHERE user_id = $1', [userId]);
    await client.end();
  }

  async setOrderedStatus(userId: string, client): Promise<void> {
    await client.query(
      'UPDATE carts SET status = $1, updated_at = $2 WHERE user_id = $3',
      ['ORDERED', new Date(), userId],
    );
  }
}
