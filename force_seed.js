const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, './.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const sql = neon(envConfig.DATABASE_URL);

async function run() {
  console.log("Seeding goals...");
  try {
    const now = new Date().toISOString();
    
    // Clear first
    await sql`DELETE FROM goals`;
    console.log("Cleared existing goals.");

    // Insert 4 goals
    await sql`INSERT INTO goals (id, name, target, saved, deadline, description, category, manual_progress, created_at, last_updated, total_milestones, milestone_value) VALUES
      ('goal_webdev', 'Web dev — 10 websites', 200000, 0, '2026-06-03', '10 client websites this month at ₹20,000 profit each', 'Personal', 0, ${now}, ${now}, 10, 20000),
      ('goal_marketing', 'Marketing retainer clients', 150000, 0, '2026-12-31', '1–3 recurring marketing clients at ₹50,000/month each', 'Personal / Company', 0, ${now}, ${now}, 0, 0),
      ('goal_bedspace', 'Bedspace platform — build', 0, 0, '2026-07-31', 'Build and launch the UAE bedspace listing platform in parallel', 'Company', 0, ${now}, ${now}, 0, 0),
      ('goal_artisan', 'Artisan platform — build', 0, 0, '2026-07-31', 'Build and launch the India artisan marketplace in parallel', 'Company', 0, ${now}, ${now}, 0, 0)
    `;
    console.log("Goals seeded successfully.");
    
    const count = await sql`SELECT count(*) FROM goals`;
    console.log("New goal count:", count[0].count);
  } catch (error) {
    console.error("Error seeding goals:", error);
  }
}

run();
