// Rebuild Substrate with simple schema
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false
});

async function rebuild() {
  console.log('🦴 Rebuilding Substrate database...\n');
  
  try {
    // Drop old tables
    console.log('Dropping old tables...');
    await pool.query('DROP TABLE IF EXISTS subscriptions CASCADE');
    await pool.query('DROP TABLE IF EXISTS posts CASCADE');
    await pool.query('DROP TABLE IF EXISTS publications CASCADE');
    await pool.query('DROP TABLE IF EXISTS comments CASCADE');
    await pool.query('DROP TABLE IF EXISTS likes CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✓ Old tables dropped\n');
    
    // Create new tables
    console.log('Creating new simple schema...');
    const schema = fs.readFileSync('./schema-simple.sql', 'utf8');
    await pool.query(schema);
    console.log('✓ New schema created\n');
    
    console.log('🎉 Substrate rebuilt successfully!');
    console.log('   Simple structure: users → posts → comments/likes');
    
  } catch (error) {
    console.error('❌ Error rebuilding:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rebuild();
