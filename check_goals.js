const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, './.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const sql = neon(envConfig.DATABASE_URL);

async function run() {
  try {
    const rows = await sql`SELECT * FROM goals`;
    console.log("Goals in database:", rows.length);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error("Error checking goals:", error);
  }
}

run();
