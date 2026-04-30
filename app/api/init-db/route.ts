import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS debts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        total NUMERIC NOT NULL DEFAULT 0,
        balance NUMERIC NOT NULL DEFAULT 0,
        rate NUMERIC NOT NULL DEFAULT 0,
        min_payment NUMERIC NOT NULL DEFAULT 0,
        notes TEXT DEFAULT '',
        color TEXT DEFAULT '#E24B4A'
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        institution TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'savings',
        currency TEXT NOT NULL DEFAULT 'INR',
        opening_balance NUMERIC NOT NULL DEFAULT 0,
        color TEXT DEFAULT '#10b981',
        created_at TEXT,
        is_default BOOLEAN DEFAULT false,
        notes TEXT DEFAULT '',
        tag TEXT DEFAULT '',
        icon TEXT DEFAULT 'wallet'
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        account_id TEXT NOT NULL,
        to_account_id TEXT,
        category TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        created_at TEXT,
        income_stream_id TEXT,
        notes TEXT DEFAULT ''
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS incomes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Business',
        status TEXT NOT NULL DEFAULT 'active',
        currency TEXT,
        expected_monthly NUMERIC DEFAULT 0,
        actual_this_month NUMERIC DEFAULT 0,
        notes TEXT DEFAULT '',
        color TEXT DEFAULT '#10b981',
        icon TEXT DEFAULT 'briefcase',
        linked_account_id TEXT DEFAULT ''
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target NUMERIC NOT NULL DEFAULT 0,
        saved NUMERIC NOT NULL DEFAULT 0,
        deadline TEXT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        budgeted NUMERIC NOT NULL DEFAULT 0,
        spent NUMERIC NOT NULL DEFAULT 0,
        category TEXT NOT NULL DEFAULT ''
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;
    return NextResponse.json({ ok: true, message: 'All tables created.' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
