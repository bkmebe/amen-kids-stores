import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n');

  // Delete sales first (has foreign key to products)
  const { error: salesErr } = await supabase
    .from('sales')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(salesErr ? `❌ Sales: ${salesErr.message}` : '✅ Sales deleted');

  // Delete expenses
  const { error: expErr } = await supabase
    .from('expenses')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(expErr ? `❌ Expenses: ${expErr.message}` : '✅ Expenses deleted');

  // Delete products
  const { error: prodErr } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(prodErr ? `❌ Products: ${prodErr.message}` : '✅ Products deleted');

  // List remaining users
  const { data: users } = await supabase.from('users').select('id, email, role');
  console.log('\n👤 Current users (NOT deleted):');
  users?.forEach((u: any) => console.log(`   ${u.role}: ${u.email}`));
  
  console.log('\n✨ Cleanup complete! Users were kept intact.');
}

cleanup().catch(console.error);
