// Example data for the studio prototype: a barbershop that also sells
// grooming products. Every person, order and figure here is made up.

export type TableDef = {
  cols: string[];
  rows: string[][];
  /** Column indexes rendered as status pills. */
  pills?: number[];
  /** Status values offered as quick filters. */
  filters?: string[];
  /** More filters, each on its own column. With several filters they all become compact dropdowns. */
  moreFilters?: { label: string; options: string[] }[];
  action?: string;
  note?: string;
  detail?: RecordDetail;
};

/** How one row of a list opens on its own page. */
export type RecordDetail = {
  noun: string;
  /** Opens as an edit form. Otherwise it is a read-only page. */
  edit?: boolean;
  /** The stages a record goes through, shown as a short history. */
  steps?: string[];
  actions?: { label: string; primary?: boolean; done?: string; set?: [col: number, value: string]; form?: string }[];
};

export type SetupDef = { title: string; items: [title: string, detail: string, value?: string][] }[];

export type TabDef = {
  id: string;
  label: string;
  table?: TableDef;
  setup?: SetupDef;
  /** Named view rendered by StudioApp instead of a table or setup list. */
  view?: "calendar" | "to-confirm" | "pages" | "appearance" | "report" | "workspace" | "theme";
};

export type SectionId = "today" | "bookings" | "store" | "payments" | "customers" | "website" | "files" | "reports" | "settings";

export type SectionDef = {
  id: SectionId;
  label: string;
  blurb: string;
  /** Which switchable capability the section belongs to, if any. */
  capability?: Capability;
  tabs: TabDef[];
};

export type Capability = "website" | "bookings" | "store" | "payments";

export type Role = "owner" | "staff";

export const capabilities: { id: Capability; label: string; detail: string }[] = [
  { id: "website", label: "Website", detail: "Pages, articles and your public site" },
  { id: "bookings", label: "Bookings", detail: "Appointments, sessions and stays" },
  { id: "store", label: "Store", detail: "Products, orders and stock" },
  { id: "payments", label: "Payments", detail: "M-Pesa, Paystack, cash and bank transfer" },
];

export const workspace = { name: "Fade House", place: "Nairobi", initials: "FH", site: "fadehouse.example", sitePath: "/s/fade-house", owner: "Joshua K.", staff: "Kevin M." };

/* ───────── Bookings ───────── */

export type BookingStatus = "Confirmed" | "Pending" | "Completed" | "No-show" | "Cancelled";

export type Booking = {
  id: string;
  ref: string;
  start: string; // "HH:MM"
  mins: number;
  resource: string;
  customer: string;
  phone: string;
  service: string;
  price: number;
  status: BookingStatus;
  payment: string;
  note?: string;
};

export const resources = [
  { id: "kevin", name: "Kevin", role: "Barber" },
  { id: "achieng", name: "Achieng", role: "Barber" },
  { id: "brian", name: "Brian", role: "Barber" },
];

