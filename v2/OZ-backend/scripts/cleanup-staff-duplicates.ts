import { query } from '../express/src/config/database';
import dotenv from 'dotenv';
dotenv.config({ path: './express/.env' });

async function checkDuplicates() {
  try {
    const rows = await query<{ email: string, count: string }>(
      'SELECT email, COUNT(*) as count FROM staff WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1'
    );
    
    if (rows.length === 0) {
      console.log('✅ No duplicate emails found in staff table.');
      return;
    }

    console.log('⚠️ Found duplicate emails:', rows);
    
    for (const row of rows) {
      console.log(`Cleaning up duplicates for: ${row.email}`);
      // Keep the one with the latest joining_date or id
      await query(
        'DELETE FROM staff WHERE id IN (SELECT id FROM staff WHERE email = $1 OFFSET 1)',
        [row.email]
      );
    }
    console.log('✨ Cleanup complete.');
  } catch (err) {
    console.error('❌ Error checking duplicates:', err);
  }
}

checkDuplicates();
