"use client";

import { useMemo, useState } from "react";

import { DemoWindow } from "./DemoChrome";
import styles from "./FinanceStudio.module.css";

type ViewId = "overview" | "ledger" | "recurring" | "transfers" | "import";
type AccountKind = "current" | "joint" | "credit" | "investment";
type SourceAdapter = "HSBC Debit PDF" | "HSBC Credit PDF" | "Lloyds PDF" | "Revolut PDF" | "Trading 212 CSV";
type Category =
  | "Income"
  | "Housing"
  | "Groceries"
  | "Eating out"
  | "Transport"
  | "Shopping"
  | "Bills & utilities"
  | "Subscriptions"
  | "Health & education"
  | "Transfers & payments"
  | "Investments"
  | "Investment income";

type Account = {
  id: string;
  label: string;
  shortLabel: string;
  kind: AccountKind;
  adapter: SourceAdapter;
  openingBalance: number;
  accent: string;
};

type LedgerTransaction = {
  id: string;
  accountId: Account["id"];
  date: string;
  age: number;
  description: string;
  merchant: string;
  category: Category;
  amount: number;
  confidence: number;
  categorySource: "auto" | "parser" | "rule";
  ticker?: string;
  shares?: number;
  unitPrice?: number;
};

type Holding = {
  ticker: string;
  price: number;
};

type TransferMatch = {
  id: string;
  out: LedgerTransaction;
  incoming: LedgerTransaction;
  amount: number;
  days: number;
  evidence: boolean;
  score: number;
};

type Anomaly = {
  transaction: LedgerTransaction;
  reason: string;
  z: number | null;
};

type RecurringConfig = {
  minOccurrences: number;
  regularity: number;
  priceThreshold: number;
  monthlyTolerance: number;
};

type RecurringPattern = {
  merchant: string;
  category: Category;
  cadence: string;
  cadenceDays: number;
  typicalAmount: number;
  monthlyCost: number;
  occurrences: number;
  regularity: number;
  status: "active" | "price_change";
};

const ANCHOR_DATE = "18 Aug 2026";

const ACCOUNTS: Account[] = [
  {
    id: "harbour-current",
    label: "Harbour Current •01",
    shortLabel: "Harbour",
    kind: "current",
    adapter: "HSBC Debit PDF",
    openingBalance: 4150,
    accent: "#2ec4b6",
  },
  {
    id: "tide-joint",
    label: "Tide Joint •12",
    shortLabel: "Tide",
    kind: "joint",
    adapter: "Revolut PDF",
    openingBalance: 1850,
    accent: "#4f9dde",
  },
  {
    id: "northstar-credit",
    label: "Northstar Credit •07",
    shortLabel: "Northstar",
    kind: "credit",
    adapter: "HSBC Credit PDF",
    openingBalance: -620,
    accent: "#fb7185",
  },
  {
    id: "quay-current",
    label: "Quay Current •34",
    shortLabel: "Quay",
    kind: "current",
    adapter: "Lloyds PDF",
    openingBalance: 1200,
    accent: "#a78bfa",
  },
  {
    id: "atlas-invest",
    label: "Atlas Invest •21",
    shortLabel: "Atlas",
    kind: "investment",
    adapter: "Trading 212 CSV",
    openingBalance: 780,
    accent: "#fbbf24",
  },
];

