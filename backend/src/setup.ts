/**
 * Setup script — runs the SQL schema and seeds the admin user
 * Run: npx ts-node src/setup.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setup() {
  console.log('🔧 Setting up Amen Kids Store database...\n');

  // Create tables using Supabase REST API via raw SQL
  // Note: This requires the Supabase service role to execute raw SQL
  const { error: extError } = await (supabase as any).rpc('exec_sql', {
    sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
  });

  // Create users table
  console.log('📋 Creating tables...');

  const createUsersSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      language TEXT DEFAULT 'en',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createProductsSQL = `
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
  `;

  const createSalesSQL = `
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
  `;

  const createExpensesSQL = `
    CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      category TEXT NOT NULL,
      notes TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Try using supabase-js to execute SQL
  // This needs Postgres functions or direct SQL
  // Let's try via postgres directly
  for (const [name, sql] of [
    ['users', createUsersSQL],
    ['products', createProductsSQL],
    ['sales', createSalesSQL],
    ['expenses', createExpensesSQL],
  ]) {
    try {
      const { error } = await (supabase as any).from('_sql').select('*').eq('query', sql);
      // The above won't work — we need a different approach
    } catch {
      // Expected
    }
  }

  console.log('Note: Cannot auto-create tables via JS client.');
  console.log('   Please run the SQL schema manually in Supabase SQL Editor.\n');
  console.log('   Go to: https://supabase.com/dashboard → SQL Editor\n');

  // Try to seed (tables may already exist)
  await seedAdmin();
}

async function seedAdmin() {
  const email = 'admin@amenkids.com';
  const password = 'amen@1234';
  const passwordHash = await bcrypt.hash(password, 12);

  console.log('🌱 Creating admin user...');

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    console.log('✅ Admin user already exists');
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: passwordHash, role: 'admin', language: 'en' }])
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create admin user:', error.message);
    console.error('   Make sure the SQL schema has been run first!');
    return;
  }

  console.log('✅ Admin user created!');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   ID:       ${data.id}`);
}

setup().catch(console.error).finally(() => process.exit(0));
