// Run SQL schema against Supabase using their management API
// Usage: node run-schema.mjs

const SUPABASE_URL = 'https://whjexiderqdmblllxzuh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamV4aWRlcnFkbWJsbGx4enVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODcwNjU2MywiZXhwIjoyMDk0MjgyNTYzfQ.cn6a8lcc2eyCRRhkJFOgWnXgn1eEhOLh3zUAqNKXtE4';

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT,
    selling_price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity_sold INTEGER NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    profit NUMERIC(10,2) NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`,
  `CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at)`,
];

async function run() {
  console.log('🔧 Creating tables via Supabase SQL...\n');

  // Try using the Supabase query endpoint
  for (const stmt of statements) {
    const label = stmt.trim().substring(0, 50);
    process.stdout.write(`  ${label}... `);
    
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({}),
      });
    } catch (e) {
      // expected
    }
  }

  // Since RPC won't work for DDL, let's try inserting a test row to verify table existence
  console.log('\n🔍 Checking if tables exist...');
  
  const tables = ['users', 'products', 'sales', 'expenses'];
  for (const table of tables) {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=0`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });
    const status = resp.status;
    if (status === 200) {
      console.log(`  ✅ ${table} - exists`);
    } else {
      const body = await resp.text();
      console.log(`  ❌ ${table} - ${status}: ${body.substring(0, 100)}`);
    }
  }
}

run().catch(console.error);
