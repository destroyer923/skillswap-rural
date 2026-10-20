export const CATEGORIES = [
  "Agriculture",
  "Food & Beverage",
  "Design & Creative",
  "Marketing",
  "Web & Tech",
  "Handicrafts",
  "Photography",
  "Education & Training",
  "Finance & Accounting",
  "Other",
] as const;

/** What is being exchanged. */
export const KINDS = ["skill", "service", "resource"] as const;
export type Kind = (typeof KINDS)[number];

export const KIND_LABEL: Record<string, string> = {
  skill: "Skill / knowledge",
  service: "Service",
  resource: "Resource / product",
};

export const KIND_EMOJI: Record<string, string> = {
  skill: "🧠",
  service: "🛠️",
  resource: "📦",
};

/** How the exchange is settled — the platform is built around trading, not paying. */
export const EXCHANGE_TYPES = ["barter", "free", "paid"] as const;
export type ExchangeType = (typeof EXCHANGE_TYPES)[number];

export const EXCHANGE_LABEL: Record<string, string> = {
  barter: "🔄 Barter — skill for skill",
  free: "🎁 Free / community help",
  paid: "💰 Paid work",
};

export const EXCHANGE_SHORT: Record<string, string> = {
  barter: "🔄 Barter",
  free: "🎁 Free",
  paid: "💰 Paid",
};
