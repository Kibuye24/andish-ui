// Dummy forms for the studio prototype. Each one is described as data and
// rendered by components/studio/FormPanel.tsx. Nothing is sent anywhere: a
// submit changes the example data on screen so the result can be seen.

import { resources, type Booking, type FileNode } from "./studio-data";

export type Value = string | boolean | string[] | File[];
export type Values = Record<string, Value>;

/** What a form can read from the rest of the studio. */
export type FormCtx = { bookings: Booking[]; folders: string[] };

type Common = { label: string; hint?: string; required?: boolean; half?: boolean; showIf?: (v: Values) => boolean };
type Named = Common & { name: string };

export type Field =
  | (Named & { kind: "text" | "phone" | "email" | "number" | "date" | "time"; placeholder?: string; prefix?: string; suffix?: string })
  | (Named & { kind: "money" | "textarea"; placeholder?: string })
  | (Named & { kind: "select"; options: string[] | ((c: FormCtx) => string[]) })
  | (Named & { kind: "pills" | "multi"; options: string[] })
  | (Named & { kind: "toggle" })
  | (Named & { kind: "file"; multiple?: boolean; accept?: string })
  | { kind: "heading"; label: string; showIf?: (v: Values) => boolean }
  | { kind: "note"; text: string; showIf?: (v: Values) => boolean };

export type FormDef = {
  title: string;
  blurb?: string;
  submit: string;
  /** The confirmation shown after saving. */
  done: (v: Values) => string;
  fields: Field[];
  initial?: Values;
  /** Extra checks beyond "required". Returns an error message per field name. */
  validate?: (v: Values, c: FormCtx) => Record<string, string>;
  /** Changes the rows of the list this form was opened from. */
  apply?: (rows: string[][], v: Values) => string[][];
  /** Changes something other than a list's rows. */
  effect?: "booking" | "upload" | "folder" | "page";
};

/* ───────── helpers ───────── */

const num = (v: Value | undefined) => Number(String(v ?? "").replace(/[^0-9.]/g, "")) || 0;
const text = (v: Values, key: string) => String(v[key] ?? "").trim();
export const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
const money = (v: Values, key: string) => kes(num(v[key]));
/** One error for one field, or none when the check passed. */
const only = (name: string, message: string | false): Record<string, string> => (message ? { [name]: message } : {});
const prepend = (row: string[]) => (rows: string[][]) => [row, ...rows];
const nextNumber = (rows: string[][]) => Math.max(0, ...rows.map((r) => Number(r[0].replace(/\D/g, "")) || 0)) + 1;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const phoneOk = (s: string) => /^\+?[0-9 ]{9,16}$/.test(s.trim());
const emailOk = (s: string) => /^\S+@\S+\.\S+$/.test(s.trim());

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-17" becomes "Sat 17 Oct". */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${DAYS[new Date(y, m - 1, d).getDay()]} ${d} ${MONTHS[m - 1]}`;
}

export function sizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/* ───────── services, shared by the booking and order forms ───────── */

const serviceMenu = [
  { name: "Haircut", mins: 30, price: 500 },
  { name: "Beard trim", mins: 20, price: 300 },
  { name: "Haircut and beard", mins: 45, price: 800 },
  { name: "Kids cut", mins: 30, price: 350 },
  { name: "Hot towel shave", mins: 30, price: 800 },
  { name: "Hot towel shave and haircut", mins: 60, price: 1300 },
];
const serviceLabel = (s: (typeof serviceMenu)[number]) => `${s.name} (${s.mins} min, ${kes(s.price)})`;
const serviceOptions = serviceMenu.map(serviceLabel);
const serviceFromLabel = (label: string) => serviceMenu.find((s) => serviceLabel(s) === label);

const productOptions = ["Beard oil 30 ml, KES 1,200", "Beard oil 60 ml, KES 1,900", "Matte pomade, KES 1,400", "Comb set, KES 900"];
const stockItems = ["Beard oil 30 ml", "Beard oil 60 ml", "Matte pomade", "Comb set, Black", "Aftershave balm"];

