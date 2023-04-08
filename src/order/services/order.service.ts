import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { Order, OrderRequest } from '../models';
import { getDBClient } from '../../lib/db';
import { CartItem } from '../../cart';

@Injectable()
export class OrderService {
  async findOrders(orderId): Promise<Order> {
    try {
      let result;
      const client = await getDBClient();
      if (orderId) {
        result = await client.query('SELECT * FROM orders where id=$1', [
          orderId,
        ]);
        const cartItems = await client.query(
          `SELECT * FROM cart_items WHERE cart_id = $1`,
          [result.rows[0].cart_id],
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
        const {
          status,
          total,
          user_id,
          cart_id,
          comments,
          delivery,
          payment,
          id,
        } = result.rows[0];
        return {
          status,
          total,
          userId: user_id,
          cartId: cart_id,
          comments,
          delivery,
          payment,
          id,
          items,
        };
      } else {
        result = await client.query('SELECT * FROM orders');
      }
      if (result.rows.length === 0) {
        return null;
      }
      await client.end();
      console.log(result);
      return result.rows;
    } catch (err) {
      console.log('err.stack', err.stack);
    }
  }

  async findByOrderId(orderId: string): Promise<Order> {
    try {
      const client = await getDBClient();
      const result = await client.query('SELECT * FROM orders WHERE id = $1', [
        orderId,
      ]);
      if (result.rows.length === 0) {
        return null;
      }
      await client.end();
      return result.rows[0];
    } catch (err) {
      console.log('err.stack', err.stack);
    }
  }

  async create(data: OrderRequest, client) {
    try {
      const id = v4(v4());
      const { userId, cartId, total, payment, delivery, comments } = data;
      const status = 'OPEN';

      const orderResult = await client.query(
        'insert into orders (id, user_id, cart_id, payment, delivery, comments, total, status) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *',
        [id, userId, cartId, payment, delivery, comments, total, status],
      );

      return orderResult.rows[0];
    } catch (err) {
      console.log(err.stack);
    }
  }

  async updateOrder(data) {
    try {
      const client = await getDBClient();

      const orderId = data.id;

      const { comment, status } = data;

      const orderResult = await client.query(
        'update orders set comments = $2, status = $3 where id = $1 returning *',
        [orderId, comment, status],
      );
      await client.end();
      return orderResult.rows[0];
    } catch (e) {
      console.log(e);
    }
  }

  async removeById(orderId: string): Promise<void> {
    const client = await getDBClient();
    await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
    await client.end();
  }
}
