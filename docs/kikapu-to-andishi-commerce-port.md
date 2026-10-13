# Porting Kikapu's commerce into Andishi

Written 7 October 2026 from a read of both repositories (`kikapu` on `main`, `andishi` on `release`). Nothing in either repo was changed.

## The goal

An Andishi workspace can sell. The AI builder generates a site with product pages, a cart and a checkout form. A buyer pays by M-Pesa and the order appears in the studio.

## Summary

- Kikapu's commerce core is real and reusable: catalogue with variants, carts, server-priced orders with atomic stock decrement, M-Pesa STK push with callback, per-shop checkout settings and encrypted payment credentials.
- It cannot be merged as code. Kikapu is Fiber, Supabase Auth and `tenant_id`. Andishi is pine, its own JWT and `workspace_id`, with a strict module pattern. The port is a re-implementation of the logic inside a new Andishi module, using Kikapu's code as the reference.
- Kikapu has no tests of its own and several gaps (listed below) that should be fixed during the port, not copied.
- The backend port and the UI work touch different folders, so two people can work at once if the API contract is agreed first.

## What Kikapu has

All paths are under `kikapu/backend/internal/`.

### Built and wired

| Area | What it does | Where |
| --- | --- | --- |
| Catalogue | Products, options (Size, Colour), generated variants with SKU and price, images, categories, manual and rule-based collections, custom product fields | `models/catalog.go`, `services/catalog_service.go`, `services/variant_service.go`, `services/collection_rules.go`, `services/metafield_service.go` |
| Stock | Stock per variant per location, movement log, guarded atomic decrement that cannot go below zero | `services/inventory_service.go`, `models/erp.go` |
| Customers | Phone-first customers with addresses and marketing consent | `models/commerce.go`, `services/customer_service.go` |
| Cart | Create, add item, set quantity, checkout | `services/cart_service.go` |
| Orders | Prices every line from the variant table, never from the request. Decrements stock in the same transaction. Order numbers per shop. Idempotency key for retried submits | `services/order_service.go` |
| M-Pesa | STK push using the shop's own Daraja credentials, status query, callback that marks the order paid | `services/mpesa.go`, `services/payment_service.go`, `handlers/mpesa.go` |
| Cash on delivery | Accepted at checkout when the shop has switched it on | `handlers/api_v1_handler.go` |
| Checkout settings | One row per shop: guest checkout, contact by phone or email, which fields are hidden, optional or required, terms checkbox, minimum order, checkout note, thank-you message | `models/checkout.go`, `services/settings_service.go` |
| Payment credentials | AES-GCM encryption at rest, secrets masked on read | `services/secrets.go` |
| Public store API | Products, collections, categories, checkout methods, cart, checkout, order lookup, M-Pesa status. Authenticated by API key with scopes | `routes/api_v1.go`, `handlers/api_v1_handler.go` |
| Dashboard | Products, categories, collections, orders, customers, discounts, payment and checkout settings | `kikapu/dashboard/app/(platform)/dashboard/` |

### Built but not finished

- **Discounts, tax rates, shipping zones and rates.** The tables and admin screens exist. Order creation does not apply any of them: the code comment says subtotal and total are equal until those systems exist.
- **Fulfilments and refunds.** Tables and models only.
- **Purchase orders and vendors.** Tables and models only. These belong to Rasilimali in the long run.

### Listed but not wired

Paystack, Flutterwave, Pesapal, Stripe, Airtel Money and bank transfer appear in the provider catalogue (`services/payment_providers.go`) so a shop can save credentials. Only M-Pesa and cash on delivery can take a payment.

### Not there

- No tests in `backend/internal` or `backend/cmd`.
- `scaffolds/storefront` is empty.

## Why it is a re-implementation

| | Kikapu | Andishi |
| --- | --- | --- |
| HTTP framework | Fiber v3 | pine |
| Sign-in | Supabase Auth | Own JWT and sessions |
| Tenant key | `tenant_id` | `workspace_id` |
| Code layout | Flat `handlers/`, `services/`, `models/` | One folder per domain module with `models/`, `repo/`, `handlers/`, `messaging/` (see `andishi/docs/design.md`) |
| Schema changes | `schema.sql` plus index setup in Go | Numbered migrations, latest is `000094` |
| Money | `float64` on `decimal(16,2)` | No money columns outside billing |
| Public access | API key with scopes, or tenant resolved from host | Publishable key on `/pub` routes, rate limited |
| Background work | None | Durable job queue and broker |

## What the port looks like in Andishi

### 1. A new `commerce` domain module

`andishi/server/modules/commerce/`, following the existing module pattern.

Bring over:

