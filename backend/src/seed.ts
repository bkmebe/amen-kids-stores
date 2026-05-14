/**
 * Seed script — creates admin + sales users in the database
 * Run: npx ts-node src/seed.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createUser(email: string, password: string, role: string) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    console.log(`  ✅ ${role} user already exists (${email})`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: passwordHash, role, language: 'en' }])
    .select()
    .single();

  if (error) {
    console.error(`  ❌ Failed to create ${role} user:`, error.message);
    return;
  }

  console.log(`  ✅ ${role} user created`);
  console.log(`     Email:    ${email}`);
  console.log(`     Password: ${password}`);
  console.log(`     ID:       ${data.id}`);
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Admin user — full access
  await createUser('admin@amenkids.com', 'amen@1234', 'admin');

  // Sales user — sales-only access
  await createUser('sales@amenkids.com', 'sales@1234', 'sales');

  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
