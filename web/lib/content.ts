export type Setup = {
  id: string;
  label: string;
  prompt: string;
  name: string;
  sites: string[];
  store: string[] | null;
  ops: string[] | null;
};

// Example businesses for the hero demo. None of these are real customers.
export const setups: Setup[] = [
  {
    id: "bakery",
    label: "Bakery",
    prompt: "I run a bakery in Nakuru. We take custom cake orders and deliver.",
    name: "Tamu Bakes",
    sites: ["Home page", "Cake menu", "Custom cake orders", "Find us and contact"],
    store: ["Cake packages by size", "M-Pesa checkout", "Delivery zones and fees", "Order list"],
    ops: ["Recipes with ingredient costs", "Flour, sugar and butter stock", "Packaging", "Suppliers", "Daily sales"],
  },
  {
    id: "blog",
    label: "Sports blog",
    prompt: "I write a football blog with two other writers and a weekly newsletter.",
    name: "Touchline KE",
    sites: ["Home page", "Match reports", "Authors, with a field per writer", "Fixtures and results", "Newsletter sign-up"],
    store: null,
    ops: null,
  },
  {
    id: "news",
    label: "Newsroom",
    prompt: "We are a county newsroom with forty reporters and editors.",
    name: "The County Dispatch",
    sites: ["Front page and sections", "Reporter profiles", "Careers, with open positions", "Editor approval before publishing", "Scheduled publishing", "Newsletter sign-up"],
    store: null,
    ops: null,
  },
  {
    id: "merch",
    label: "Band with merch",
    prompt: "We are a band. We need a site for tour dates and a place to sell T-shirts.",
    name: "Mawingu Sound",
    sites: ["Home page", "Tour dates", "Gallery", "Mailing list sign-up"],
    store: ["T-shirts with sizes and colours", "M-Pesa checkout", "Order list", "Stock count per size"],
    ops: null,
  },
  {
    id: "butchery",
    label: "Butchery",
    prompt: "I own a butchery. We buy whole carcasses and sell cuts by the kilo.",
    name: "Kwa Otis Butchery",
    sites: ["Home page", "Price list per kilo", "Find us and contact"],
    store: ["Order ahead for pickup", "M-Pesa checkout", "Point of sale at the counter"],
    ops: ["Cut-ups from a carcass into cuts", "Stock by weight", "Suppliers and purchases", "Point of sale", "Daily sales"],
  },
];

export type Tier = {
  id: "starter" | "pro" | "business";
  name: string;
  monthly: number;
  blurb: string;
  limits: { label: string; value: string }[];
};

// Prices are set by Nexus Labs (KES per month). Every plan has every service;
// plans differ by usage limits. The limits are proposals, not final.
export const YEARLY_DISCOUNT = 0.25;

const limits = (v: string[]) =>
  ["File library", "AI credits a month", "Newsletter subscribers", "Emails a month", "Orders a month", "Sales points"].map((label, i) => ({ label, value: v[i] }));

export const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 1500,
    blurb: "For getting set up and running day to day.",
    limits: limits(["10 GB", "250", "500", "2,500", "200", "1"]),
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 5000,
    blurb: "For a growing audience, a busier shop and regular redesigns.",
    limits: limits(["50 GB", "1,000", "5,000", "25,000", "2,000", "3"]),
  },
  {
    id: "business",
    name: "Business",
    monthly: 9000,
    blurb: "For newsrooms, large mailing lists and shops with several counters.",
    limits: limits(["150 GB", "2,000", "25,000", "100,000", "10,000", "10"]),
  },
];

// Included on every plan.
export const included: { group: string; items: string[] }[] = [
  { group: "AI builder", items: ["Builds from a description of your business", "Copies the look of a site you share", "Posters, PDFs and documents in your brand"] },
  { group: "Sites", items: ["Website designed for your business", "Content sections with your own fields", "Forms and newsletter list", "Custom domain"] },
  { group: "Store", items: ["Catalogue with sizes and options", "M-Pesa checkout", "Point of sale", "Orders and stock counts"] },
  { group: "Operations", items: ["Purchases, suppliers and expenses", "Recipes, production and packaging", "Books", "KRA eTIMS, in development"] },
];

export type Palette = { bg: string; ink: string; accent: string; soft: string };

// Example businesses. Each one is a ready-made brief for the chat.
export const cases: { id: string; name: string; about: string; brief: string; variant: "barber" | "bakery" | "news" | "band"; palette: Palette }[] = [
  {
    id: "barbershop",
    name: "Barbershop",
    about: "Online booking, a price list and a shop for grooming products.",
    brief: "I run a barbershop in Nairobi. Customers book online and I sell grooming products.",
    variant: "barber",
    palette: { bg: "#ffffff", ink: "#111214", accent: "#d62839", soft: "#e9ebef" },
  },
  {
    id: "bakery",
    name: "Bakery",
    about: "Cake orders by size, delivery zones and M-Pesa checkout.",
    brief: "I bake custom cakes in Nakuru. People order online and I deliver.",
    variant: "bakery",
    palette: { bg: "#fff1f4", ink: "#3b1f1a", accent: "#e8577a", soft: "#fbd9e1" },
  },
  {
    id: "blog",
    name: "Sports blog",
    about: "Several writers, match reports and a weekly newsletter.",
    brief: "I write a football blog with two other writers and a weekly newsletter.",
    variant: "news",
    palette: { bg: "#ffffff", ink: "#0f172a", accent: "#2563eb", soft: "#e2e8f0" },
  },
  {
    id: "band",
    name: "Band with merch",
    about: "Tour dates, a gallery and a store for T-shirts.",
    brief: "We are a band. We need a site for tour dates and a store for T-shirts.",
    variant: "band",
    palette: { bg: "#1b1230", ink: "#f4efff", accent: "#f97316", soft: "#2d2150" },
  },
];
