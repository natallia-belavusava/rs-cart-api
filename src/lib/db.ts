import * as process from 'process';

const { Client } = require('pg');

export const getDBClient = async () => {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  });

  await client.connect();
  return client;
};