const LEDGER: LedgerTransaction[] = [
  { id: "tx-001", accountId: "harbour-current", date: "2026-08-18", age: 0, description: "ACME DESIGN PAYROLL", merchant: "Acme Design Payroll", category: "Income", amount: 3400, confidence: 99, categorySource: "rule" },
  { id: "tx-002", accountId: "harbour-current", date: "2026-08-17", age: 1, description: "NORTHSTAR LETTINGS", merchant: "Northstar Lettings", category: "Housing", amount: -1350, confidence: 98, categorySource: "rule" },
  { id: "tx-003", accountId: "harbour-current", date: "2026-08-16", age: 2, description: "JUNCTION MARKET", merchant: "Junction Market", category: "Groceries", amount: -64.3, confidence: 95, categorySource: "auto" },
  { id: "tx-004", accountId: "northstar-credit", date: "2026-08-15", age: 3, description: "CLOUD LEDGER", merchant: "Cloud Ledger", category: "Subscriptions", amount: -24, confidence: 93, categorySource: "auto" },
  { id: "tx-005", accountId: "harbour-current", date: "2026-08-14", age: 4, description: "CITYLINE TRANSIT", merchant: "Cityline Transit", category: "Transport", amount: -28.5, confidence: 97, categorySource: "rule" },
  { id: "tx-006", accountId: "harbour-current", date: "2026-08-13", age: 5, description: "CARD SETTLEMENT TO NORTHSTAR", merchant: "Card Settlement", category: "Transfers & payments", amount: -400, confidence: 99, categorySource: "rule" },
  { id: "tx-007", accountId: "northstar-credit", date: "2026-08-13", age: 5, description: "CARD SETTLEMENT FROM HARBOUR", merchant: "Card Settlement", category: "Transfers & payments", amount: 400, confidence: 99, categorySource: "rule" },
  { id: "tx-008", accountId: "tide-joint", date: "2026-08-12", age: 6, description: "RIVERSIDE GROCER", merchant: "Riverside Grocer", category: "Groceries", amount: -52.1, confidence: 94, categorySource: "auto" },
  { id: "tx-009", accountId: "northstar-credit", date: "2026-08-11", age: 7, description: "STREAMLINE MEDIA", merchant: "Streamline Media", category: "Subscriptions", amount: -19.99, confidence: 96, categorySource: "auto" },
  { id: "tx-010", accountId: "tide-joint", date: "2026-08-10", age: 8, description: "STUDIO GYM", merchant: "Studio Gym", category: "Health & education", amount: -45, confidence: 92, categorySource: "auto" },
  { id: "tx-011", accountId: "harbour-current", date: "2026-08-09", age: 9, description: "RIVER CAFE", merchant: "River Cafe", category: "Eating out", amount: -18.4, confidence: 91, categorySource: "auto" },
  { id: "tx-012", accountId: "harbour-current", date: "2026-08-08", age: 10, description: "RIVER CAFE", merchant: "River Cafe", category: "Eating out", amount: -18.4, confidence: 91, categorySource: "auto" },
  { id: "tx-013", accountId: "harbour-current", date: "2026-08-07", age: 11, description: "PORTFOLIO FUNDING TO ATLAS", merchant: "Portfolio Funding", category: "Transfers & payments", amount: -300, confidence: 99, categorySource: "rule" },
  { id: "tx-014", accountId: "atlas-invest", date: "2026-08-06", age: 12, description: "PORTFOLIO FUNDING FROM HARBOUR", merchant: "Portfolio Funding", category: "Transfers & payments", amount: 300, confidence: 99, categorySource: "parser" },
  { id: "tx-015", accountId: "northstar-credit", date: "2026-08-05", age: 13, description: "ARCADE ELECTRONICS", merchant: "Arcade Electronics", category: "Shopping", amount: -620, confidence: 89, categorySource: "auto" },
  { id: "tx-016", accountId: "quay-current", date: "2026-08-04", age: 14, description: "QUAY ENERGY", merchant: "Quay Energy", category: "Bills & utilities", amount: -84, confidence: 97, categorySource: "rule" },
  { id: "tx-017", accountId: "atlas-invest", date: "2026-08-02", age: 16, description: "MARKET BUY NOVA", merchant: "NOVA", category: "Investments", amount: -250, confidence: 100, categorySource: "parser", ticker: "NOVA", shares: 10, unitPrice: 25 },
  { id: "tx-018", accountId: "atlas-invest", date: "2026-08-01", age: 17, description: "DIVIDEND NOVA", merchant: "NOVA", category: "Investment income", amount: 6.8, confidence: 100, categorySource: "parser" },
  { id: "tx-019", accountId: "harbour-current", date: "2026-07-29", age: 20, description: "RIVER CAFE", merchant: "River Cafe", category: "Eating out", amount: -44.2, confidence: 91, categorySource: "auto" },
  { id: "tx-020", accountId: "quay-current", date: "2026-07-25", age: 24, description: "PAPER & PINE", merchant: "Paper & Pine", category: "Shopping", amount: -32, confidence: 86, categorySource: "auto" },
  { id: "tx-021", accountId: "harbour-current", date: "2026-07-20", age: 29, description: "ACME DESIGN PAYROLL", merchant: "Acme Design Payroll", category: "Income", amount: 3400, confidence: 99, categorySource: "rule" },
  { id: "tx-022", accountId: "harbour-current", date: "2026-07-19", age: 30, description: "NORTHSTAR LETTINGS", merchant: "Northstar Lettings", category: "Housing", amount: -1350, confidence: 98, categorySource: "rule" },
  { id: "tx-023", accountId: "northstar-credit", date: "2026-07-17", age: 32, description: "CLOUD LEDGER", merchant: "Cloud Ledger", category: "Subscriptions", amount: -24, confidence: 93, categorySource: "auto" },
  { id: "tx-024", accountId: "harbour-current", date: "2026-07-15", age: 34, description: "JUNCTION MARKET", merchant: "Junction Market", category: "Groceries", amount: -58.75, confidence: 95, categorySource: "auto" },
  { id: "tx-025", accountId: "harbour-current", date: "2026-07-14", age: 35, description: "CITYLINE TRANSIT", merchant: "Cityline Transit", category: "Transport", amount: -31.2, confidence: 97, categorySource: "rule" },
  { id: "tx-026", accountId: "northstar-credit", date: "2026-07-11", age: 38, description: "STREAMLINE MEDIA", merchant: "Streamline Media", category: "Subscriptions", amount: -19.99, confidence: 96, categorySource: "auto" },
  { id: "tx-027", accountId: "tide-joint", date: "2026-07-09", age: 40, description: "STUDIO GYM", merchant: "Studio Gym", category: "Health & education", amount: -45, confidence: 92, categorySource: "auto" },
  { id: "tx-028", accountId: "atlas-invest", date: "2026-07-06", age: 43, description: "MARKET BUY TIDE", merchant: "TIDE", category: "Investments", amount: -200, confidence: 100, categorySource: "parser", ticker: "TIDE", shares: 10, unitPrice: 20 },
  { id: "tx-029", accountId: "atlas-invest", date: "2026-07-05", age: 44, description: "DIVIDEND TIDE", merchant: "TIDE", category: "Investment income", amount: 5.5, confidence: 100, categorySource: "parser" },
  { id: "tx-030", accountId: "quay-current", date: "2026-07-04", age: 45, description: "QUAY ENERGY", merchant: "Quay Energy", category: "Bills & utilities", amount: -82, confidence: 97, categorySource: "rule" },
  { id: "tx-031", accountId: "quay-current", date: "2026-07-01", age: 48, description: "MAKER SUPPLY", merchant: "Maker Supply", category: "Shopping", amount: -28, confidence: 84, categorySource: "auto" },
  { id: "tx-032", accountId: "harbour-current", date: "2026-06-30", age: 49, description: "ONLINE BANK PAYMENT", merchant: "Account Move", category: "Transfers & payments", amount: -550, confidence: 99, categorySource: "rule" },
  { id: "tx-033", accountId: "tide-joint", date: "2026-06-28", age: 51, description: "BANK CREDIT RECEIVED", merchant: "Account Move", category: "Transfers & payments", amount: 550, confidence: 99, categorySource: "rule" },
  { id: "tx-034", accountId: "harbour-current", date: "2026-06-28", age: 51, description: "CANAL KITCHEN", merchant: "Canal Kitchen", category: "Eating out", amount: -21.8, confidence: 90, categorySource: "auto" },
  { id: "tx-035", accountId: "tide-joint", date: "2026-06-25", age: 54, description: "RIVERSIDE GROCER", merchant: "Riverside Grocer", category: "Groceries", amount: -46.7, confidence: 94, categorySource: "auto" },
  { id: "tx-036", accountId: "harbour-current", date: "2026-06-24", age: 55, description: "DESK NOTES", merchant: "Desk Notes", category: "Shopping", amount: -41, confidence: 83, categorySource: "auto" },
  { id: "tx-037", accountId: "harbour-current", date: "2026-06-20", age: 59, description: "ACME DESIGN PAYROLL", merchant: "Acme Design Payroll", category: "Income", amount: 3400, confidence: 99, categorySource: "rule" },
  { id: "tx-038", accountId: "harbour-current", date: "2026-06-19", age: 60, description: "NORTHSTAR LETTINGS", merchant: "Northstar Lettings", category: "Housing", amount: -1350, confidence: 98, categorySource: "rule" },
  { id: "tx-039", accountId: "northstar-credit", date: "2026-06-17", age: 62, description: "CLOUD LEDGER", merchant: "Cloud Ledger", category: "Subscriptions", amount: -12, confidence: 93, categorySource: "auto" },
  { id: "tx-040", accountId: "harbour-current", date: "2026-06-15", age: 64, description: "JUNCTION MARKET", merchant: "Junction Market", category: "Groceries", amount: -63.4, confidence: 95, categorySource: "auto" },
  { id: "tx-041", accountId: "harbour-current", date: "2026-06-12", age: 67, description: "CITYLINE TRANSIT", merchant: "Cityline Transit", category: "Transport", amount: -29.8, confidence: 97, categorySource: "rule" },
  { id: "tx-042", accountId: "northstar-credit", date: "2026-06-11", age: 68, description: "STREAMLINE MEDIA", merchant: "Streamline Media", category: "Subscriptions", amount: -19.99, confidence: 96, categorySource: "auto" },
  { id: "tx-043", accountId: "tide-joint", date: "2026-06-09", age: 70, description: "STUDIO GYM", merchant: "Studio Gym", category: "Health & education", amount: -45, confidence: 92, categorySource: "auto" },
  { id: "tx-044", accountId: "atlas-invest", date: "2026-06-06", age: 73, description: "MARKET BUY QUAY", merchant: "QUAY", category: "Investments", amount: -180, confidence: 100, categorySource: "parser", ticker: "QUAY", shares: 12, unitPrice: 15 },
  { id: "tx-045", accountId: "atlas-invest", date: "2026-06-05", age: 74, description: "DIVIDEND QUAY", merchant: "QUAY", category: "Investment income", amount: 4.2, confidence: 100, categorySource: "parser" },
  { id: "tx-046", accountId: "quay-current", date: "2026-06-04", age: 75, description: "QUAY ENERGY", merchant: "Quay Energy", category: "Bills & utilities", amount: -83, confidence: 97, categorySource: "rule" },
  { id: "tx-047", accountId: "quay-current", date: "2026-05-31", age: 79, description: "PAPER & PINE", merchant: "Paper & Pine", category: "Shopping", amount: -35.5, confidence: 86, categorySource: "auto" },
  { id: "tx-048", accountId: "tide-joint", date: "2026-05-27", age: 83, description: "HOMEWARE MINI", merchant: "Homeware Mini", category: "Shopping", amount: -22, confidence: 82, categorySource: "auto" },
  { id: "tx-049", accountId: "harbour-current", date: "2026-05-25", age: 85, description: "JUNCTION MARKET", merchant: "Junction Market", category: "Groceries", amount: -49, confidence: 95, categorySource: "auto" },
  { id: "tx-050", accountId: "northstar-credit", date: "2026-05-22", age: 88, description: "STREAMLINE MEDIA", merchant: "Streamline Media", category: "Subscriptions", amount: -19.99, confidence: 96, categorySource: "auto" },
  { id: "tx-051", accountId: "northstar-credit", date: "2026-05-21", age: 89, description: "CLOUD LEDGER", merchant: "Cloud Ledger", category: "Subscriptions", amount: -12, confidence: 93, categorySource: "auto" },
];