export const bookings: Booking[] = [
  { id: "b1", ref: "BK-2041", start: "09:00", mins: 30, resource: "kevin", customer: "Daniel Otieno", phone: "0700 000 101", service: "Haircut", price: 500, status: "Completed", payment: "Paid in full by M-Pesa" },
  { id: "b2", ref: "BK-2042", start: "09:45", mins: 45, resource: "kevin", customer: "Samuel Kiptoo", phone: "0700 000 102", service: "Haircut and beard", price: 800, status: "Completed", payment: "Paid in full, cash" },
  { id: "b3", ref: "BK-2046", start: "11:30", mins: 30, resource: "kevin", customer: "Ali Hassan", phone: "0700 000 103", service: "Haircut", price: 500, status: "Confirmed", payment: "Deposit of KES 200 paid by M-Pesa", note: "Prefers a low fade." },
  { id: "b4", ref: "BK-2049", start: "12:30", mins: 60, resource: "kevin", customer: "Peter Mwangi", phone: "0700 000 104", service: "Hot towel shave and haircut", price: 1300, status: "Pending", payment: "Deposit not paid yet" },
  { id: "b5", ref: "BK-2052", start: "15:00", mins: 30, resource: "kevin", customer: "Baraka (with Mum, Grace)", phone: "0700 000 105", service: "Kids cut", price: 350, status: "Confirmed", payment: "Pays at the shop" },
  { id: "b6", ref: "BK-2043", start: "10:00", mins: 45, resource: "achieng", customer: "Brian Ouma", phone: "0700 000 106", service: "Haircut and beard", price: 800, status: "Completed", payment: "Paid in full by M-Pesa" },
  { id: "b7", ref: "BK-2047", start: "11:45", mins: 30, resource: "achieng", customer: "Kelvin Njoroge", phone: "0700 000 107", service: "Haircut", price: 500, status: "Pending", payment: "Deposit not paid yet" },
  { id: "b8", ref: "BK-2050", start: "13:30", mins: 20, resource: "achieng", customer: "Omar Said", phone: "0700 000 108", service: "Beard trim", price: 300, status: "Confirmed", payment: "Pays at the shop" },
  { id: "b9", ref: "BK-2053", start: "15:30", mins: 45, resource: "achieng", customer: "Felix Wafula", phone: "0700 000 109", service: "Haircut and beard", price: 800, status: "Confirmed", payment: "Deposit of KES 200 paid by M-Pesa" },
  { id: "b10", ref: "BK-2040", start: "09:15", mins: 30, resource: "brian", customer: "Tony Kamau", phone: "0700 000 110", service: "Haircut", price: 500, status: "No-show", payment: "Deposit of KES 200 kept" },
  { id: "b11", ref: "BK-2045", start: "10:30", mins: 30, resource: "brian", customer: "Victor Mutua", phone: "0700 000 111", service: "Haircut", price: 500, status: "Completed", payment: "Paid in full, cash" },
  { id: "b12", ref: "BK-2051", start: "14:00", mins: 45, resource: "brian", customer: "George Odhiambo", phone: "0700 000 112", service: "Haircut and beard", price: 800, status: "Pending", payment: "Deposit not paid yet", note: "Asked by phone, first visit." },
  { id: "b13", ref: "BK-2054", start: "16:15", mins: 30, resource: "brian", customer: "Ian Kariuki", phone: "0700 000 113", service: "Hot towel shave", price: 800, status: "Confirmed", payment: "Pays at the shop" },
];

/* ───────── Payments waiting for a decision ───────── */

export type Claim = { id: string; from: string; amount: number; method: string; detail: string; purpose: string; when: string };

export const claims: Claim[] = [
  { id: "c1", from: "Mercy Wanjiru", amount: 1500, method: "M-Pesa to till", detail: "Says the confirmation code is SJK4EXAMPLE", purpose: "order #1042, beard oil and pomade", when: "12 minutes ago" },
  { id: "c2", from: "George Odhiambo", amount: 200, method: "Bank transfer", detail: "Uploaded a transfer slip", purpose: "the deposit on booking BK-2051", when: "1 hour ago" },
];

/* ───────── Website ───────── */

export const pages = [
  { id: "home", name: "Home", path: "/", status: "Changes not published", sections: ["Header", "Opening hours banner", "Book a chair", "Our barbers", "Footer"] },
  { id: "services", name: "Services", path: "/services", status: "Published", sections: ["Header", "Price list", "Add-ons", "Footer"] },
  { id: "book", name: "Book", path: "/book", status: "Published", sections: ["Header", "Booking form", "Cancellation policy", "Footer"] },
  { id: "shop", name: "Shop", path: "/shop", status: "Changes not published", sections: ["Header", "Product grid", "Delivery and pickup", "Footer"] },
  { id: "journal", name: "Journal", path: "/journal", status: "Published", sections: ["Header", "Latest articles", "Subscribe", "Footer"] },
  { id: "contact", name: "Contact", path: "/contact", status: "Draft", sections: ["Header", "Map and directions", "Contact form", "Footer"] },
];

/* ───────── Files ───────── */

export type FileNode = {
  id: string;
  name: string;
  kind: "folder" | "image" | "pdf" | "doc";
  parent: string | null;
  size?: string;
  modified: string;
  detail?: string; // dimensions or page count
  usedIn?: string;
  source?: "Uploaded" | "Made by AI" | "Stock photo";
  hue?: number;
};

