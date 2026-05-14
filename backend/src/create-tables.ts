/**
 * Creates tables via Supabase Management API
 * Run: npx ts-node src/create-tables.ts
 */
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT UNIQUE,
  selling_price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold INTEGER NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  profit NUMERIC(10,2) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);
`;

async function createTables() {
  console.log('🔧 Creating tables via Supabase SQL API...');

  // Use the Supabase SQL endpoint
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({}),
  });

  // The /rest/v1/ endpoint doesn't support raw SQL.
  // We need to use the Supabase pg endpoint instead
  // Let's try the /pg endpoint or the query endpoint
  
  // Actually, let's use the supabase-js query method
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Split SQL into individual statements
  const statements = SQL.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    console.log(`  Executing: ${stmt.substring(0, 60)}...`);
    const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
    if (error) {
      console.log(`  ⚠️ RPC not available: ${error.message}`);
      break;
    }
  }

  // Alternate approach: try direct fetch to the pg/query endpoint
  console.log('\n🔄 Trying direct SQL endpoint...');
  const pgResp = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: SQL }),
  });

  if (pgResp.ok) {
    console.log('✅ Tables created successfully via /pg endpoint!');
  } else {
    const text = await pgResp.text();
    console.log(`  Status: ${pgResp.status}`);
    console.log(`  Response: ${text.substring(0, 200)}`);
    console.log('\n📋 Please create the tables manually:');
    console.log('   1. Go to https://supabase.com/dashboard/project/whjexiderqdmblllxzuh/sql/new');
    console.log('   2. Paste the contents of backend/schema.sql');
    console.log('   3. Click "Run"');
    console.log('   4. Then run: npx ts-node src/seed.ts');
  }
}

createTables().catch(console.error).finally(() => process.exit(0));
