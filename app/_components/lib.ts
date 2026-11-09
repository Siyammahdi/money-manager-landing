export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Taka per US dollar, same ballpark the app's sample data uses. */
export const RATE = 122;

/** Hero entrance waits for the preloader curtain to lift. */
export const INTRO_DELAY = 1.7;

export type Currency = "BDT" | "USD";

/** Lakh/crore grouping, e.g. 1726939 → "17,26,939". Done by hand so server and browser agree. */
function groupIndian(n: number) {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

function groupWestern(n: number, decimals: number) {
  const [int, frac] = n.toFixed(decimals).split(".");
  const g = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${g}.${frac}` : g;
}

/** Amount stored in taka, shown in either currency. */
export function money(bdt: number, currency: Currency = "BDT", sign?: "+" | "-") {
  const abs = Math.abs(bdt);
  const body =
    currency === "BDT" ? `৳${groupIndian(abs)}` : `$${groupWestern(abs / RATE, abs / RATE >= 1000 ? 0 : 2)}`;
  const s = sign ?? (bdt < 0 ? "-" : "");
  return `${s === "-" ? "−" : s}${body}`;
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type AccountColor = "ink" | "lime" | "sage" | "sky" | "lilac" | "sand" | "coral";

/** Same card palette as the app (src/lib/accounts.ts). */
export const ACCOUNT_COLORS: Record<AccountColor, { bg: string; fg: string; muted: string; chip: string }> = {
  ink: { bg: "#15180F", fg: "#F4F7EC", muted: "#A0A794", chip: "rgba(255,255,255,0.10)" },
  lime: { bg: "#D4F25C", fg: "#11140D", muted: "#4D5A1A", chip: "rgba(17,20,13,0.08)" },
  sage: { bg: "#CFE5D6", fg: "#11140D", muted: "#46604F", chip: "rgba(17,20,13,0.07)" },
  sky: { bg: "#D2E3F7", fg: "#11140D", muted: "#475C77", chip: "rgba(17,20,13,0.07)" },
  lilac: { bg: "#E3DAF7", fg: "#11140D", muted: "#5D5277", chip: "rgba(17,20,13,0.07)" },
  sand: { bg: "#F3E5CB", fg: "#11140D", muted: "#6E5E40", chip: "rgba(17,20,13,0.07)" },
  coral: { bg: "#F8D5C8", fg: "#11140D", muted: "#7A5143", chip: "rgba(17,20,13,0.07)" },
};

export type Pattern = "waves" | "orbs" | "stripes" | "rings" | "dots" | "arc";
export type AccountKind = "cash" | "bank" | "wallet" | "card" | "savings";

export type DemoAccount = {
  id: string;
  name: string;
  kind: AccountKind;
  currency: Currency;
  color: AccountColor;
  pattern: Pattern;
  balance: number;
  /** Overrides the kind's default icon. */
  icon?: string;
};

export const ACCOUNTS: DemoAccount[] = [
  { id: "cash", name: "Petty cash", kind: "cash", currency: "BDT", color: "lime", pattern: "arc", balance: 115896 },
  { id: "city", name: "City Bank", kind: "bank", currency: "BDT", color: "ink", pattern: "stripes", balance: 1255808 },
  { id: "bkash", name: "bKash", kind: "wallet", currency: "BDT", color: "coral", pattern: "orbs", balance: 48230 },
  { id: "payoneer", name: "Payoneer", kind: "wallet", currency: "USD", color: "sky", pattern: "rings", balance: 268400 },
  { id: "card", name: "Business card", kind: "card", currency: "BDT", color: "lilac", pattern: "dots", balance: 38605 },
];

export type TxType = "income" | "expense" | "transfer";

export type DemoTx = {
  id: string;
  title: string;
  sub: string;
  type: TxType;
  amount: number;
  icon: string;
  usd?: boolean;
  due?: string;
  repeat?: boolean;
};

export const RECENT: DemoTx[] = [
  { id: "t1", title: "Northwind Labs", sub: "Client Project · City Bank", type: "income", amount: 256200, icon: "briefcase", usd: true },
  { id: "t2", title: "Adobe Creative Cloud", sub: "Software · Business card", type: "expense", amount: 17080, icon: "cpu", usd: true, repeat: true },
  { id: "t3", title: "City Bank → Cash", sub: "Transfer", type: "transfer", amount: 15000, icon: "swap" },
  { id: "t4", title: "Lumen Studio", sub: "Consulting · City Bank", type: "income", amount: 92700, icon: "chat", due: "Due 15 Nov" },
  { id: "t5", title: "Link3 Internet", sub: "Utilities · bKash", type: "expense", amount: 1600, icon: "lightning", repeat: true },
];
