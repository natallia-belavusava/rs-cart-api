import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { User } from '../models';
import {getDBClient} from "../../lib/db";

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;


  async findOne(name: string): Promise<User> {
    try {
      const client = await getDBClient();
      return await client.query(
          'SELECT * FROM users WHERE name = $1',
          [name],
      );
    } catch (err) {
      console.log(err)
    }
  }

  async createOne({name, password, email}: User): Promise<User> {
    try {
      const client = await getDBClient();

      const id = v4(v4());
      const user = await client.query(
          'insert into users (id, name, password, email) values ($1, $2, $3, $4) RETURNING *',
          [id, name, password, email],
      );
       client.end();
       return user;
    } catch (err) {
      console.log(err);
    }
  }
}
