import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // Check if data already seeded
    const existing = await sql`SELECT count(*) as cnt FROM debts`;
    if (Number(existing[0].cnt) > 0) {
      return NextResponse.json({ ok: true, message: 'Data already seeded.' });
    }

    // Seed debts
    await sql`INSERT INTO debts (id, name, total, balance, rate, min_payment, notes, color) VALUES
      ('debt_001', 'Alumol', 498326, 498326, 0, 0, 'Personal debt — priority payoff', '#E24B4A'),
      ('debt_002', 'Ikaka Gold', 770000, 770000, 0, 0, 'Original ₹5,50,000 + Gold Sold ₹2,20,000. Sold 2 pavan gold on his behalf.', '#EF9F27'),
      ('debt_003', 'Vappa', 211000, 211000, 0, 0, 'Family debt', '#7F77DD'),
      ('debt_004', 'Fayiz', 125000, 125000, 0, 0, 'Personal loan', '#378ADD'),
      ('debt_005', 'Azeezka', 20000, 20000, 0, 0, 'Small personal debt — clear first (snowball)', '#1D9E75'),
      ('debt_006', 'Kamru Zaman', 70000, 70000, 0, 0, 'Personal debt', '#D85A30'),
      ('debt_007', 'Ayishatha', 130000, 130000, 0, 0, '5,000 AED × 26 = ₹1,30,000', '#639922'),
      ('debt_008', 'Mummy', 208000, 208000, 0, 0, '8,000 AED × 26 = ₹2,08,000', '#E24B4A')
    `;

    // Seed accounts
    await sql`INSERT INTO accounts (id, name, institution, type, currency, opening_balance, color, created_at, is_default, notes, tag, icon) VALUES
      ('acc_001', 'Ayisha Savings', 'Friend — Ayisha', 'savings', 'INR', 0, '#7F77DD', ${new Date().toISOString()}, false, 'Savings kept with friend Ayisha — INR', 'trusted-hold', 'piggy'),
      ('acc_002', 'UAE Cash Wallet', 'Cash', 'cash', 'AED', 0, '#EF9F27', ${new Date().toISOString()}, true, 'Physical cash on hand in UAE — AED', 'cash', 'wallet')
    `;

    // Seed incomes
    await sql`INSERT INTO incomes (id, name, type, status, currency, expected_monthly, actual_this_month, notes, color, icon, linked_account_id) VALUES
      ('inc_001', 'Zorx', 'Business', 'active', 'AED', 0, 0, 'Primary income — Zorx. Add monthly amount.', '#1D9E75', 'briefcase', 'acc_002'),
      ('inc_002', 'Personal Web Development — UAE', 'Freelance', 'active', 'AED', 0, 0, 'Web dev projects from UAE clients. Log per project.', '#378ADD', 'code', 'acc_002'),
      ('inc_003', 'Freelance Marketing Work', 'Freelance', 'active', 'AED', 0, 0, 'Marketing freelance — UAE based', '#EF9F27', 'megaphone', 'acc_002'),
      ('inc_004', 'Web Development Projects — India', 'Freelance', 'active', 'INR', 0, 0, 'Web dev projects from India clients. INR income.', '#7F77DD', 'code', 'acc_001'),
      ('inc_005', 'More income streams coming soon...', 'placeholder', 'coming_soon', NULL, 0, 0, 'Tap + to add a new income stream', '#444', 'plus', '')
    `;

    // Clear existing goals
    await sql`DELETE FROM goals`;

    // Seed goals
    await sql`INSERT INTO goals (id, name, target, saved, deadline, description, category, manual_progress, created_at, last_updated, total_milestones, milestone_value) VALUES
      ('goal_webdev', 'Web dev — 10 websites', 200000, 0, '2026-06-03', '10 client websites this month at ₹20,000 profit each', 'Personal', 0, ${new Date().toISOString()}, ${new Date().toISOString()}, 10, 20000),
      ('goal_marketing', 'Marketing retainer clients', 150000, 0, '2026-12-31', '1–3 recurring marketing clients at ₹50,000/month each', 'Personal / Company', 0, ${new Date().toISOString()}, ${new Date().toISOString()}, 0, 0),
      ('goal_bedspace', 'Bedspace platform — build', 0, 0, '2026-07-31', 'Build and launch the UAE bedspace listing platform in parallel', 'Company', 0, ${new Date().toISOString()}, ${new Date().toISOString()}, 0, 0),
      ('goal_artisan', 'Artisan platform — build', 0, 0, '2026-07-31', 'Build and launch the India artisan marketplace in parallel', 'Company', 0, ${new Date().toISOString()}, ${new Date().toISOString()}, 0, 0)
    `;

    // Seed expenses
    await sql`INSERT INTO expenses (id, name, budgeted, spent, category) VALUES
      ('rec_001', 'Rent', 12500, 0, 'Housing'),
      ('rec_002', 'Travel', 7500, 0, 'Transport'),
      ('rec_003', 'Basic Living Expenses', 7500, 0, 'Food & Dining')
    `;

    // Seed settings
    await sql`INSERT INTO app_settings (key, value) VALUES
      ('currency', '"INR"'),
      ('secondaryCurrency', '"AED"'),
      ('aedToInr', '26'),
      ('theme', '"dark"'),
      ('name', '"Your Name"'),
      ('accentColor', '"#10b981"'),
      ('onboarded', 'true'),
      ('migrated_real_data', 'true'),
      ('apiKey', '""')
    ON CONFLICT (key) DO NOTHING`;

    return NextResponse.json({ ok: true, message: 'All data seeded successfully.' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
