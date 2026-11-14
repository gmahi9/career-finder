const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const count = new Intl.NumberFormat("en-US");

export function formatPay(value: number): string {
  return money.format(value);
}

export function formatCount(value: number): string {
  return count.format(value);
}

export function formatGrowth(percent: number, label: string): string {
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}% (${label})`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  tech: "Technology",
  trades: "Skilled trades",
  healthcare: "Healthcare",
  construction: "Construction",
  finance: "Finance",
  sales: "Sales",
  education: "Education",
  "public-safety": "Public safety",
  logistics: "Logistics",
  engineering: "Engineering",
  business: "Business",
  design: "Design",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export const EDUCATION_LABELS = {
  none: "No further schooling",
  certificate: "Certificate",
  apprenticeship: "Apprenticeship",
  associate: "Associate degree",
  bachelor: "Bachelor's degree",
  advanced: "Advanced degree",
} as const;