/** Turns a submitted booking form into a booking for today's calendar. */
export function bookingFrom(v: Values, existing: Booking[]): Booking {
  const svc = serviceFromLabel(String(v.service))!;
  const who = resources.find((r) => r.name === v.with)!;
  const waiting = v.payment === "Waiting for the deposit";
  const last = Math.max(...existing.map((b) => Number(b.ref.slice(3)) || 0));
  return {
    id: `b-new-${last + 1}`,
    ref: `BK-${last + 1}`,
    start: String(v.time),
    mins: svc.mins,
    resource: who.id,
    customer: text(v, "customer"),
    phone: text(v, "phone"),
    service: svc.name,
    price: svc.price,
    status: waiting ? "Pending" : "Confirmed",
    payment: waiting ? "Deposit not paid yet" : String(v.payment),
    note: text(v, "note") || undefined,
  };
}

/** Turns an uploaded file into an entry the file explorer can show. */
export function fileNodeFrom(file: File, parent: string | null, seq: number): FileNode {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const kind: FileNode["kind"] = /^(jpe?g|png|webp|gif|svg|avif)$/.test(ext) ? "image" : ext === "pdf" ? "pdf" : "doc";
  let hash = 0;
  for (const ch of file.name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return {
    id: `up-${seq}-${file.name}`,
    name: file.name,
    kind,
    parent,
    size: sizeLabel(file.size),
    modified: "Just now",
    usedIn: "Not used on the site",
    source: "Uploaded",
    hue: hash,
  };
}

/* ───────── the forms ───────── */

const exportFields: Field[] = [
  { kind: "select", name: "period", label: "Period", options: ["Last 7 days", "Last 30 days", "All time"] },
  { kind: "pills", name: "format", label: "File type", options: ["CSV", "Excel"] },
];

export const forms: Record<string, FormDef> = {
  "bookings/list": {
    title: "New booking",
    blurb: "For a walk-in or a phone call. It goes on today's calendar.",
    submit: "Add booking",
    effect: "booking",
    initial: { service: serviceOptions[0], with: "Kevin", time: "14:30", payment: "Pays at the shop" },
    fields: [
      { kind: "heading", label: "Customer" },
      { kind: "text", name: "customer", label: "Name", required: true, placeholder: "Daniel Otieno" },
      { kind: "phone", name: "phone", label: "Phone", required: true, placeholder: "0700 000 000", hint: "Used for reminders." },
      { kind: "heading", label: "Appointment" },
      { kind: "select", name: "service", label: "Service", required: true, options: serviceOptions },
      { kind: "select", name: "with", label: "With", required: true, half: true, options: resources.map((r) => r.name) },
      { kind: "time", name: "time", label: "Starts at", required: true, half: true },
      { kind: "select", name: "payment", label: "Payment", options: ["Pays at the shop", "Waiting for the deposit", "Deposit of KES 200 paid by M-Pesa", "Paid in full, cash"] },
      { kind: "textarea", name: "note", label: "Note", placeholder: "Prefers a low fade" },
    ],
    validate: (v, c) => {
      const e: Record<string, string> = {};
      if (text(v, "phone") && !phoneOk(text(v, "phone"))) e.phone = "Enter a phone number like 0700 000 000.";
      const svc = serviceFromLabel(String(v.service));
      const who = resources.find((r) => r.name === v.with);
      const at = text(v, "time");
      if (svc && who && at) {
        const start = toMin(at);
        const end = start + svc.mins;
        if (start < 9 * 60 || end > 18 * 60) {
          e.time = "The shop takes bookings from 09:00 to 18:00. This one would run outside that.";
        } else {
          const clash = c.bookings.find((b) => b.resource === who.id && b.status !== "Cancelled" && start < toMin(b.start) + b.mins && toMin(b.start) < end);
          if (clash) e.time = `${who.name} is booked from ${clash.start} to ${clock(toMin(clash.start) + clash.mins)} with ${clash.customer}. Pick another time or barber.`;
        }
      }
      return e;
    },
    done: (v) => `Booking added for ${text(v, "customer")} at ${v.time} with ${v.with}.`,
  },

  "bookings/services": {
    title: "New service",
    blurb: "What customers can book, and what it costs.",
    submit: "Add service",
    fields: [
      { kind: "text", name: "name", label: "Name", required: true, placeholder: "Hot towel shave" },
      { kind: "select", name: "length", label: "Length", half: true, options: ["15 min", "20 min", "30 min", "45 min", "60 min", "90 min"] },
      { kind: "money", name: "price", label: "Price", required: true, half: true, placeholder: "800" },
      { kind: "money", name: "deposit", label: "Deposit", half: true, hint: "Held when a customer books. Leave empty for none." },
      { kind: "select", name: "needs", label: "Needs", half: true, options: ["1 barber", "1 barber, 1 shaving chair"] },
      { kind: "text", name: "addons", label: "Add-ons", placeholder: "Wash, face mask", hint: "Separate with commas." },
      { kind: "textarea", name: "about", label: "Description", placeholder: "Shown on the booking page." },
    ],
    apply: (rows, v) => prepend([text(v, "name"), String(v.length), money(v, "price"), text(v, "addons") || "None", String(v.needs), text(v, "deposit") ? money(v, "deposit") : "None"])(rows),
    done: (v) => `${text(v, "name")} added to your services.`,
  },

  "bookings/resources": {
    title: "Add staff or resource",
    blurb: "Anything a customer can be booked with.",
    submit: "Add",
    initial: { kind: "Person", hours: "Mon to Sat, 09:00 to 18:00", login: "No login" },
    fields: [
      { kind: "pills", name: "kind", label: "Kind", options: ["Person", "Room", "Equipment"] },
      { kind: "text", name: "name", label: "Name", required: true, placeholder: "Kevin" },
      { kind: "multi", name: "does", label: "Can do", hint: "Pick none for all services.", options: serviceMenu.map((s) => s.name) },
      { kind: "select", name: "hours", label: "Working hours", options: ["Mon to Sat, 09:00 to 18:00", "Tue to Sun, 09:00 to 18:00", "Mon to Fri, 09:00 to 17:00", "Same as the shop"] },
      { kind: "select", name: "login", label: "Workspace login", showIf: (v) => v.kind === "Person", options: ["No login", "Wanjiku N.", "Kevin M.", "Achieng O."] },
      { kind: "note", text: "Linking a login lets that person see only their own bookings. This is proposed and not built yet.", showIf: (v) => v.kind === "Person" },
    ],
    apply: (rows, v) => {
      const does = (v.does as string[]).length ? (v.does as string[]).join(", ") : "All services";
      const linked = v.kind === "Person" && v.login !== "No login";
      return prepend([text(v, "name"), String(v.kind), does, String(v.hours), linked ? `Linked to ${v.login}` : v.kind === "Person" ? "No login" : "Not a person"])(rows);
    },
    done: (v) => `${text(v, "name")} added. Customers can now be booked with them.`,
  },

  "bookings/sessions": {
    title: "New session",
    blurb: "A class, workshop or group booking with a set number of places.",
    submit: "Add session",
    initial: { repeats: "Once", date: "2026-10-17", time: "10:00", places: "10" },
    fields: [
      { kind: "text", name: "name", label: "Name", required: true, placeholder: "Barbering basics class" },
      { kind: "select", name: "repeats", label: "Repeats", options: ["Once", "Every week", "Every month"] },
      { kind: "date", name: "date", label: "First date", required: true, half: true },
      { kind: "time", name: "time", label: "Starts at", required: true, half: true },
      { kind: "number", name: "places", label: "Places", required: true, half: true },
      { kind: "money", name: "price", label: "Price per place", half: true },
    ],
    apply: (rows, v) => prepend([text(v, "name"), String(v.repeats === "Once" ? "Once" : v.repeats), `${fmtDate(String(v.date))}, ${v.time}`, String(num(v.places)), "0", "Open"])(rows),
    done: (v) => `${text(v, "name")} scheduled for ${fmtDate(String(v.date))}.`,
  },

  "store/orders": {
    title: "New order",
    blurb: "For a sale taken at the counter or over the phone.",
    submit: "Create order",
    initial: { item: productOptions[0], qty: "1", payment: "Paid by M-Pesa" },
    fields: [
      { kind: "text", name: "customer", label: "Customer", placeholder: "Walk-in sale", hint: "Leave empty for a walk-in." },
      { kind: "phone", name: "phone", label: "Phone" },
      { kind: "select", name: "item", label: "Item", required: true, options: productOptions },
      { kind: "number", name: "qty", label: "Quantity", required: true, half: true },
      { kind: "select", name: "payment", label: "Payment", half: true, options: ["Paid by M-Pesa", "Paid in cash", "Pay on delivery", "Waiting to confirm"] },
      { kind: "textarea", name: "note", label: "Note", placeholder: "Gift wrap, deliver after 5 pm" },
    ],
    validate: (v) => {
      const e: Record<string, string> = {};
      if (text(v, "phone") && !phoneOk(text(v, "phone"))) e.phone = "Enter a phone number like 0700 000 000.";
      if (num(v.qty) < 1) e.qty = "Quantity must be at least 1.";
      return e;
    },
    apply: (rows, v) => {
      const price = num(String(v.item).split("KES")[1]);
      const paid = v.payment === "Paid by M-Pesa" || v.payment === "Paid in cash" ? "Paid" : v.payment === "Pay on delivery" ? "Pending" : "Waiting to confirm";
      return prepend([`#${nextNumber(rows)}`, "Today, 11:20", text(v, "customer") || "Walk-in sale", String(num(v.qty)), kes(price * num(v.qty)), paid, "To pack"])(rows);
    },
    done: (v) => `Order created for ${text(v, "customer") || "a walk-in sale"}.`,
  },

  "store/products": {
    title: "New product",
    blurb: "It appears in your shop once it is active.",
    submit: "Add product",
    initial: { status: "Active", category: "Beard care", stock: "10" },
    fields: [
      { kind: "text", name: "name", label: "Name", required: true, placeholder: "Aftershave balm" },
      { kind: "textarea", name: "about", label: "Description", placeholder: "What it is and who it is for." },
      { kind: "money", name: "price", label: "Price", required: true, half: true, placeholder: "1100" },
      { kind: "number", name: "stock", label: "In stock", required: true, half: true },
      { kind: "text", name: "options", label: "Options", placeholder: "30 ml, 60 ml", hint: "Sizes or colours, separated by commas. Leave empty for one size." },
      { kind: "select", name: "category", label: "Category", options: ["Beard care", "Hair", "Accessories"] },
      { kind: "file", name: "photos", label: "Photos", multiple: true, accept: "image/*" },
      { kind: "pills", name: "status", label: "Status", options: ["Active", "Draft"] },
    ],
    apply: (rows, v) => prepend([text(v, "name"), text(v, "options") || "One size", money(v, "price"), String(num(v.stock)), String(v.status)])(rows),
    done: (v) => `${text(v, "name")} added to your products.`,
  },

  "store/collections": {
    title: "New collection",
    blurb: "A group of products shown together.",
    submit: "Add collection",
    initial: { kind: "Chosen by hand", rule: "By price", shown: "Shop page" },
    fields: [
      { kind: "text", name: "title", label: "Title", required: true, placeholder: "Gifts under KES 2,000" },
      { kind: "pills", name: "kind", label: "How products get in", options: ["Chosen by hand", "Automatic"] },
      { kind: "select", name: "rule", label: "Rule", showIf: (v) => v.kind === "Automatic", options: ["By price", "By date added", "By category"] },
      { kind: "select", name: "shown", label: "Shown on", options: ["Shop page", "Home page", "Not shown yet"] },
    ],
    apply: (rows, v) => prepend([text(v, "title"), v.kind === "Automatic" ? `Automatic, ${String(v.rule).toLowerCase()}` : "Chosen by hand", "0", String(v.shown)])(rows),
    done: (v) => `${text(v, "title")} created.`,
  },

  "store/inventory": {
    title: "Adjust stock",
    blurb: "Change how many you have on the shelf. Every change is logged.",
    submit: "Update stock",
    initial: { item: stockItems[0], change: "Add stock", reason: "Restock" },
    fields: [
      { kind: "select", name: "item", label: "Item", required: true, options: stockItems },
      { kind: "pills", name: "change", label: "Change", options: ["Add stock", "Remove stock", "Set to"] },
      { kind: "number", name: "qty", label: "Quantity", required: true },
      { kind: "select", name: "reason", label: "Reason", options: ["Restock", "Damaged", "Counted the shelf", "Returned by a customer"] },
    ],
    apply: (rows, v) =>
      rows.map((r) => {
        if (r[0] !== v.item) return r;
        const q = num(v.qty);
        const now = v.change === "Add stock" ? Number(r[2]) + q : v.change === "Remove stock" ? Math.max(0, Number(r[2]) - q) : q;
        const avail = Math.max(0, now - Number(r[3]));
        return [r[0], r[1], String(now), r[3], String(avail), avail === 0 ? "Out of stock" : avail <= 5 ? "Low" : "In stock"];
      }),
    done: (v) => `Stock updated for ${v.item}.`,
  },

  "store/discounts": {
    title: "New discount",
    blurb: "A code customers enter at checkout.",
    submit: "Add discount",
    initial: { gives: "Percent off" },
    fields: [
      { kind: "text", name: "code", label: "Code", required: true, placeholder: "WELCOME10" },
      { kind: "pills", name: "gives", label: "Gives", options: ["Percent off", "Amount off"] },
      { kind: "number", name: "value", label: "Value", required: true, half: true, suffix: "%", showIf: (v) => v.gives === "Percent off" },
      { kind: "money", name: "value", label: "Value", required: true, half: true, showIf: (v) => v.gives === "Amount off" },
      { kind: "money", name: "minimum", label: "Minimum spend", half: true },
      { kind: "date", name: "ends", label: "Ends", half: true, hint: "Leave empty for no end date." },
      { kind: "number", name: "limit", label: "Uses allowed", half: true, hint: "Leave empty for no limit." },
    ],
    validate: (v) => only("value", v.gives === "Percent off" && num(v.value) > 100 && "A percentage cannot be more than 100."),
    apply: (rows, v) =>
      prepend([text(v, "code").toUpperCase(), v.gives === "Percent off" ? `${num(v.value)}% off` : `${kes(num(v.value))} off`, text(v, "limit") ? `0 of ${num(v.limit)}` : "0", text(v, "ends") ? fmtDate(String(v.ends)) : "No end date", "Active"])(rows),
    done: (v) => `${text(v, "code").toUpperCase()} is live.`,
  },

  "payments/all": {
    title: "Record a payment",
    blurb: "For cash or a transfer you received outside the shop's checkout.",
    submit: "Record payment",
    initial: { method: "Cash" },
    fields: [
      { kind: "text", name: "from", label: "Paid by", required: true, placeholder: "Faith Achieng" },
      { kind: "text", name: "for", label: "For", required: true, placeholder: "Order #1046 or booking BK-2055" },
      { kind: "select", name: "method", label: "Method", half: true, options: ["Cash", "Bank transfer", "M-Pesa to till", "Card"] },
      { kind: "money", name: "amount", label: "Amount", required: true, half: true },
      { kind: "text", name: "reference", label: "Reference", placeholder: "M-Pesa code or transfer number" },
    ],
    validate: (v) => only("amount", num(v.amount) <= 0 && "Enter an amount above zero."),
    apply: (rows, v) => prepend(["Today, 11:20", text(v, "from"), text(v, "for"), String(v.method), money(v, "amount"), "Received"])(rows),
    done: (v) => `${money(v, "amount")} recorded from ${text(v, "from")}.`,
  },

  "payments/refunds": {
    title: "New refund",
    blurb: "Money sent back to a customer.",
    submit: "Send refund",
    initial: { by: "M-Pesa", reason: "Customer cancelled" },
    fields: [
      { kind: "text", name: "to", label: "Refund to", required: true, placeholder: "Lucy Nduta" },
      { kind: "text", name: "for", label: "For", required: true, placeholder: "Order #1040" },
      { kind: "money", name: "amount", label: "Amount", required: true, half: true },
      { kind: "select", name: "by", label: "Send by", half: true, options: ["M-Pesa", "Bank transfer", "Cash", "Card"] },
      { kind: "select", name: "reason", label: "Reason", options: ["Customer cancelled", "Item damaged", "Wrong item", "Other"] },
      { kind: "textarea", name: "note", label: "Note", placeholder: "Kept for your records." },
    ],
    validate: (v) => only("amount", num(v.amount) <= 0 && "Enter an amount above zero."),
    apply: (rows, v) => prepend(["Today", text(v, "to"), text(v, "for"), money(v, "amount"), String(v.by), "In progress"])(rows),
    done: (v) => `Refund of ${money(v, "amount")} started for ${text(v, "to")}.`,
  },

  "customers/people": {
    title: "Add customer",
    blurb: "People are also added automatically when they book, buy or write to you.",
    submit: "Add customer",
    fields: [
      { kind: "text", name: "first", label: "First name", required: true, half: true },
      { kind: "text", name: "last", label: "Last name", half: true },
      { kind: "phone", name: "phone", label: "Phone", required: true, placeholder: "0700 000 000" },
      { kind: "email", name: "email", label: "Email", placeholder: "name@example.com" },
      { kind: "textarea", name: "note", label: "Note", placeholder: "Anything worth remembering." },
      { kind: "toggle", name: "marketing", label: "OK to send offers", hint: "Only turn this on if they said yes." },
    ],
    validate: (v) => {
      const e: Record<string, string> = {};
      if (text(v, "phone") && !phoneOk(text(v, "phone"))) e.phone = "Enter a phone number like 0700 000 000.";
      if (text(v, "email") && !emailOk(text(v, "email"))) e.email = "Enter an email like name@example.com.";
      return e;
    },
    apply: (rows, v) => prepend([`${text(v, "first")} ${text(v, "last")}`.trim(), text(v, "phone"), "0", "0", "KES 0", "Today"])(rows),
    done: (v) => `${text(v, "first")} added to your customers.`,
  },

  "customers/messages": {
    title: "Export messages",
    blurb: "A file of everything written to you through the website.",
    submit: "Export",
    fields: exportFields,
    done: (v) => `Export of messages (${String(v.format).toLowerCase()}) is ready.`,
  },

  "customers/subscribers": {
    title: "Export subscribers",
    blurb: "Your newsletter list as a file.",
    submit: "Export",
    fields: [...exportFields, { kind: "toggle", name: "unsub", label: "Include people who unsubscribed" }],
    done: (v) => `Export of subscribers (${String(v.format).toLowerCase()}) is ready.`,
  },

  "website/articles": {
    title: "New article",
    blurb: "It is saved as a draft unless you publish it now.",
    submit: "Save article",
    initial: { category: "Guides", when: "Save as draft" },
    fields: [
      { kind: "text", name: "title", label: "Title", required: true, placeholder: "How to ask for a fade" },
      { kind: "select", name: "category", label: "Category", options: ["Guides", "Team", "News"] },
      { kind: "textarea", name: "summary", label: "Summary", placeholder: "Shown in search results and on the journal page." },
      { kind: "file", name: "cover", label: "Cover image", accept: "image/*" },
      { kind: "pills", name: "when", label: "Publish", options: ["Save as draft", "Publish now"] },
    ],
    apply: (rows, v) => prepend([text(v, "title"), String(v.category), "Today", v.when === "Publish now" ? "Published" : "Draft"])(rows),
    done: (v) => (v.when === "Publish now" ? `${text(v, "title")} is published.` : `${text(v, "title")} saved as a draft.`),
  },

  "website/content": {
    title: "New content type",
    blurb: "A kind of record your site lists, with the fields you choose.",
    submit: "Add content type",
    initial: { shown: "Not on a page yet" },
    fields: [
      { kind: "text", name: "name", label: "Name", required: true, placeholder: "Open positions" },
      { kind: "text", name: "fields", label: "Fields", required: true, placeholder: "Role, hours, how to apply", hint: "Separate with commas." },
      { kind: "select", name: "shown", label: "Shown on", options: ["Home page", "Services page", "Contact page", "Not on a page yet"] },
    ],
    apply: (rows, v) => prepend([text(v, "name"), text(v, "fields"), "0", String(v.shown)])(rows),
    done: (v) => `${text(v, "name")} created. Add the first entry when you are ready.`,
  },

  "settings/members": {
    title: "Invite member",
    blurb: "They get an email with a link to join this workspace.",
    submit: "Send invitation",
    initial: { role: "Manager", bookable: "Not bookable" },
    fields: [
      { kind: "email", name: "email", label: "Email", required: true, placeholder: "name@example.com" },
      { kind: "text", name: "name", label: "Name", placeholder: "Wanjiku N." },
      { kind: "select", name: "role", label: "Role", options: ["Manager", "Barber", "Front desk", "Accountant"] },
      { kind: "select", name: "bookable", label: "Bookable as", options: ["Not bookable", "Kevin", "Achieng", "Brian"] },
      { kind: "note", text: "The Barber role, and linking a member to a bookable person so they see only their own bookings, are proposed and not built yet." },
    ],
    validate: (v) => only("email", Boolean(text(v, "email")) && !emailOk(text(v, "email")) && "Enter an email like name@example.com."),
    apply: (rows, v) => {
      const sees: Record<string, string> = { Manager: "Everything except billing", Barber: "Own bookings only", "Front desk": "Bookings, orders and customers", Accountant: "Payments and reports" };
      return prepend([text(v, "name") || text(v, "email"), text(v, "email"), String(v.role), sees[String(v.role)], String(v.bookable), "Invited"])(rows);
    },
    done: (v) => `Invitation sent to ${text(v, "email")}.`,
  },

  "website/pages": {
    title: "Add a page",
    blurb: "New pages start as drafts. Nothing goes live until you publish.",
    submit: "Add page",
    effect: "page",
    initial: { start: "A blank page" },
    fields: [
      { kind: "text", name: "name", label: "Page name", required: true, placeholder: "Gift cards" },
      { kind: "text", name: "path", label: "Address", prefix: "/", placeholder: "gift-cards", hint: "Leave empty to use the page name." },
      { kind: "select", name: "start", label: "Start from", options: ["A blank page", "A copy of Services", "Written by the AI builder"] },
      { kind: "textarea", name: "brief", label: "What should it say?", showIf: (v) => v.start === "Written by the AI builder", placeholder: "Sell gift cards for haircuts, from KES 500." },
    ],
    done: (v) => `${text(v, "name")} added as a draft.`,
  },

  "files/upload": {
    title: "Upload files",
    blurb: "Photos, PDFs and documents. You can use them on your site and in your store.",
    submit: "Upload",
    effect: "upload",
    fields: [
      { kind: "file", name: "files", label: "Files", required: true, multiple: true },
      { kind: "select", name: "folder", label: "Put them in", options: (c) => ["All files (top level)", ...c.folders] },
    ],
    done: (v) => `${(v.files as File[]).length} ${(v.files as File[]).length === 1 ? "file" : "files"} uploaded.`,
  },

  "files/folder": {
    title: "New folder",
    submit: "Create folder",
    effect: "folder",
    fields: [
      { kind: "text", name: "name", label: "Folder name", required: true, placeholder: "Wedding party" },
      { kind: "select", name: "folder", label: "Inside", options: (c) => ["All files (top level)", ...c.folders] },
    ],
    done: (v) => `Folder "${text(v, "name")}" created.`,
  },
};