export const files: FileNode[] = [
  { id: "brand", name: "Brand", kind: "folder", parent: null, modified: "2 Oct" },
  { id: "team", name: "Team photos", kind: "folder", parent: null, modified: "28 Sep" },
  { id: "products", name: "Products", kind: "folder", parent: null, modified: "9 Oct" },
  { id: "journal", name: "Journal", kind: "folder", parent: null, modified: "6 Oct" },
  { id: "docs", name: "Documents", kind: "folder", parent: null, modified: "11 Oct" },
  { id: "f1", name: "shopfront.jpg", kind: "image", parent: null, size: "2.4 MB", modified: "Today, 09:12", detail: "3000 × 2000", usedIn: "Home page, opening banner", source: "Uploaded", hue: 28 },
  { id: "f2", name: "price-list-october.pdf", kind: "pdf", parent: null, size: "184 KB", modified: "Yesterday", detail: "1 page", usedIn: "Not used on the site", source: "Made by AI" },
  { id: "f3", name: "logo.svg", kind: "image", parent: "brand", size: "6 KB", modified: "2 Oct", detail: "Vector", usedIn: "Header on every page", source: "Uploaded", hue: 262 },
  { id: "f4", name: "logo-white.svg", kind: "image", parent: "brand", size: "6 KB", modified: "2 Oct", detail: "Vector", usedIn: "Footer on every page", source: "Uploaded", hue: 240 },
  { id: "f5", name: "brand-colours.pdf", kind: "pdf", parent: "brand", size: "92 KB", modified: "2 Oct", detail: "2 pages", usedIn: "Not used on the site", source: "Made by AI" },
  { id: "f6", name: "kevin.jpg", kind: "image", parent: "team", size: "1.1 MB", modified: "28 Sep", detail: "1600 × 2000", usedIn: "Home page, our barbers", source: "Uploaded", hue: 200 },
  { id: "f7", name: "achieng.jpg", kind: "image", parent: "team", size: "1.3 MB", modified: "28 Sep", detail: "1600 × 2000", usedIn: "Home page, our barbers", source: "Uploaded", hue: 340 },
  { id: "f8", name: "brian.jpg", kind: "image", parent: "team", size: "1.2 MB", modified: "28 Sep", detail: "1600 × 2000", usedIn: "Home page, our barbers", source: "Uploaded", hue: 150 },
  { id: "f9", name: "beard-oil.jpg", kind: "image", parent: "products", size: "860 KB", modified: "9 Oct", detail: "2000 × 2000", usedIn: "Product: Beard oil 30 ml", source: "Uploaded", hue: 40 },
  { id: "f10", name: "pomade.jpg", kind: "image", parent: "products", size: "790 KB", modified: "9 Oct", detail: "2000 × 2000", usedIn: "Product: Matte pomade", source: "Uploaded", hue: 15 },
  { id: "f11", name: "comb-set.jpg", kind: "image", parent: "products", size: "640 KB", modified: "7 Oct", detail: "2000 × 2000", usedIn: "Product: Comb set", source: "Stock photo", hue: 90 },
  { id: "f12", name: "fade-guide-cover.jpg", kind: "image", parent: "journal", size: "1.8 MB", modified: "6 Oct", detail: "2400 × 1350", usedIn: "Article: How to ask for a fade", source: "Stock photo", hue: 300 },
  { id: "f13", name: "opening-poster.pdf", kind: "pdf", parent: "docs", size: "1.2 MB", modified: "11 Oct", detail: "A3, 1 page", usedIn: "Not used on the site", source: "Made by AI" },
  { id: "f14", name: "staff-rota.docx", kind: "doc", parent: "docs", size: "48 KB", modified: "10 Oct", detail: "2 pages", usedIn: "Not used on the site", source: "Uploaded" },
  { id: "f15", name: "quotation-wedding-party.pdf", kind: "pdf", parent: "docs", size: "110 KB", modified: "8 Oct", detail: "1 page", usedIn: "Not used on the site", source: "Made by AI" },
];

/* ───────── Reports ───────── */

export type Report = { tiles: [label: string, value: string, change: string][]; lists: { title: string; rows: [string, string][] }[] };

const report = (tiles: Report["tiles"], lists: Report["lists"]): Report => ({ tiles, lists });