const HOLDING_PRICES: Holding[] = [
  { ticker: "NOVA", price: 27.3 },
  { ticker: "TIDE", price: 18.8 },
  { ticker: "QUAY", price: 16.1 },
];

const DECLARED_CLOSINGS: Record<Account["id"], number> = {
  "harbour-current": 8581.25,
  "tide-joint": 2144.2,
  "northstar-credit": -991.96,
  "quay-current": 855.5,
  "atlas-invest": 466.5,
};

const VIEWS: { id: ViewId; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "Reconciled cash flow" },
  { id: "ledger", label: "Ledger", hint: "Classification trace" },
  { id: "recurring", label: "Patterns", hint: "Cadence detector" },
  { id: "transfers", label: "Transfers", hint: "Cross-account matching" },
  { id: "import", label: "Import audit", hint: "Parser + dedupe pipeline" },
];

const CATEGORY_ORDER: Category[] = [
  "Income",
  "Housing",
  "Groceries",
  "Eating out",
  "Transport",
  "Shopping",
  "Bills & utilities",
  "Subscriptions",
  "Health & education",
  "Transfers & payments",
  "Investments",
  "Investment income",
];

const TRANSFER_EVIDENCE = ["ACCOUNT MOVE", "PORTFOLIO FUNDING", "CARD SETTLEMENT", "SELF TRANSFER"];
const EXCLUDED_CATEGORIES = new Set<Category>(["Transfers & payments", "Investments"]);

function money(value: number, sign = false) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: Math.abs(value) % 1 === 0 ? 0 : 2,
    signDisplay: sign ? "always" : "auto",
  }).format(value);
}

