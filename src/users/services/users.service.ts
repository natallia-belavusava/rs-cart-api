import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { User } from '../models';
import { getDBClient } from '../../lib/db';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  async findOne(userId: string): Promise<User> {
    try {
      const client = await getDBClient();
      return await client.query('SELECT * FROM users WHERE user_id = $1', [
        userId,
      ]);
    } catch (err) {
      console.log(err);
    }
  }

  async createOne({ name, password, email }: User): Promise<User> {
    try {
      const client = await getDBClient();

      const id = v4(v4());
      const user = await client.query(
        'insert into cart_items (id, name, password, email) values ($1, $2, $3, $4) RETURNING *',
        [id, name, password, email],
      );
      client.end();
      return user;
    } catch (e) {}
  }
}