export const reports: Record<string, Report> = {
  overview: report(
    [["Money received", "KES 184,300", "Up 12% on the week before"], ["Bookings", "96", "Up 8"], ["Orders", "41", "Down 3"], ["Website visitors", "2,140", "Up 19%"]],
    [
      { title: "Most booked services", rows: [["Haircut", "44"], ["Haircut and beard", "27"], ["Hot towel shave", "13"], ["Kids cut", "8"], ["Beard trim", "4"]] },
      { title: "Best selling products", rows: [["Beard oil 30 ml", "18"], ["Matte pomade", "14"], ["Comb set", "9"]] },
    ],
  ),
  website: report(
    [["Visitors", "2,140", "Up 19%"], ["Visits", "2,905", "Up 14%"], ["Average visit", "1 min 48 s", "Up 6 s"], ["Left after one page", "38%", "Down 4 points"]],
    [
      { title: "Where visitors came from", rows: [["Google search", "1,020"], ["Instagram", "610"], ["Direct", "340"], ["WhatsApp links", "170"]] },
      { title: "What visitors did", rows: [["Started a booking", "212"], ["Finished a booking", "96"], ["Bought something", "41"], ["Subscribed", "23"]] },
    ],
  ),
  sales: report(
    [["Sales", "KES 61,800", "Down 5%"], ["Orders", "41", "Down 3"], ["Average order", "KES 1,507", "Up 2%"], ["Cancelled", "2", "Same"]],
    [{ title: "Top products", rows: [["Beard oil 30 ml", "KES 21,600"], ["Matte pomade", "KES 19,600"], ["Comb set", "KES 8,100"]] }],
  ),
  bookings: report(
    [["Bookings", "96", "Up 8"], ["Cancelled", "5", "Down 2"], ["No-shows", "3", "Up 1"], ["Chairs in use", "71%", "Up 6 points"]],
    [{ title: "Time booked per barber", rows: [["Kevin", "78%"], ["Achieng", "72%"], ["Brian", "63%"]] }],
  ),
  payments: report(
    [["Received", "KES 184,300", "Up 12%"], ["Refunded", "KES 2,300", "Up KES 800"], ["Net", "KES 182,000", "Up 11%"], ["Waiting to confirm", "KES 1,700", "2 payments"]],
    [{ title: "By method", rows: [["M-Pesa", "KES 131,200"], ["Cash", "KES 38,600"], ["Paystack", "KES 11,500"], ["Bank transfer", "KES 3,000"]] }],
  ),
};

/* ───────── Sections, tabs and their tables ───────── */