function percentage(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00Z`));
}

function accountFor(id: string) {
  return ACCOUNTS.find((account) => account.id === id) ?? ACCOUNTS[0];
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function dayDifference(a: string, b: string) {
  return Math.abs((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);
}

function closingBalance(account: Account) {
  return roundMoney(account.openingBalance + LEDGER
    .filter((transaction) => transaction.accountId === account.id)
    .reduce((sum, transaction) => sum + transaction.amount, 0));
}

function matchTransfers(transactions: LedgerTransaction[], windowDays: number, requireEvidence: boolean) {
  const outgoing = transactions
    .filter((transaction) => transaction.amount < 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const incoming = transactions.filter((transaction) => transaction.amount > 0);
  const usedIncoming = new Set<string>();
  const matches: TransferMatch[] = [];

  for (const out of outgoing) {
    const candidates = incoming
      .filter((candidate) => (
        !usedIncoming.has(candidate.id)
        && candidate.accountId !== out.accountId
        && roundMoney(candidate.amount) === roundMoney(Math.abs(out.amount))
        && dayDifference(candidate.date, out.date) <= windowDays
      ))
      .map((candidate) => {
        const joinedDescription = `${out.description} ${candidate.description}`.toLocaleUpperCase();
        const evidence = TRANSFER_EVIDENCE.some((token) => joinedDescription.includes(token));
        const days = dayDifference(candidate.date, out.date);
        return { candidate, evidence, days, score: (10 - days) + (evidence ? 5 : 0) };
      })
      .filter((candidate) => !requireEvidence || candidate.evidence)
      .sort((a, b) => b.score - a.score);

    const best = candidates[0];
    if (!best) continue;
    usedIncoming.add(best.candidate.id);
    matches.push({
      id: `T${String(matches.length + 1).padStart(2, "0")}`,
      out,
      incoming: best.candidate,
      amount: Math.abs(out.amount),
      days: best.days,
      evidence: best.evidence,
      score: best.score,
    });
  }

  return matches;
}

function anomalyReasonMap(anomalies: Anomaly[]) {
  const byId = new Map<string, string[]>();
  for (const anomaly of anomalies) {
    const reasons = byId.get(anomaly.transaction.id) ?? [];
    reasons.push(anomaly.reason);
    byId.set(anomaly.transaction.id, reasons);
  }
  return byId;
}

function detectAnomalies(transactions: LedgerTransaction[], zThreshold: number, minHistory = 5) {
  const anomalies: Anomaly[] = [];
  const spendByCategory = new Map<Category, LedgerTransaction[]>();

  for (const transaction of transactions) {
    if (transaction.amount >= 0 || transaction.category === "Investments") continue;
    const categoryTransactions = spendByCategory.get(transaction.category) ?? [];
    categoryTransactions.push(transaction);
    spendByCategory.set(transaction.category, categoryTransactions);
  }

  for (const [category, categoryTransactions] of spendByCategory) {
    if (categoryTransactions.length < minHistory) continue;
    const amounts = categoryTransactions.map((transaction) => Math.abs(transaction.amount));
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + ((amount - mean) ** 2), 0) / amounts.length;
    const deviation = Math.sqrt(variance) || 1;
    for (const transaction of categoryTransactions) {
      const z = (Math.abs(transaction.amount) - mean) / deviation;
      if (z >= zThreshold && Math.abs(transaction.amount) > mean) {
        anomalies.push({ transaction, reason: `Unusually large for ${category}`, z: Math.round(z * 10) / 10 });
      }
    }
  }

  const seen = new Map<string, LedgerTransaction[]>();
  for (const transaction of [...transactions].sort((a, b) => a.date.localeCompare(b.date))) {
    if (transaction.amount >= 0 || transaction.category === "Investments") continue;
    const key = `${transaction.merchant}|${Math.abs(transaction.amount).toFixed(2)}`;
    const previous = seen.get(key) ?? [];
    if (previous.some((candidate) => dayDifference(candidate.date, transaction.date) <= 2)) {
      anomalies.push({ transaction, reason: "Possible duplicate charge", z: null });
    }
    previous.push(transaction);
    seen.set(key, previous);
  }

  const unique = new Map<string, Anomaly>();
  for (const anomaly of anomalies) {
    const existing = unique.get(anomaly.transaction.id);
    if (!existing || existing.z === null) unique.set(anomaly.transaction.id, anomaly);
  }
  return [...unique.values()].sort((a, b) => b.transaction.date.localeCompare(a.transaction.date));
}

function cadenceFor(days: number, monthlyTolerance: number) {
  const cadences = [
    { label: "weekly", centre: 7, tolerance: 2 },
    { label: "fortnightly", centre: 14, tolerance: 2 },
    { label: "monthly", centre: 30.4, tolerance: monthlyTolerance },
    { label: "bi-monthly", centre: 60.8, tolerance: 3 },
    { label: "quarterly", centre: 91.3, tolerance: 5 },
    { label: "annual", centre: 365, tolerance: 15 },
  ];
  return cadences
    .map((cadence) => ({ ...cadence, distance: Math.abs(days - cadence.centre) }))
    .filter((cadence) => cadence.distance <= cadence.tolerance)
    .sort((a, b) => a.distance - b.distance)[0];
}

function detectRecurring(transactions: LedgerTransaction[], config: RecurringConfig) {
  const byMerchant = new Map<string, LedgerTransaction[]>();
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || transaction.category === "Investments") continue;
    const merchantTransactions = byMerchant.get(transaction.merchant) ?? [];
    merchantTransactions.push(transaction);
    byMerchant.set(transaction.merchant, merchantTransactions);
  }

  const patterns: RecurringPattern[] = [];
  for (const [merchant, merchantTransactions] of byMerchant) {
    const chronological = [...merchantTransactions].sort((a, b) => a.date.localeCompare(b.date));
    const uniqueDates = [...new Set(chronological.map((transaction) => transaction.date))];
    if (uniqueDates.length < config.minOccurrences) continue;
    const gaps = uniqueDates.slice(1).map((date, index) => dayDifference(date, uniqueDates[index])).filter(Boolean);
    if (!gaps.length) continue;
    const medianGap = median(gaps);
    const cadence = cadenceFor(medianGap, config.monthlyTolerance);
    if (!cadence) continue;
    const window = Math.max(cadence.tolerance, medianGap * 0.2);
    const regularity = gaps.filter((gap) => Math.abs(gap - medianGap) <= window).length / gaps.length;
    if (regularity < config.regularity) continue;
    const amounts = chronological.map((transaction) => Math.abs(transaction.amount));
    const typical = median(amounts);
    const recentCutoff = uniqueDates[Math.max(0, uniqueDates.length - 3)];
    const recent = chronological
      .filter((transaction) => transaction.date >= recentCutoff)
      .map((transaction) => Math.abs(transaction.amount));
    const recentMedian = median(recent);
    const priceChanged = typical > 0 && Math.abs(recentMedian - typical) / typical > config.priceThreshold;
    patterns.push({
      merchant,
      category: chronological[0].category,
      cadence: cadence.label,
      cadenceDays: Math.round(medianGap * 10) / 10,
      typicalAmount: roundMoney(typical),
      monthlyCost: roundMoney(typical * (30.4 / medianGap)),
      occurrences: uniqueDates.length,
      regularity,
      status: priceChanged ? "price_change" : "active",
    });
  }

  return patterns.sort((a, b) => b.monthlyCost - a.monthlyCost);
}

function householdEligible(transaction: LedgerTransaction) {
  return !EXCLUDED_CATEGORIES.has(transaction.category);
}

function sourceStatus(transaction: LedgerTransaction) {
  if (transaction.category === "Transfers & payments") return "Internal move";
  if (transaction.category === "Investments") return "Portfolio churn";
  return "Household cash flow";
}

function buildCashFlowPeriods(transactions: LedgerTransaction[], range: 30 | 90) {
  const definitions = range === 30
    ? [
      { label: "22–30D", minAge: 22, maxAge: 30 },
      { label: "15–21D", minAge: 15, maxAge: 21 },
      { label: "8–14D", minAge: 8, maxAge: 14 },
      { label: "0–7D", minAge: 0, maxAge: 7 },
    ]
    : [
      { label: "61–90D", minAge: 61, maxAge: 90 },
      { label: "31–60D", minAge: 31, maxAge: 60 },
      { label: "0–30D", minAge: 0, maxAge: 30 },
    ];

  return definitions.map((definition) => {
    const rows = transactions.filter((transaction) => (
      transaction.age >= definition.minAge
      && transaction.age <= definition.maxAge
      && householdEligible(transaction)
    ));
    return {
      ...definition,
      income: roundMoney(rows.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0)),
      spending: roundMoney(Math.abs(rows.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + transaction.amount, 0))),
    };
  });
}

function dedupeShape(transaction: LedgerTransaction) {
  const occurrence = LEDGER
    .filter((candidate) => (
      candidate.accountId === transaction.accountId
      && candidate.date === transaction.date
      && candidate.amount === transaction.amount
      && candidate.description === transaction.description
      && candidate.id.localeCompare(transaction.id) < 0
    )).length;
  return `${transaction.accountId} | ${transaction.date} | ${transaction.amount.toFixed(2)} | ${transaction.description} | ${occurrence}`;
}

function accountPosition(accountId: string) {
  const account = accountFor(accountId);
  const cash = closingBalance(account);
  if (account.kind !== "investment") return cash;
  const holdingsValue = LEDGER
    .filter((transaction) => transaction.accountId === accountId && transaction.ticker && transaction.shares)
    .reduce((sum, transaction) => {
      const price = HOLDING_PRICES.find((holding) => holding.ticker === transaction.ticker)?.price ?? 0;
      return sum + ((transaction.shares ?? 0) * price);
    }, 0);
  return roundMoney(cash + holdingsValue);
}

function ScopeControls({ range, setRange, accountId, setAccountId }: {
  range: 30 | 90;
  setRange: (range: 30 | 90) => void;
  accountId: string;
  setAccountId: (id: string) => void;
}) {
  return (
    <div className={styles.scopeBar} aria-label="Cash-flow scope">
      <div className={styles.rangeSwitch} aria-label="Analysis period">
        <button type="button" className={range === 30 ? styles.active : ""} onClick={() => setRange(30)} aria-pressed={range === 30}>30 days</button>
        <button type="button" className={range === 90 ? styles.active : ""} onClick={() => setRange(90)} aria-pressed={range === 90}>90 days</button>
      </div>
      <label>
        <span>Account scope</span>
        <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
          <option value="all">All five accounts</option>
          {ACCOUNTS.map((account) => <option value={account.id} key={account.id}>{account.label}</option>)}
        </select>
      </label>
      <p><strong>Anchor</strong> {ANCHOR_DATE} · date windows are fixed and reproducible</p>
    </div>
  );
}

function MetricCard({ label, value, note, tone = "default" }: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "positive" | "negative" | "teal";
}) {
  return (
    <article className={`${styles.metricCard} ${styles[tone]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function OverviewView({ range, accountId, rangeLedger, allTransfers, anomalies }: {
  range: 30 | 90;
  accountId: string;
  rangeLedger: LedgerTransaction[];
  allTransfers: TransferMatch[];
  anomalies: Anomaly[];
}) {
  const eligible = rangeLedger.filter(householdEligible);
  const income = roundMoney(eligible.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0));
  const spending = roundMoney(Math.abs(eligible.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + transaction.amount, 0)));
  const net = roundMoney(income - spending);
  const periods = buildCashFlowPeriods(rangeLedger, range);
  const chartIncome = roundMoney(periods.reduce((sum, period) => sum + period.income, 0));
  const chartSpend = roundMoney(periods.reduce((sum, period) => sum + period.spending, 0));
  const maxFlow = Math.max(1, ...periods.flatMap((period) => [period.income, period.spending]));
  const scopedAccounts = accountId === "all" ? ACCOUNTS : ACCOUNTS.filter((account) => account.id === accountId);
  const scopedPosition = roundMoney(scopedAccounts.reduce((sum, account) => sum + accountPosition(account.id), 0));
  const categorySpend = CATEGORY_ORDER.map((category) => ({
    category,
    amount: roundMoney(Math.abs(eligible
      .filter((transaction) => transaction.category === category && transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0))),
  })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const maxCategory = Math.max(1, ...categorySpend.map((item) => item.amount));
  const scopedTransferIds = new Set(rangeLedger.map((transaction) => transaction.id));
  const scopedTransfers = allTransfers.filter((match) => scopedTransferIds.has(match.out.id) || scopedTransferIds.has(match.incoming.id));
  const moved = roundMoney(scopedTransfers.reduce((sum, match) => sum + match.amount, 0));
  const transactionCount = rangeLedger.length;

  return (
    <>
      <div className={styles.metricStrip}>
        <MetricCard label="SCOPE POSITION" value={money(scopedPosition)} note="At anchor; cash + holdings, debt negative" tone="teal" />
        <MetricCard label="HOUSEHOLD INFLOWS" value={money(income)} note={`${range}-day eligible ledger`} tone="positive" />
        <MetricCard label="HOUSEHOLD OUTFLOWS" value={money(spending)} note={`${income ? Math.round((spending / income) * 100) : 0}% of eligible inflows`} tone="negative" />
        <MetricCard label="NET CASH FLOW" value={money(net, true)} note={`${money(income)} − ${money(spending)}`} tone={net >= 0 ? "positive" : "negative"} />
        <MetricCard label="ROWS IN SCOPE" value={transactionCount.toString()} note={`${rangeLedger.filter((transaction) => !householdEligible(transaction)).length} excluded from budget`} />
      </div>

      <div className={styles.overviewGrid}>
        <section className={styles.oceanPanel} aria-labelledby="finance-flow-title">
          <div className={styles.panelTitle}>
            <div><span>ONE LEDGER · ONE RESULT</span><h3 id="finance-flow-title">Income versus spending</h3></div>
            <div className={styles.legend}><span className={styles.incomeSwatch}>Income</span><span className={styles.spendSwatch}>Spend</span></div>
          </div>
          <div className={styles.flowChart} role="img" aria-label={`${range}-day cash-flow chart. Income ${money(chartIncome)}, spending ${money(chartSpend)}.`}>
            {periods.map((period) => (
              <div className={styles.flowPeriod} key={period.label}>
                <div className={styles.flowBars}>
                  <span className={styles.flowIncome} style={{ height: `${Math.max(period.income ? 3 : 0, (period.income / maxFlow) * 100)}%` }} title={`${period.label} income ${money(period.income)}`} />
                  <span className={styles.flowSpend} style={{ height: `${Math.max(period.spending ? 3 : 0, (period.spending / maxFlow) * 100)}%` }} title={`${period.label} spending ${money(period.spending)}`} />
                </div>
                <strong>{period.label}</strong>
                <small>{money(period.income - period.spending, true)}</small>
              </div>
            ))}
          </div>
          <div className={styles.reconcileBar}>
            <span>Chart Σ income <strong>{money(chartIncome)}</strong></span>
            <span>Chart Σ spend <strong>{money(chartSpend)}</strong></span>
            <span className={chartIncome === income && chartSpend === spending ? styles.pass : styles.fail}>
              {chartIncome === income && chartSpend === spending ? "✓ HERO CARDS RECONCILE" : "! CHECK FAILED"}
            </span>
          </div>
        </section>

        <section className={styles.oceanPanel} aria-labelledby="finance-signals-title">
          <div className={styles.panelTitle}><div><span>DETERMINISTIC INTELLIGENCE</span><h3 id="finance-signals-title">Explainable signals</h3></div></div>
          <ul className={styles.signalStack}>
            <li><span className={styles.signalGood}>✓</span><div><strong>{scopedTransfers.length} transfer groups neutralised</strong><p>{money(moved)} moved once between accounts; both legs stay outside income and spending.</p></div></li>
            <li><span className={anomalies.length ? styles.signalWarn : styles.signalGood}>{anomalies.length || "✓"}</span><div><strong>{anomalies.length ? "Review queue has evidence" : "No anomalies at this threshold"}</strong><p>{anomalies[0]?.reason ?? "Category z-score and two-day duplicate checks are clear."}</p></div></li>
            <li><span className={styles.signalGood}>✓</span><div><strong>Four bank adapters reconcile</strong><p>Opening + normalised movements = closing. The investment CSV is audited as a cash ledger.</p></div></li>
          </ul>
        </section>
      </div>

      <div className={styles.lowerGrid}>
        <section className={styles.oceanPanel} aria-labelledby="finance-accounts-title">
          <div className={styles.panelTitle}><div><span>LIABILITY-AWARE</span><h3 id="finance-accounts-title">Account reconciliation</h3></div></div>
          <div className={styles.accountList}>
            {scopedAccounts.map((account) => {
              const movement = roundMoney(LEDGER.filter((transaction) => transaction.accountId === account.id).reduce((sum, transaction) => sum + transaction.amount, 0));
              const closing = closingBalance(account);
              return (
                <article key={account.id}>
                  <span className={styles.accountMark} style={{ background: account.accent }} />
                  <div><strong>{account.label}</strong><small>{account.adapter} · {account.kind === "credit" ? "debt normalised negative" : account.kind}</small></div>
                  <code>{money(account.openingBalance)} {movement >= 0 ? "+" : "−"} {money(Math.abs(movement))}</code>
                  <strong className={closing < 0 ? styles.debt : ""}>{money(closing)}</strong>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.oceanPanel} aria-labelledby="finance-category-title">
          <div className={styles.panelTitle}><div><span>ELIGIBLE OUTFLOWS ONLY</span><h3 id="finance-category-title">Category mix</h3></div></div>
          <div className={styles.categoryBars}>
            {categorySpend.slice(0, 6).map((item) => (
              <div key={item.category}>
                <span>{item.category}</span>
                <div><i style={{ width: `${(item.amount / maxCategory) * 100}%` }} /></div>
                <strong>{money(item.amount)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function LedgerView({ rangeLedger, defaultTransfers, anomalies }: {
  rangeLedger: LedgerTransaction[];
  defaultTransfers: TransferMatch[];
  anomalies: Anomaly[];
}) {
  const [category, setCategory] = useState<"all" | Category>("all");
  const [mode, setMode] = useState<"all" | "household" | "excluded">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(rangeLedger[0]?.id ?? LEDGER[0].id);
  const transferIds = useMemo(() => new Map(defaultTransfers.flatMap((match) => [
    [match.out.id, match.id] as const,
    [match.incoming.id, match.id] as const,
  ])), [defaultTransfers]);
  const anomalyReasons = useMemo(() => anomalyReasonMap(anomalies), [anomalies]);
  const cleanQuery = query.trim().toLocaleLowerCase();
  const filtered = rangeLedger.filter((transaction) => (
    (category === "all" || transaction.category === category)
    && (mode === "all" || (mode === "household" ? householdEligible(transaction) : !householdEligible(transaction)))
    && (!cleanQuery || `${transaction.description} ${transaction.category} ${accountFor(transaction.accountId).label}`.toLocaleLowerCase().includes(cleanQuery))
  ));
  const selected = rangeLedger.find((transaction) => transaction.id === selectedId) ?? filtered[0] ?? rangeLedger[0];
  const filteredIncome = roundMoney(filtered.filter((transaction) => householdEligible(transaction) && transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0));
  const filteredSpend = roundMoney(Math.abs(filtered.filter((transaction) => householdEligible(transaction) && transaction.amount < 0).reduce((sum, transaction) => sum + transaction.amount, 0)));

  return (
    <div className={styles.ledgerLayout}>
      <section className={`${styles.oceanPanel} ${styles.ledgerPanel}`} aria-labelledby="finance-ledger-title">
        <div className={styles.panelTitle}>
          <div><span>NORMALISED TRANSACTION GRAIN</span><h3 id="finance-ledger-title">Synthetic ledger</h3></div>
          <span className={styles.rowCount}>{filtered.length}/{rangeLedger.length} rows</span>
        </div>
        <div className={styles.ledgerFilters}>
          <label><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Merchant, category, account…" /></label>
          <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as "all" | Category)}><option value="all">All categories</option>{CATEGORY_ORDER.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label><span>Budget treatment</span><select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="all">All rows</option><option value="household">Household cash flow</option><option value="excluded">Transfers + investment churn</option></select></label>
        </div>
        <div className={styles.ledgerTableWrap}>
          <table className={styles.ledgerTable}>
            <thead><tr><th>Date</th><th>Account</th><th>Description</th><th>Category</th><th>Model</th><th>Amount</th></tr></thead>
            <tbody>
              {filtered.map((transaction) => {
                const isSelected = selected?.id === transaction.id;
                return (
                  <tr key={transaction.id} className={isSelected ? styles.selectedRow : ""}>
                    <td>{shortDate(transaction.date)}</td>
                    <td>{accountFor(transaction.accountId).shortLabel}</td>
                    <td><button type="button" onClick={() => setSelectedId(transaction.id)} aria-pressed={isSelected}><strong>{transaction.merchant}</strong><small>{transaction.description}</small></button></td>
                    <td><span className={styles.categoryPill}>{transaction.category}</span></td>
                    <td><span className={householdEligible(transaction) ? styles.cashflowPill : styles.excludePill}>{householdEligible(transaction) ? "CASH FLOW" : "EXCLUDED"}</span></td>
                    <td className={transaction.amount >= 0 ? styles.amountIn : styles.amountOut}>{money(transaction.amount, true)}</td>
                  </tr>
                );
              })}
              {!filtered.length && <tr><td colSpan={6} className={styles.emptyState}>No rows match this query.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className={styles.ledgerTotals}>
          <span>Filtered household income <strong>{money(filteredIncome)}</strong></span>
          <span>Filtered household spend <strong>{money(filteredSpend)}</strong></span>
          <span>Net <strong>{money(filteredIncome - filteredSpend, true)}</strong></span>
        </div>
      </section>

      <aside className={`${styles.oceanPanel} ${styles.inspector}`} aria-live="polite">
        <div className={styles.panelTitle}><div><span>WHY THIS ROW?</span><h3>Transaction trace</h3></div></div>
        {selected ? (
          <div className={styles.inspectorBody}>
            <div className={styles.inspectAmount}><span>{shortDate(selected.date)} · {accountFor(selected.accountId).label}</span><strong className={selected.amount >= 0 ? styles.amountIn : styles.amountOut}>{money(selected.amount, true)}</strong></div>
            <dl>
              <div><dt>Normalised merchant</dt><dd>{selected.merchant}</dd></div>
              <div><dt>Category</dt><dd>{selected.category} <span>{selected.confidence}% · {selected.categorySource}</span></dd></div>
              <div><dt>Budget treatment</dt><dd>{sourceStatus(selected)}</dd></div>
              <div><dt>Transfer group</dt><dd>{transferIds.get(selected.id) ?? "Not matched"}</dd></div>
              <div><dt>Anomaly evidence</dt><dd>{anomalyReasons.get(selected.id)?.join("; ") ?? "No flag at selected threshold"}</dd></div>
            </dl>
            <div className={styles.signatureBox}><span>DEDUPE INPUT SHAPE</span><code>{dedupeShape(selected)}</code><p>Provider transaction ID wins when supplied; otherwise the source engine hashes this content plus the within-statement occurrence index.</p></div>
          </div>
        ) : <p className={styles.emptyState}>Select a transaction.</p>}
      </aside>
    </div>
  );
}

function RecurringView() {
  const [config, setConfig] = useState<RecurringConfig>({ minOccurrences: 3, regularity: 0.5, priceThreshold: 0.3, monthlyTolerance: 5 });
  const patterns = useMemo(() => detectRecurring(LEDGER, config), [config]);
  const monthlyTotal = roundMoney(patterns.reduce((sum, pattern) => sum + pattern.monthlyCost, 0));

  return (
    <>
      <div className={styles.modelWorkbench}>
        <section className={`${styles.oceanPanel} ${styles.controlPanel}`} aria-labelledby="recurring-controls-title">
          <div className={styles.panelTitle}><div><span>LIVE PARAMETERS</span><h3 id="recurring-controls-title">Cadence detector</h3></div><button type="button" onClick={() => setConfig({ minOccurrences: 3, regularity: 0.5, priceThreshold: 0.3, monthlyTolerance: 5 })}>Reset</button></div>
          <div className={styles.parameterGrid}>
            <label><span>Minimum occurrences <strong>{config.minOccurrences}</strong></span><input type="range" min={2} max={5} step={1} value={config.minOccurrences} onChange={(event) => setConfig((current) => ({ ...current, minOccurrences: Number(event.target.value) }))} /></label>
            <label><span>Required regularity <strong>{percentage(config.regularity)}</strong></span><input type="range" min={0.35} max={0.85} step={0.15} value={config.regularity} onChange={(event) => setConfig((current) => ({ ...current, regularity: Number(event.target.value) }))} /></label>
            <label><span>Price-change threshold <strong>{percentage(config.priceThreshold)}</strong></span><input type="range" min={0.1} max={0.5} step={0.1} value={config.priceThreshold} onChange={(event) => setConfig((current) => ({ ...current, priceThreshold: Number(event.target.value) }))} /></label>
            <label><span>Monthly tolerance <strong>±{config.monthlyTolerance} days</strong></span><input type="range" min={1} max={10} step={1} value={config.monthlyTolerance} onChange={(event) => setConfig((current) => ({ ...current, monthlyTolerance: Number(event.target.value) }))} /></label>
          </div>
          <p className={styles.methodNote}>Outgoing rows group by normalised merchant. Median day gaps map to weekly, fortnightly, monthly, bi-monthly, quarterly or annual centres; irregular groups are rejected.</p>
        </section>

        <div className={styles.patternMetrics}>
          <MetricCard label="PATTERNS" value={patterns.length.toString()} note="90-day synthetic corpus" tone="teal" />
          <MetricCard label="MONTHLY EQUIVALENT" value={money(monthlyTotal)} note="Σ typical × 30.4 / cadence" tone="negative" />
          <MetricCard label="PRICE CHANGES" value={patterns.filter((pattern) => pattern.status === "price_change").length.toString()} note={`Recent median differs > ${percentage(config.priceThreshold)}`} />
        </div>
      </div>

      <section className={styles.oceanPanel} aria-labelledby="patterns-table-title">
        <div className={styles.panelTitle}><div><span>EXPLAINABLE RESULT SET</span><h3 id="patterns-table-title">Recurring candidates</h3></div><span className={styles.rowCount}>{patterns.length} pass</span></div>
        <div className={styles.patternTableWrap}>
          <table className={styles.patternTable}>
            <thead><tr><th>Merchant</th><th>Category</th><th>Cadence</th><th>Median gap</th><th>Typical</th><th>Monthly equivalent</th><th>Evidence</th><th>Status</th></tr></thead>
            <tbody>
              {patterns.map((pattern) => (
                <tr key={pattern.merchant}>
                  <td><strong>{pattern.merchant}</strong></td>
                  <td>{pattern.category}</td>
                  <td><span className={styles.cadencePill}>{pattern.cadence}</span></td>
                  <td>{pattern.cadenceDays}d</td>
                  <td>{money(pattern.typicalAmount)}</td>
                  <td className={styles.amountOut}>{money(pattern.monthlyCost)}</td>
                  <td>{pattern.occurrences}× · {percentage(pattern.regularity)}</td>
                  <td><span className={pattern.status === "price_change" ? styles.priceChange : styles.activePattern}>{pattern.status === "price_change" ? "PRICE CHANGE" : "ACTIVE"}</span></td>
                </tr>
              ))}
              {!patterns.length && <tr><td colSpan={8} className={styles.emptyState}>No candidates pass these settings. Loosen the cadence tolerance or evidence thresholds.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function TransfersView() {
  const [windowDays, setWindowDays] = useState(3);
  const [requireEvidence, setRequireEvidence] = useState(false);
  const matches = useMemo(() => matchTransfers(LEDGER, windowDays, requireEvidence), [requireEvidence, windowDays]);
  const totalMoved = roundMoney(matches.reduce((sum, match) => sum + match.amount, 0));
  const maxAmount = Math.max(1, ...matches.map((match) => match.amount));

  return (
    <div className={styles.transferLayout}>
      <section className={`${styles.oceanPanel} ${styles.transferControls}`} aria-labelledby="transfer-model-title">
        <div className={styles.panelTitle}><div><span>CONFIGURABLE PRECISION</span><h3 id="transfer-model-title">Cross-account matcher</h3></div></div>
        <label><span>Date window <strong>±{windowDays} day{windowDays === 1 ? "" : "s"}</strong></span><input type="range" min={0} max={5} step={1} value={windowDays} onChange={(event) => setWindowDays(Number(event.target.value))} /></label>
        <label className={styles.checkControl}><input type="checkbox" checked={requireEvidence} onChange={(event) => setRequireEvidence(event.target.checked)} /><span><strong>Require descriptor evidence</strong><small>Generic “account move”, “funding” or “settlement” tokens. Amount equality remains mandatory.</small></span></label>
        <div className={styles.matchFormula}><span>SCORE</span><code>(10 − |day gap|) + 5 if descriptor evidence</code><p>Greedy one-to-one matching prevents an incoming row from being reused. Same-account pairs are rejected.</p></div>
        <div className={styles.transferMetrics}>
          <div><span>MATCHES</span><strong>{matches.length}</strong></div>
          <div><span>MOVED ONCE</span><strong>{money(totalMoved)}</strong></div>
          <div><span>LEDGER LEGS</span><strong>{matches.length * 2}</strong></div>
        </div>
      </section>

      <section className={styles.oceanPanel} aria-labelledby="transfer-flow-title">
        <div className={styles.panelTitle}><div><span>ROUTE EVIDENCE</span><h3 id="transfer-flow-title">Matched money flows</h3></div><span className={styles.rowCount}>excluded from budget</span></div>
        <div className={styles.transferFlows}>
          {matches.map((match) => (
            <article key={match.id}>
              <div className={styles.transferRoute}>
                <span>{accountFor(match.out.accountId).shortLabel}</span>
                <div><i style={{ width: `${Math.max(12, (match.amount / maxAmount) * 100)}%` }} /><b>→</b></div>
                <span>{accountFor(match.incoming.accountId).shortLabel}</span>
              </div>
              <div className={styles.transferDetail}><strong>{money(match.amount)}</strong><span>{match.days}d gap · score {match.score} · {match.evidence ? "descriptor evidence" : "amount/date only"}</span><code>{match.id}</code></div>
            </article>
          ))}
          {!matches.length && <p className={styles.emptyState}>No pairs pass this configuration.</p>}
        </div>
        <div className={styles.transferFootnote}>Each card represents two ledger rows but counts the moved amount once. The accounting exclusion removes both legs, preventing artificial income and spending.</div>
      </section>
    </div>
  );
}

function ImportView() {
  const [mode, setMode] = useState<"fresh" | "replay">("fresh");
  const [lastRun, setLastRun] = useState<"fresh" | "replay" | null>(null);
  const statements = ACCOUNTS.map((account) => {
    const rows = LEDGER.filter((transaction) => transaction.accountId === account.id);
    const movements = roundMoney(rows.reduce((sum, transaction) => sum + transaction.amount, 0));
    const calculatedClosing = roundMoney(account.openingBalance + movements);
    const declaredClosing = DECLARED_CLOSINGS[account.id];
    return {
      account,
      rows: rows.length,
      movements,
      closing: declaredClosing,
      difference: roundMoney(declaredClosing - calculatedClosing),
    };
  });
  const totalRows = statements.reduce((sum, statement) => sum + statement.rows, 0);
  const committedRows = lastRun === "fresh" ? totalRows : 0;
  const duplicateRows = lastRun === "replay" ? totalRows : 0;
  const bankStatements = statements.filter((statement) => statement.account.kind !== "investment");
  const reconciledBanks = bankStatements.filter((statement) => Math.abs(statement.difference) <= 0.02);

  return (
    <div className={styles.importLayout}>
      <section className={`${styles.oceanPanel} ${styles.pipelinePanel}`} aria-labelledby="pipeline-title">
        <div className={styles.panelTitle}><div><span>LOCAL-FIRST INGESTION</span><h3 id="pipeline-title">Synthetic import run</h3></div></div>
        <div className={styles.importMode}>
          <button type="button" className={mode === "fresh" ? styles.active : ""} onClick={() => setMode("fresh")} aria-pressed={mode === "fresh"}>Fresh batch</button>
          <button type="button" className={mode === "replay" ? styles.active : ""} onClick={() => setMode("replay")} aria-pressed={mode === "replay"}>Exact overlap replay</button>
        </div>
        <button type="button" className={styles.runButton} onClick={() => setLastRun(mode)}>{lastRun ? "Run selected scenario" : "Run synthetic import"}</button>
        <ol className={styles.pipelineSteps}>
          {[
            ["01", "Detect", "PDF/CSV header + first-page structure"],
            ["02", "Parse", "Provider-specific column geometry"],
            ["03", "Reconcile", "Opening + movements = closing"],
            ["04", "De-duplicate", "Provider ID or stable occurrence key"],
            ["05", "Recompute", "Recurring · transfers · anomalies"],
          ].map(([number, title, note]) => (
            <li className={lastRun ? styles.completeStep : ""} key={number}><span>{lastRun ? "✓" : number}</span><div><strong>{title}</strong><small>{note}</small></div></li>
          ))}
        </ol>
        <div className={styles.importReceipt} aria-live="polite">
          <span>{lastRun ? "RUN COMPLETE" : "READY"}</span>
          <strong>{lastRun ? `${committedRows} committed · ${duplicateRows} duplicates skipped` : `${totalRows} safe rows staged`}</strong>
          <p>{lastRun === "replay" ? "An exact replay exercises idempotency: every content key already exists, so totals remain unchanged." : lastRun === "fresh" ? "The fresh path commits every staged synthetic row, then recomputes intelligence." : "Choose a scenario, then run the same detect → parse → reconcile → de-duplicate → recompute pipeline."}</p>
        </div>
      </section>

      <section className={`${styles.oceanPanel} ${styles.auditPanel}`} aria-labelledby="reconciliation-title">
        <div className={styles.panelTitle}><div><span>PENNY-CLOSE CONTROL</span><h3 id="reconciliation-title">Statement reconciliation</h3></div><span className={`${styles.rowCount} ${reconciledBanks.length === bankStatements.length ? styles.pass : styles.fail}`}>{reconciledBanks.length}/{bankStatements.length} pass</span></div>
        <div className={styles.auditTableWrap}>
          <table className={styles.auditTable}>
            <thead><tr><th>Adapter</th><th>Rows</th><th>Opening</th><th>Σ movement</th><th>Closing</th><th>Difference</th><th>Control</th></tr></thead>
            <tbody>
              {statements.map((statement) => (
                <tr key={statement.account.id}>
                  <td><strong>{statement.account.adapter}</strong><small>{statement.account.label}</small></td>
                  <td>{statement.rows}</td>
                  <td>{money(statement.account.openingBalance)}</td>
                  <td className={statement.movements >= 0 ? styles.amountIn : styles.amountOut}>{money(statement.movements, true)}</td>
                  <td>{money(statement.closing)}</td>
                  <td>{money(statement.difference)}</td>
                  <td><span className={Math.abs(statement.difference) <= 0.02 ? styles.auditPass : styles.priceChange}>{statement.account.kind === "investment" ? "CASH LEDGER" : Math.abs(statement.difference) <= 0.02 ? "✓ RECONCILED" : "CHECK"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.auditNotes}>
          <p><strong>Debit / current / joint</strong> use opening + signed row amounts = closing.</p>
          <p><strong>Credit</strong> is normalised for the portfolio so debt is negative; statement debits and credits are verified before that presentation transform.</p>
          <p><strong>Investment CSV</strong> has no carried statement balance. Its closing cash is opening zero or staged cash + signed actions; market holdings are valued separately.</p>
        </div>
      </section>
    </div>
  );
}

export function FinanceStudio() {
  const [view, setView] = useState<ViewId>("overview");
  const [range, setRange] = useState<30 | 90>(90);
  const [accountId, setAccountId] = useState("all");
  const [anomalyThreshold, setAnomalyThreshold] = useState(3);
  const rangeLedger = useMemo(() => LEDGER.filter((transaction) => (
    transaction.age <= range && (accountId === "all" || transaction.accountId === accountId)
  )), [accountId, range]);
  const defaultTransfers = useMemo(() => matchTransfers(LEDGER, 3, false), []);
  const anomalies = useMemo(() => detectAnomalies(rangeLedger, anomalyThreshold), [anomalyThreshold, rangeLedger]);
  const holdingsCost = LEDGER.filter((transaction) => transaction.ticker && transaction.shares && transaction.unitPrice)
    .reduce((sum, transaction) => sum + ((transaction.shares ?? 0) * (transaction.unitPrice ?? 0)), 0);
  const holdingsValue = LEDGER.filter((transaction) => transaction.ticker && transaction.shares)
    .reduce((sum, transaction) => sum + ((transaction.shares ?? 0) * (HOLDING_PRICES.find((holding) => holding.ticker === transaction.ticker)?.price ?? 0)), 0);

  return (
    <DemoWindow
      appName="Finance App — Ocean Depths"
      title="Bank Statement Intelligence Control Room"
      status="SYNTHETIC · LOCAL-FIRST"
      statusTone="safe"
      className={styles.financeStudio}
      footer={
        <>
          <span>{LEDGER.length} invented ledger rows · {ACCOUNTS.length} fictional accounts · no file access</span>
          <span>Holdings: cost {money(holdingsCost)} · marked {money(holdingsValue)} · P/L {money(holdingsValue - holdingsCost, true)}</span>
        </>
      }
    >
      <div className={styles.privacyBanner} role="note">
        <span aria-hidden="true">◈</span>
        <div><strong>Portfolio-safe simulation, production-shaped logic</strong><p>Every account, merchant, date, amount and holding is invented. The interactions mirror the local parser, reconciliation, de-duplication and intelligence architecture without loading statement files or a database.</p></div>
        <code>PDF / CSV → SQLite → FastAPI → React</code>
      </div>

      <section className={styles.sourceScale} aria-labelledby="finance-source-scale-title">
        <div>
          <span>SOURCE SNAPSHOT / SAFE AGGREGATES</span>
          <h3 id="finance-source-scale-title">What the private application had to reconcile</h3>
          <p>These counts come from the audited handover. The interactive ledger below is a smaller fictional fixture so no financial row or identifier is published.</p>
        </div>
        <dl>
          <div><dt>Transactions</dt><dd>3,875</dd></div>
          <div><dt>Accounts</dt><dd>6</dd></div>
          <div><dt>Statements reconciled</dt><dd>67 / 67</dd></div>
          <div><dt>Recurring patterns</dt><dd>36</dd></div>
          <div><dt>Transfer groups</dt><dd>100</dd></div>
          <div><dt>Anomaly records</dt><dd>122</dd></div>
        </dl>
      </section>

      <nav className={styles.viewTabs} aria-label="Finance intelligence views">
        {VIEWS.map((item) => (
          <button type="button" key={item.id} className={view === item.id ? styles.activeView : ""} onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined}>
            <strong>{item.label}</strong><span>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className={styles.oceanCanvas}>
        {(view === "overview" || view === "ledger") && (
          <ScopeControls range={range} setRange={setRange} accountId={accountId} setAccountId={setAccountId} />
        )}
        {view === "ledger" && (
          <div className={styles.thresholdStrip}>
            <span>Category anomaly threshold</span>
            {[2, 3, 4].map((threshold) => <button type="button" key={threshold} className={anomalyThreshold === threshold ? styles.active : ""} onClick={() => setAnomalyThreshold(threshold)} aria-pressed={anomalyThreshold === threshold}>{threshold}σ</button>)}
            <small>{anomalies.length} row{anomalies.length === 1 ? "" : "s"} flagged, including duplicate evidence</small>
          </div>
        )}
        {view === "overview" && <OverviewView range={range} accountId={accountId} rangeLedger={rangeLedger} allTransfers={defaultTransfers} anomalies={anomalies} />}
        {view === "ledger" && <LedgerView key={`${range}-${accountId}`} rangeLedger={rangeLedger} defaultTransfers={defaultTransfers} anomalies={anomalies} />}
        {view === "recurring" && <RecurringView />}
        {view === "transfers" && <TransfersView />}
        {view === "import" && <ImportView />}
      </div>
    </DemoWindow>
  );
}

export default FinanceStudio;
