// Creates tables using Supabase Management API (not REST API)
// The Management API has an SQL execution endpoint
// Usage: node create-tables.mjs

const PROJECT_REF = 'whjexiderqdmblllxzuh';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoamV4aWRlcnFkbWJsbGx4enVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODcwNjU2MywiZXhwIjoyMDk0MjgyNTYzfQ.cn6a8lcc2eyCRRhkJFOgWnXgn1eEhOLh3zUAqNKXtE4';

const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

// Use supabase-js with direct postgres query support
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import bcryptjs from 'bcryptjs';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const SQL_STATEMENTS = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  // Products table
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
  // Sales table (without FK initially for simpler creation)
  `CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID,
    quantity_sold INTEGER NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    profit NUMERIC(10,2) NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  // Expenses table
  `CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
];

async function run() {
  console.log('🔧 Attempting to create tables...\n');
  
  // Method: Use supabase.schema or direct SQL via the supabase-js v2 SQL method
  // Actually, supabase-js v2 doesn't support raw SQL.
  // Let's try using the Supabase SQL API endpoint at /pg/query
  
  const allSQL = SQL_STATEMENTS.join(';\n') + ';';
  
  // Try the newer Supabase /query endpoint
  const endpoints = [
    `${SUPABASE_URL}/rest/v1/`,
  ];

  // Since we can't run DDL via REST, let's just check and use an RPC approach
  // First, let's try to create a function that creates tables
  
  // Actually, the simplest approach: Use the Supabase connection pooler
  // with the `pg` npm package. But we don't have pg installed.
  
  // Alternative: Use Supabase's built-in SQL API (if available on this project version)
  console.log('📝 Supabase REST API does not support DDL statements (CREATE TABLE).');
  console.log('   Tables must be created via the Supabase Dashboard SQL Editor.\n');
  console.log('   ▶ STEPS:');
  console.log('   1. Open: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
  console.log('   2. Copy & paste the SQL below and click RUN:\n');
  console.log('─'.repeat(60));
  console.log(allSQL);
  console.log('─'.repeat(60));
  
  // Now try to seed in case tables already exist
  console.log('\n🌱 Attempting to seed admin user...');
  
  const email = 'admin@amenkids.com';
  const password = 'amen@1234';

  // Check if users table exists
  const { data: existing, error: checkErr } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .limit(1);

  if (checkErr) {
    console.log(`   ❌ Users table does not exist yet: ${checkErr.message}`);
    console.log('   Please run the SQL schema first, then run this script again.');
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log('   ✅ Admin user already exists!');
    process.exit(0);
  }

  const hash = await bcryptjs.hash(password, 12);
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: hash, role: 'admin', language: 'en' }])
    .select()
    .single();

  if (error) {
    console.log(`   ❌ Seed failed: ${error.message}`);
    process.exit(1);
  }

  console.log('   ✅ Admin user created!');
  console.log(`      Email:    ${email}`);
  console.log(`      Password: ${password}`);
  console.log(`      ID:       ${data.id}`);
}

run().catch(console.error).finally(() => process.exit(0));
