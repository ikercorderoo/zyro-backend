import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:WaWdQMEdvxWxtBqkZTKkFqpwJGBEjwAk@localhost:5432/railway';

async function test() {
  const client = new Client({
    connectionString
  });

  try {
    console.log('Connecting to LOCALHOST...');
    await client.connect();
    console.log('Connected successfully to LOCALHOST!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error to LOCALHOST:', err.message);
  }
}

test();