export const sections: SectionDef[] = [
  { id: "today", label: "Today", blurb: "What needs you now", tabs: [] },
  {
    id: "bookings",
    label: "Bookings",
    blurb: "Your calendar, services and the people who can be booked",
    capability: "bookings",
    tabs: [
      { id: "calendar", label: "Calendar", view: "calendar" },
      {
        id: "list",
        label: "All bookings",
        table: {
          cols: ["Reference", "When", "Customer", "Service", "With", "Status", "Payment"],
          pills: [5],
          filters: ["Pending", "Confirmed", "Completed", "No-show"],
          action: "New booking",
          rows: bookings.map((b) => [b.ref, `Today, ${b.start}`, b.customer, b.service, resources.find((r) => r.id === b.resource)?.name ?? "", b.status, b.payment]),
        },
      },
      {
        id: "services",
        label: "Services",
        table: {
          cols: ["Service", "Length", "Price", "Add-ons", "Needs", "Deposit"],
          action: "New service",
          rows: [
            ["Haircut", "30 min", "KES 500", "Line-up, wash", "1 barber", "KES 200"],
            ["Beard trim", "20 min", "KES 300", "Beard oil", "1 barber", "None"],
            ["Haircut and beard", "45 min", "KES 800", "Wash", "1 barber", "KES 200"],
            ["Kids cut", "30 min", "KES 350", "None", "1 barber", "None"],
            ["Hot towel shave", "30 min", "KES 800", "Face mask", "1 barber, 1 shaving chair", "KES 200"],
          ],
        },
      },
      {
        id: "resources",
        label: "Staff and resources",
        table: {
          cols: ["Name", "Kind", "Does", "Working hours", "Workspace login"],
          action: "Add staff or resource",
          note: "A bookable person and a workspace login are separate. Linking them is proposed, and lets a barber see only their own bookings.",
          rows: [
            ["Kevin", "Person", "All services", "Mon to Sat, 09:00 to 18:00", "Linked to Kevin M."],
            ["Achieng", "Person", "All services", "Tue to Sun, 09:00 to 18:00", "Linked to Achieng O."],
            ["Brian", "Person", "Haircut, Kids cut, Beard trim", "Mon to Fri, 09:00 to 17:00", "No login"],
            ["Shaving chair", "Equipment", "Hot towel shave", "Same as the shop", "Not a person"],
          ],
        },
      },
      {
        id: "sessions",
        label: "Sessions",
        table: {
          cols: ["Session", "Repeats", "Next", "Places", "Booked", "Status"],
          pills: [5],
          action: "New session",
          rows: [
            ["Barbering basics class", "Every Saturday", "Sat 17 Oct, 10:00", "10", "6", "Open"],
            ["Beard care evening", "Once", "Thu 22 Oct, 18:30", "15", "15", "Full"],
          ],
        },
      },
      {
        id: "setup",
        label: "Set up",
        setup: [
          { title: "When you can be booked", items: [["Working hours", "The hours customers can book", "Mon to Sat, 09:00 to 18:00"], ["Closures", "Holidays and days off", "2 coming up"], ["Overlaps", "Stops two bookings sharing a barber or chair", "On"]] },
          { title: "Rules for customers", items: [["Deposits", "What a customer pays to hold a booking", "KES 200 on most services"], ["Cancelling and rescheduling", "How late a customer can change a booking", "Up to 3 hours before"], ["Cancellation fee", "Charged when a customer cancels late", "Deposit is kept"], ["Booking questions", "What you ask when someone books", "2 questions"]] },
          { title: "Messages", items: [["Reminders", "Sent before an appointment", "SMS, 3 hours before"], ["Booking notifications", "Who is told about new bookings", "Owner and the barber booked"]] },
        ],
      },
    ],
  },
  {
    id: "store",
    label: "Store",
    blurb: "Orders, products and stock",
    capability: "store",
    tabs: [
      {
        id: "orders",
        label: "Orders",
        table: {
          cols: ["Order", "Placed", "Customer", "Items", "Total", "Payment", "Status"],
          pills: [5, 6],
          filters: ["To pack", "Ready for pickup", "Fulfilled"],
          action: "New order",
          rows: [
            ["#1045", "Today, 10:41", "Faith Achieng", "2", "KES 2,300", "Paid", "To pack"],
            ["#1044", "Today, 09:58", "Dennis Kibet", "1", "KES 1,200", "Paid", "To pack"],
            ["#1043", "Today, 08:15", "Walk-in sale", "3", "KES 2,900", "Paid", "Fulfilled"],
            ["#1042", "Yesterday", "Mercy Wanjiru", "2", "KES 1,500", "Waiting to confirm", "To pack"],
            ["#1041", "Yesterday", "Hussein Abdi", "1", "KES 900", "Paid", "Ready for pickup"],
            ["#1040", "Sun 11 Oct", "Lucy Nduta", "1", "KES 1,200", "Refunded", "Cancelled"],
          ],
        },
      },
      {
        id: "products",
        label: "Products",
        table: {
          cols: ["Product", "Options", "Price", "In stock", "Status"],
          pills: [4],
          filters: ["Active", "Draft"],
          action: "New product",
          rows: [
            ["Beard oil", "30 ml, 60 ml", "From KES 1,200", "3", "Active"],
            ["Matte pomade", "One size", "KES 1,400", "22", "Active"],
            ["Comb set", "Black, Tortoise", "KES 900", "14", "Active"],
            ["Aftershave balm", "One size", "KES 1,100", "0", "Draft"],
          ],
        },
      },
      {
        id: "collections",
        label: "Collections",
        table: {
          cols: ["Collection", "Kind", "Products", "Shown on"],
          action: "New collection",
          rows: [["Beard care", "Chosen by hand", "3", "Shop page"], ["Under KES 1,000", "Automatic, by price", "1", "Shop page"], ["New this month", "Automatic, by date added", "2", "Home page"]],
        },
      },
      {
        id: "inventory",
        label: "Inventory",
        table: {
          cols: ["Item", "Location", "On hand", "Reserved", "Available", "Status"],
          pills: [5],
          filters: ["Low", "Out of stock"],
          action: "Adjust stock",
          rows: [
            ["Beard oil 30 ml", "Shop", "5", "2", "3", "Low"],
            ["Beard oil 60 ml", "Shop", "12", "0", "12", "In stock"],
            ["Matte pomade", "Shop", "24", "2", "22", "In stock"],
            ["Comb set, Black", "Shop", "9", "0", "9", "In stock"],
            ["Aftershave balm", "Shop", "0", "0", "0", "Out of stock"],
          ],
        },
      },
      {
        id: "discounts",
        label: "Discounts",
        table: {
          cols: ["Code", "Gives", "Used", "Ends", "Status"],
          pills: [4],
          action: "New discount",
          rows: [["FIRSTCUT", "10% off the first order", "14 of 100", "31 Dec", "Active"], ["BEARD200", "KES 200 off beard care", "6", "No end date", "Active"], ["SEPT15", "15% off everything", "31", "30 Sep", "Ended"]],
        },
      },
      {
        id: "setup",
        label: "Set up",
        setup: [
          { title: "Getting orders to customers", items: [["Delivery areas and fees", "Where you deliver and what it costs", "3 areas"], ["Pickup", "Let customers collect from the shop", "On, ready in 1 hour"]] },
          { title: "Checkout", items: [["Taxes", "Tax added to prices", "VAT 16%, included in prices"], ["Checkout terms", "What a customer agrees to before paying", "Returns within 7 days"], ["Customer accounts", "Let customers sign in to see past orders", "Optional"]] },
          { title: "Stock", items: [["Locations", "Places you keep stock", "1 location"], ["Low stock warning", "When to warn you", "At 5 or fewer"]] },
        ],
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    blurb: "Money from customers, for orders and bookings",
    capability: "payments",
    tabs: [
      { id: "confirm", label: "To confirm", view: "to-confirm" },
      {
        id: "all",
        label: "All payments",
        table: {
          cols: ["When", "From", "For", "Method", "Amount", "Status"],
          pills: [5],
          filters: ["Received", "Waiting to confirm", "Failed"],
          action: "Record a payment",
          rows: [
            ["Today, 10:42", "Faith Achieng", "Order #1045", "M-Pesa", "KES 2,300", "Received"],
            ["Today, 10:30", "Mercy Wanjiru", "Order #1042", "M-Pesa to till", "KES 1,500", "Waiting to confirm"],
            ["Today, 09:58", "Dennis Kibet", "Order #1044", "Paystack", "KES 1,200", "Received"],
            ["Today, 09:31", "Daniel Otieno", "Booking BK-2041", "M-Pesa", "KES 500", "Received"],
            ["Today, 09:20", "Tony Kamau", "Booking BK-2040", "M-Pesa", "KES 200", "Received"],
            ["Yesterday", "Paul Njenga", "Order #1039", "M-Pesa", "KES 900", "Failed"],
          ],
        },
      },
      {
        id: "refunds",
        label: "Refunds",
        table: {
          cols: ["When", "To", "For", "Amount", "Sent by", "Status"],
          pills: [5],
          action: "New refund",
          rows: [["Sun 11 Oct", "Lucy Nduta", "Order #1040", "KES 1,200", "M-Pesa", "Sent"], ["Fri 9 Oct", "James Karanja", "Booking BK-2019", "KES 200", "M-Pesa", "Sent"], ["Thu 8 Oct", "Ann Chebet", "Order #1031", "KES 900", "Bank transfer", "In progress"]],
        },
      },
      {
        id: "ledger",
        label: "Ledger",
        table: {
          cols: ["Date", "Entry", "Money in", "Money out", "Running total"],
          rows: [
            ["13 Oct", "Order #1045, M-Pesa", "KES 2,300", "", "KES 184,300"],
            ["13 Oct", "Order #1044, Paystack", "KES 1,200", "", "KES 182,000"],
            ["13 Oct", "Booking BK-2041, M-Pesa", "KES 500", "", "KES 180,800"],
            ["11 Oct", "Refund for order #1040", "", "KES 1,200", "KES 180,300"],
          ],
        },
      },
      {
        id: "setup",
        label: "Set up",
        setup: [
          { title: "Ways customers can pay", items: [["M-Pesa prompt on the phone", "The customer approves the payment on their phone", "On"], ["M-Pesa to your till or paybill", "The customer pays, then tells you the code", "On"], ["Card, through Paystack", "Hosted card checkout", "On"], ["Cash", "Recorded by you at the shop", "On"], ["Bank transfer", "The customer sends a slip for you to confirm", "On"]] },
          { title: "Accounts you are paid into", items: [["M-Pesa till", "Connected through Daraja", "Connected"], ["Paystack account", "For card payments", "Connected"], ["Bank details", "Shown to customers paying by transfer", "Added"]] },
          { title: "Rules", items: [["Part payments", "Whether to accept less than the full amount", "Accept, and show the balance"]] },
        ],
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    blurb: "Everyone who has booked, bought, written or subscribed",
    tabs: [
      {
        id: "people",
        label: "People",
        table: {
          cols: ["Name", "Phone", "Bookings", "Orders", "Spent", "Last seen"],
          action: "Add customer",
          rows: [
            ["Daniel Otieno", "0700 000 101", "12", "2", "KES 8,400", "Today"],
            ["Faith Achieng", "0700 000 121", "0", "4", "KES 6,900", "Today"],
            ["Ali Hassan", "0700 000 103", "7", "0", "KES 3,500", "29 Sep"],
            ["Mercy Wanjiru", "0700 000 122", "1", "3", "KES 4,700", "Today"],
            ["Peter Mwangi", "0700 000 104", "3", "1", "KES 3,100", "2 Oct"],
          ],
        },
      },
      {
        id: "messages",
        label: "Messages",
        table: {
          cols: ["From", "Message", "Form", "Received", "Status"],
          pills: [4],
          filters: ["New"],
          action: "Export",
          rows: [
            ["Caroline Jeptoo", "Do you do group bookings for a wedding party?", "Contact page", "Today, 08:02", "New"],
            ["Moses Okello", "Is the comb set back in stock?", "Product enquiry", "Yesterday", "New"],
            ["Sarah Naliaka", "Thanks for fitting my son in on Saturday.", "Contact page", "Sat 10 Oct", "Read"],
          ],
        },
      },
      {
        id: "subscribers",
        label: "Subscribers",
        table: {
          cols: ["Email", "Joined from", "Joined", "Status"],
          pills: [3],
          action: "Export",
          note: "This is your list of subscribers. Sending email campaigns is not part of the studio yet.",
          rows: [["d.otieno@example.com", "Journal page", "11 Oct", "Subscribed"], ["faith.a@example.com", "Checkout", "9 Oct", "Subscribed"], ["moses.ok@example.com", "Home page", "3 Oct", "Waiting to confirm"], ["old.reader@example.com", "Journal page", "14 Aug", "Unsubscribed"]],
        },
      },
      {
        id: "comments",
        label: "Comments",
        table: {
          cols: ["From", "On", "Comment", "Status"],
          pills: [3],
          filters: ["Waiting"],
          rows: [["Kimani", "How to ask for a fade", "This helped, I finally got the cut I wanted.", "Waiting"], ["Zawadi", "Beard oil or balm?", "Do you sell the balm in the shop?", "Approved"]],
        },
      },
    ],
  },
  {
    id: "website",
    label: "Website",
    blurb: "Your pages, articles and how the site looks",
    capability: "website",
    tabs: [
      { id: "pages", label: "Pages", view: "pages" },
      {
        id: "articles",
        label: "Articles",
        table: {
          cols: ["Title", "Category", "Updated", "Status"],
          pills: [3],
          filters: ["Published", "Draft"],
          action: "New article",
          rows: [["How to ask for a fade", "Guides", "6 Oct", "Published"], ["Beard oil or balm?", "Guides", "29 Sep", "Published"], ["Meet Achieng", "Team", "Today", "Draft"]],
        },
      },
      {
        id: "content",
        label: "Custom content",
        table: {
          cols: ["Content type", "Fields", "Entries", "Shown on"],
          action: "New content type",
          rows: [["Barbers", "Name, photo, speciality, years cutting", "3", "Home page"], ["Opening hours", "Day, opens, closes", "7", "Home and Contact"], ["Open positions", "Role, hours, how to apply", "1", "Not on a page yet"]],
        },
      },
      { id: "appearance", label: "Appearance", view: "appearance" },
      {
        id: "setup",
        label: "Set up",
        setup: [
          { title: "Address", items: [["Domain", "Where customers find your site", "fadehouse.example"], ["Free address", "Always works, even without a domain", "fadehouse.andishi.site"]] },
          { title: "Site-wide", items: [["Navigation", "Links in the header and footer", "6 links"], ["Search engines", "Title and description shown in search results", "Set on 5 of 6 pages"], ["Trash", "Deleted pages and articles you can restore", "2 items"]] },
        ],
      },
    ],
  },
  { id: "files", label: "Files", blurb: "Photos and documents, shared across everything", tabs: [] },
  {
    id: "reports",
    label: "Reports",
    blurb: "How the business is doing",
    tabs: [
      { id: "overview", label: "Overview", view: "report" },
      { id: "website", label: "Website", view: "report" },
      { id: "sales", label: "Sales", view: "report" },
      { id: "bookings", label: "Bookings", view: "report" },
      { id: "payments", label: "Payments", view: "report" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    blurb: "Your workspace, team, notifications and plan",
    tabs: [
      { id: "workspace", label: "Workspace", view: "workspace" },
      { id: "theme", label: "Theme", view: "theme" },
      {
        id: "members",
        label: "Members and roles",
        table: {
          cols: ["Member", "Email", "Role", "Can see", "Bookable as", "Status"],
          pills: [5],
          action: "Invite member",
          note: "The Barber role and the “Bookable as” link are proposed. A barber signs in and sees only the bookings assigned to them.",
          rows: [
            ["Joshua K.", "joshua@example.com", "Owner", "Everything", "Not bookable", "Active"],
            ["Wanjiku N.", "wanjiku@example.com", "Manager", "Everything except billing", "Not bookable", "Active"],
            ["Kevin M.", "kevin@example.com", "Barber", "Own bookings only", "Kevin", "Active"],
            ["Achieng O.", "achieng@example.com", "Barber", "Own bookings only", "Achieng", "Invited"],
          ],
        },
      },
      {
        id: "notifications",
        label: "Notifications",
        setup: [
          { title: "What gets sent", items: [["Booking messages", "Confirmations, reminders and changes", "SMS and email"], ["Order messages", "Receipts and pickup notices", "Email"], ["Payment messages", "Receipts and refund notices", "SMS"]] },
          { title: "How they read", items: [["Message wording", "Change the text and preview it", "2 edited"], ["Delivery history", "What was sent, and whether it arrived", "184 this week"]] },
          { title: "Just for you", items: [["My notifications", "What you personally are told about", "New bookings, payments to confirm"]] },
        ],
      },
      {
        id: "billing",
        label: "Plan and billing",
        setup: [
          { title: "Your plan", items: [["Current plan", "What you pay Andishi each month", "Pro, KES 5,000 a month"], ["Change plan", "Move up or down at any time", ""]] },
          { title: "AI credits", items: [["Balance", "Used by the assistant and the AI builder", "640 of 1,000 left"], ["Buy more credits", "Top up without changing plan", ""], ["Usage history", "Where credits went", "This month: 360"]] },
          { title: "Invoices", items: [["October 2026", "Due 1 Oct", "Paid"], ["September 2026", "Due 1 Sep", "Paid"]] },
        ],
      },
    ],
  },
];

export const pillTone = (value: string): "ok" | "warn" | "bad" | "plain" => {
  const v = value.toLowerCase();
  if (/(cancel|no-show|fail|reject|out of stock|unsubscribed|ended)/.test(v)) return "bad";
  if (/(pending|waiting|draft|to pack|low|not published|invited|in progress|new|ready for pickup)/.test(v)) return "warn";
  if (/(confirm|paid|publish|active|complete|approved|fulfilled|in stock|received|sent|open|subscribed|read|connected)/.test(v)) return "ok";
  return "plain";
};

/* ───────── record pages ───────── */

const details: Record<string, RecordDetail> = {
  "bookings/list": { noun: "Booking" },
  "bookings/services": { noun: "Service", edit: true },
  "bookings/resources": { noun: "Staff or resource", edit: true },
  "bookings/sessions": { noun: "Session", edit: true },
  "store/orders": {
    noun: "Order",
    steps: ["Order placed", "Payment received", "Packed", "Handed to the customer"],
    actions: [
      { label: "Mark as fulfilled", primary: true, set: [6, "Fulfilled"], done: "Order marked as fulfilled." },
      { label: "Cancel order", set: [6, "Cancelled"], done: "Order cancelled." },
    ],
  },
  "store/products": { noun: "Product", edit: true },
  "store/collections": { noun: "Collection", edit: true },
  "store/inventory": {
    noun: "Stock item",
    steps: ["Counted at opening", "Sold or reserved today"],
    actions: [{ label: "Adjust stock", primary: true, form: "store/inventory" }],
  },
  "store/discounts": { noun: "Discount", edit: true },
  "payments/all": {
    noun: "Payment",
    steps: ["Customer started the payment", "Money received", "Matched to the order or booking"],
    actions: [{ label: "Refund this payment", form: "payments/refunds" }],
  },
  "payments/refunds": {
    noun: "Refund",
    steps: ["Refund requested", "Approved by Joshua K.", "Money sent to the customer"],
    actions: [{ label: "Mark as sent", primary: true, set: [5, "Sent"], done: "Refund marked as sent." }],
  },
  "payments/ledger": { noun: "Ledger entry", steps: ["Recorded automatically when the money moved"] },
  "customers/people": { noun: "Customer", edit: true },
  "customers/messages": { noun: "Message", actions: [{ label: "Mark as read", primary: true, set: [4, "Read"], done: "Marked as read." }] },
  "customers/subscribers": { noun: "Subscriber", actions: [{ label: "Unsubscribe", set: [3, "Unsubscribed"], done: "Unsubscribed." }] },
  "customers/comments": {
    noun: "Comment",
    actions: [
      { label: "Approve", primary: true, set: [3, "Approved"], done: "Comment approved." },
      { label: "Reject", set: [3, "Rejected"], done: "Comment rejected." },
    ],
  },
  "website/articles": { noun: "Article", edit: true },
  "website/content": { noun: "Content type", edit: true },
  "settings/members": { noun: "Member", edit: true },
};

for (const s of sections) for (const t of s.tabs) if (t.table) t.table.detail = details[`${s.id}/${t.id}`];
