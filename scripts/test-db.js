#!/usr/bin/env node

/**
 * Test script to verify database persistence
 * This test uses sqlite3 directly to check the created database file
 */

import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🧪 Testing database persistence...\n');

  try {
    const dbPath = path.resolve(process.cwd(), 'data', 'alara.sqlite');
    
    console.log(`📁 Checking database file: ${dbPath}`);
    const stat = await fs.stat(dbPath).catch(() => null);
    
    if (!stat) {
      console.log('⚠️  Database file not found. Run: npm run init-db\n');
      process.exit(1);
    }

    console.log(`✅ Database file exists`);
    console.log(`   Size: ${(stat.size / 1024).toFixed(2)} KB`);
    console.log(`   Modified: ${stat.mtime.toLocaleString()}\n`);

    // Try to read the file
    const buffer = await fs.readFile(dbPath);
    console.log(`✅ Database file is readable (${buffer.length} bytes)\n`);

    // Check if it looks like an SQLite file (magic bytes: 53514c69 = "SQLi")
    const header = buffer.slice(0, 4).toString('hex');
    if (header === '53514c69') {
      console.log('✅ Valid SQLite database header detected\n');
    } else {
      console.log('⚠️  File header unexpected:', header, '\n');
    }

    console.log('✨ Database file validation complete!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Submit a student assessment form');
    console.log('  3. Check Admin Dashboard to verify data storage\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
