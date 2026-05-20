/**
 * Reset passwords for existing users
 */
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetPassword(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('email', email)
    .select('id, email, role')
    .single();

  if (error) {
    console.error(`  ❌ Failed to reset password for ${email}:`, error.message);
    return;
  }

  console.log(`  ✅ Password reset for ${email} (role: ${data.role})`);
}

async function main() {
  console.log('🔑 Resetting passwords...\n');
  await resetPassword('admin@amenkids.com', 'amen@1234');
  await resetPassword('sales@amenkids.com', 'sales@1234');
  console.log('\n✅ Done!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