- products, options, variants, product images (images should use Andishi's media library, not a second upload path);
- categories and collections;
- stock, simplified to one location per workspace for now;
- customers and addresses;
- carts and cart items;
- orders, order items and transactions;
- checkout settings;
- payment provider credentials and the encryption helper.

Leave behind, because Andishi already has its own or it is out of scope:

- tenants, team, roles, API keys, billing, domains;
- themes, the page builder and content pages;
- marketing subscribers and templates (Andishi's newsletter module covers this);
- analytics, conversations, loyalty, translations, reviews;
- purchase orders and vendors.

### 2. A payments package

`andishi/server/pkg/payments/`, behind an interface like the other providers in `pkg/`.

- Port the M-Pesa client from `services/mpesa.go`.
- Andishi already has a Paystack client in `pkg/billing/providers/paystack`. It charges Andishi's own subscriptions with the platform key. Taking card payments for a merchant needs the merchant's keys, so it is a second use of the same client, not the same wiring.

### 3. Routes

| Group | Who calls it | Routes |
| --- | --- | --- |
| Studio (signed in) | The merchant | CRUD for products, variants, categories, collections, orders, customers, checkout settings, payment providers |
| Public (`/pub`, publishable key, rate limited) | The generated site | List and get products, collections and categories. Checkout methods and checkout settings. Create cart, add item, set quantity, checkout. Order status. M-Pesa status |
| Webhook (no auth) | Safaricom | M-Pesa callback |

The public write routes follow the same pattern as the contact form and subscribe endpoints in `modules/newsletter`.

### 4. Scaffold additions

In `andishi/scaffolds/react-site/`, all locked so the model composes them and never writes payment code:

- `src/lib/andishi/commerce.ts` for build-time product reads, next to `collections.ts`;
- `src/lib/andishi/commerce-client.ts` for the cart and checkout calls, next to `runtime-client.ts`;
- `src/components/ui/` components: add to cart, cart, checkout form, order confirmation.

**The checkout form is generated from checkout settings.** Kikapu's `CheckoutSettings` already describes which fields to show and whether each is required. The scaffold's checkout component reads those settings and renders the matching form, then the M-Pesa prompt and a waiting state that polls for payment.

### 5. Generation changes

- Extend the system prompt and `prompts/skills/scaffold-api.md` with the commerce helpers.
- Intake recognises a business that sells, proposes a product catalogue and seeds products from the brief.
- New page types: shop listing, product page, cart, checkout.
- The contract currently allows dynamic routes only for written content (`src/pages/{channel}/[slug].tsx`). Product pages need the same allowance.
- Pages are prerendered at build time, so price and stock on a product page must be fetched in the browser, or the site rebuilt when a product changes. Decide which before building the product page.

### 6. Studio screens

Products, orders, customers, payment settings and checkout settings in `andishi/client`. Kikapu's dashboard is also Next.js, so its screens are a close reference.

## Fix during the port, do not copy

1. **Stock is taken when the order is created, before payment.** An abandoned M-Pesa prompt holds stock forever. Add an expiry that releases unpaid orders.
2. **The M-Pesa callback trusts the request.** It matches on `CheckoutRequestID` only and does not check the amount paid. Confirm with an STK status query and compare the amount before marking an order paid.
3. **Cancelling an order does not restock.** This is deliberate in Kikapu. Decide the rule for Andishi.
4. **Totals ignore discounts, tax and shipping.** Either leave them out of the first release on purpose or wire them into order creation.
5. **Money is `float64`.** Use integer cents or decimals. Rasilimali already uses decimals everywhere, which matters if the catalogues are joined later.
6. **A failed STK push leaves a pending order with no way to retry payment** from the public API. Add a "pay for this order again" route.
7. **Write tests as you port.** Order creation, stock decrement and the callback are the three that matter.

## Working at the same time

| Area | Owner | Folders |
| --- | --- | --- |
| Backend port | Co-founder | `server/modules/commerce/`, `server/pkg/payments/`, `server/db/migrations/`, `server/cmd/server.go`, `server/openapi.yaml` |
| Scaffold and prompts | Co-founder | `scaffolds/react-site/`, `prompts/` |
| Studio UI | Joshua | `client/` |

To keep the two streams from blocking each other:

- **Agree the API contract first.** Add the commerce routes to `server/openapi.yaml` before either side builds, so the UI can be built against it.
- **Branch from `release`.** The backend work goes on its own branch, for example `feature/commerce`, and merges into `release` in the phases below.
- **Reserve migration numbers.** `release` is at `000094`. Agree a block for the commerce port so UI-side migrations do not collide.
- **The scaffold is shared ground.** `release` has uncommitted client changes today. Commit or stash them before the backend branch is cut.

## Suggested order

1. Contract in OpenAPI, migrations, and the studio API for products and stock.
2. Public read routes and the scaffold's product helpers. A generated site can show products.
3. Cart, checkout, M-Pesa and the callback, with the fixes above. A buyer can pay.
4. Generation: intake, seeding, prompts and the new page types. The AI builder produces a store.
5. Later: discounts, shipping and tax, refunds, card payments, point of sale.

## Decisions needed

- **Where does the catalogue live long term?** Earlier planning had Rasilimali's catalogue and posting engine as the single source for the combined platform. This port creates Andishi's own copy. If that stays the plan, keep table shapes and IDs close to Rasilimali's so they can be joined later.
- **What happens to standalone Kikapu** once Andishi can sell?
- **Is cash on delivery in the first release**, or M-Pesa only?
- **Which plans get the store?** The current pricing idea gives every plan every service, limited by orders a month.
- **Live price and stock, or rebuild on change?** See section 5.
