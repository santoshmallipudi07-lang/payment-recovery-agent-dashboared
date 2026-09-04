# Payment Recovery Agent — Analytics Dashboard

A fintech-grade single-page analytics dashboard for the **Payment Recovery Agent** — an autonomous AI system that recovers failed Razorpay transactions by intelligently retrying, nudging customers, or escalating to human operations.

Built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Recharts**, and **@supabase/supabase-js**.

---

## Features

- **Private-Banking Design System**: Near-black charcoal background (`#08090b` to `#0b0c0e`), warm off-white typography (`#f5f2ea`), and warm gold/amber accents (`#d4a349`).
- **Live Pulse & Timestamp**: Real-time agent status indicator (`● AGENT ACTIVE`) and dynamic live clock.
- **5 High-Impact Metric Cards**:
  - **Total Amount At Risk** (in ₹, formatted from paise)
  - **Total Recovered** (in ₹, with autonomous win indicator)
  - **Recovery Rate %** (highlighted in gold with target threshold)
  - **Escalated to Human** (count and value)
  - **Still Open in Pipeline** (in-flight retries & nudges)
- **Recharts Decision Breakdown**: Donut chart visualizing **Retry** vs **Nudge** vs **Escalate** with center decision counters and custom tooltips.
- **Root Cause Diagnostics**: Failure reason breakdown showing recovery efficacy across technical errors, bank outages, and insufficient funds.
- **Interactive Audit Trail**:
  - Filter by Action (`All`, `Retries`, `Nudges`, `Escalations`, `Recovered`).
  - Search across Payment IDs, failure reasons, and AI decision rationale.
  - 1-click clipboard copy for Razorpay payment IDs.
  - **Decision Trace Modal**: Inspect the AI agent's complete reasoning transcript, heuristic confidence (96.8%), and lifecycle outcome.
- **Supabase Integration & Zero-Failure Demo Mode**:
  - Connect your live Supabase database directly via the in-app modal or `.env`.
  - Built-in connection tester that verifies table schemas and record counts.
  - Automatic fallback to high-fidelity mock data if credentials are not yet entered.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## Supabase Schema Setup

If setting up a new Supabase project, execute the following SQL in your Supabase SQL Editor:

```sql
-- 1. Create failed_payments table
CREATE TABLE IF NOT EXISTS failed_payments (
  id TEXT PRIMARY KEY,
  amount BIGINT NOT NULL, -- in paise (e.g. 1499900 = ₹14,999.00)
  method TEXT NOT NULL,   -- e.g. 'upi', 'card', 'netbanking'
  failure_reason TEXT NOT NULL, -- e.g. 'gateway_technical_error', 'insufficient_funds'
  retry_count INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('open', 'recovered', 'escalated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_email TEXT,
  customer_name TEXT
);

-- 2. Create action_log table
CREATE TABLE IF NOT EXISTS action_log (
  id BIGSERIAL PRIMARY KEY,
  failed_payment_id TEXT REFERENCES failed_payments(id) ON DELETE CASCADE,
  action_taken TEXT NOT NULL CHECK (action_taken IN ('retry', 'nudge', 'escalate')),
  reasoning TEXT NOT NULL,
  outcome TEXT NOT NULL, -- e.g. 'recovered', 'nudge_sent', 'escalated_by_agent', 'retry_failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) and allow public anon read access
ALTER TABLE failed_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read failed_payments" 
  ON failed_payments FOR SELECT USING (true);

CREATE POLICY "Allow public read action_log" 
  ON action_log FOR SELECT USING (true);
```

---

## Connecting Supabase

You can connect your Supabase database in two easy ways:

### Option A: Via the In-App Config Modal (Recommended)
1. Open the dashboard in your browser.
2. Click the **Supabase Config** button in the top right header.
3. Paste your **Supabase Project URL** and **Anon Key**.
4. Click **Test Connection** to verify connectivity and table counts.
5. Click **Save & Apply**.

### Option B: Via Environment File
Create a `.env` or `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Then restart the Vite dev server (`npm run dev`).

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** + **TypeScript** | Strict type-safe UI architecture |
| **Vite** | Blazing-fast compilation & HMR |
| **Tailwind CSS** | Custom obsidian charcoal & warm gold fintech design system |
| **Framer Motion** | Viewport reveal (`whileInView`) & scroll micro-animations |
| **Recharts** | Interactive decision distribution donut & custom dark tooltips |
| **@supabase/supabase-js** | Client-side database querying & error handling |
| **Lucide React** | Minimalist fintech iconography |
