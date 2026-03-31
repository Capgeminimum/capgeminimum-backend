#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env');
  process.exit(1);
}

async function executeSeed() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🌱 Starting database seeding...');

    await client.connect();

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Exécuter le SQL
    await client.query(sql);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 4 players created');
    console.log('   - 1 tournament created');
    console.log('   - 4 participants created');
    console.log('   - 3 games created');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeSeed();

