import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:WaWdQMEdvxWxtBqkZTKkFqpwJGBEjwAk@shortline.proxy.rlwy.net:26908/railway';

async function test() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

test();
