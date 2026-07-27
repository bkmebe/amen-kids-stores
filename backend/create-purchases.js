const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres:Post@2be@amen@db.whjexiderqdmblllxzuh.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase Postgres!');

    const query = `
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        supplier TEXT,
        quantity_purchased INTEGER NOT NULL,
        cost_per_unit NUMERIC(10,2) NOT NULL,
        total_cost NUMERIC(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        bank_name TEXT,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
      CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
    `;

    await client.query(query);
    console.log('Successfully created purchases table and indexes!');

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

run();
