# Aljamaal Official — Project Guide for Claude

## Project Overview
E-commerce website for **Al Jamaal Official** (@aljamaal_official), a South African modest fashion and lifestyle brand based in Robertsham, Johannesburg. Clients are AbuBakr and Abdurrahman Behra (father and son).

Built by UMass Boston IT485 Group 8 as a capstone project:
- Rehan Syed, Cristian Sarmiento, Carsten Jonas, Alec Pierre Louis

**Live URL:** https://aljamaalofficial.com (also https://umbit485g8.disent.com)  
**GitHub:** https://github.com/RehanSyed04/Al-Jamaal  
**Server path:** /var/www/html

---

## Tech Stack
- **Frontend: plain HTML/CSS/JS — no frameworks, no build tools**
- **Backend: Cloudflare Worker + D1 database + R2 storage (serverless)**
- Product data lives in **Cloudflare D1** (source of truth) — synced to browser via `/get-products` on page load. `js/products-data.js` is a fallback only.
- Stock tracked per size+colour in D1 `stock` table, managed via admin dashboard
- Cart state stored in `localStorage` under key `aljamaal_cart`, managed via `CartManager` object in `script.js`
- Cart auto-expires after **30 minutes of inactivity** via `aljamaal_cart_expiry` localStorage key
- Order data passed from checkout → thank you page via `localStorage` key `aljamaal_last_order`
- **Cloudflare Worker** (`aljamaal-shipping`) proxies all D1 reads/writes and external APIs (TCG, Resend)
- **Admin dashboard** at `dashboard.html` — password protected, manages products/stock/settings

---

## Code Style Rules
- Write the **simplest code possible** — plain HTML/CSS/JS only
- No abstractions, no clever patterns, no frameworks
- Comment only where logic isn't obvious
- The user has low coding experience — keep everything readable and maintainable
- Do **not** add "Co-Authored-By" lines to git commit messages

---

## External Services

### PayFast (Payments) — LIVE
- Merchant ID: `34451647` | Merchant Key: `hsgypuphwxgot`
- Live URL: `https://www.payfast.co.za/eng/process`
- Return URL: `https://aljamaalofficial.com/thankyou.html`
- Cancel URL: `https://aljamaalofficial.com/cart.html`

### The Courier Guy / Shiplogic (Shipping) — LIVE
- API via Cloudflare Worker (keeps API key off the browser)
- Worker URL: `https://aljamaal-shipping.syedsarmiento.workers.dev`
- Endpoints: `/rates` (POST) and `/shipments` (POST)
- Auth: `Authorization: Bearer <key>` (NOT X-API-Key)
- Tracking reference field: `short_tracking_reference` (not `waybill_number`)
- Real API key active in Cloudflare Worker (aljamaal-shipping.syedsarmiento.workers.dev)

### Resend (Order Confirmation Emails) — LIVE
- API key in Cloudflare Worker (`RESEND_API_KEY`)
- Domain: `aljamaalofficial.com` (verified Apr 2026, eu-west-1)
- From: `orders@aljamaalofficial.com` | Reply-To: `aljamaalcustomersupport@gmail.com`
- Triggered from `thankyou.html` via Worker `/send-confirmation` endpoint
- Sends two emails per order: customer confirmation + client "New Order" notification
- DNS records managed by Anthony at disent (anthony.malizio@disent.com)

### Cloudflare D1 (Database) — LIVE
- Database name: `aljamaal-stock` | Bound to Worker as `DB`
- Tables: `products` (all product data), `stock` (per size+colour qty), `settings` (maintenance mode)
- All product/stock changes go through admin dashboard → Worker → D1
- **Never edit products-data.js for new products** — use the admin dashboard

### Cloudflare R2 (Image Storage) — IN PROGRESS
- Bucket name: `aljamaal-images` | Bound to Worker as `IMAGES`
- Public Development URL: TBD (being set up Apr 2026)
- Purpose: Admin-uploaded product images stored in R2, served via public URL

### Admin Dashboard
- URL: `dashboard.html` | Password: `Aljamaal@786` (ADMIN_SECRET in Worker env)
- Tabs: Overview (low stock alerts), Products (add/edit/reorder), Stock (inline qty editing), Settings (maintenance mode)
- To add a new product: Products tab → fill form → Save. Then Stock tab → set quantities.

### EmailJS (Contact Form)
- Account: aljamaalcustomersupport@gmail.com (client's account)
- Public Key: `7SF-nob6cWJgKT8d1`
- Service ID: `service_c0nsybo`
- Contact template: `template_ysskhq2` | Auto-reply template: `template_3595ztf`
- Used on `contact.html` only
- **Cannot** be used for PayFast ITN order confirmation emails

---

## Key Implementation Details

### CSS Versioning
Stylesheet links use `?v=N` query param (e.g. `?v=13`). Increment when making breaking CSS changes.

### Parcel Size Categories (used in checkout.html for TCG shipping)
| Category | Product IDs | Dimensions (L×W×H cm) | Weight (kg) |
|---|---|---|---|
| Small | 3, 7, 11, 12 | 30 × 20 × 5 | 2.0 (TCG min) |
| Medium | 5, 6, 8, 13 | 40 × 30 × 8 | 2.0 (TCG min) |
| Large | all others | 50 × 40 × 10 | 4.0 (volumetric) |

### aljamaal_last_order Structure
```json
{
  "delivery_address": { "type": "residential", "street_address": "...", "local_area": "...", "city": "...", "zone": "...", "country": "ZA", "code": "..." },
  "delivery_contact": { "name": "...", "mobile_number": "...", "email": "..." },
  "parcels": [{ "submitted_length_cm": 30, "submitted_width_cm": 20, "submitted_height_cm": 5, "submitted_weight_kg": 2.0 }],
  "shipping": { "code": "ECO", "rate": 95.00, "name": "Economy" },
  "subtotal": 950.00,
  "grand_total": 1045.00
}
```

---

## Open Bugs (as of Apr 2026)
| # | Description |
|---|---|
| 28 | ~~No branded order confirmation email after PayFast payment~~ — resolved Apr 2026 |
| 34 | Sizes missing from individual product pages |
| 35 | ~~Collection address + TCG API key are placeholders~~ — resolved Apr 2026 |
| 37 | ~~PayFast return URL points to disent.com~~ — resolved Apr 2026 |
| 39 | Non-SA phone numbers clear the phone field — won't fix (SA-only store) |
| 40 | Mobile remove button on cart doesn't show |
| 41 | ~~Cart qty + button used static products-data.js stock~~ — fixed Apr 2026 (D1 fetch on cart load) |
| 42 | ~~Checkout allowed overselling~~ — fixed Apr 2026 (D1 stock check before PayFast submit) |
| 43 | ~~TCG phone numbers sent as +27XXXXXXXXX~~ — fixed Apr 2026 (normPhone in Worker) |
| 44 | ~~Worker /get-products didn't include stock data~~ — fixed Apr 2026 (parallel stock JOIN) |

---

## Go-Live Checklist (for client handoff)
- [x] PayFast: live Merchant ID + Key + action URL updated in checkout.html (Apr 2026)
- [x] TCG/Shiplogic: real API key active in Cloudflare Worker (Apr 2026)
- [x] Cloudflare Worker: swap API key, collection address, and collection phone number
- [x] Update PayFast return/cancel URLs from disent.com → aljamaalofficial.com (Apr 2026)
- [ ] Add sizes to all individual product pages
- [x] Set `TEST_MODE = false` in checkout.html (Apr 2026)
- [x] Uncomment `bookShipment(order)` in thankyou.html (Apr 2026)
- [ ] Remove Testing Item (id: 99) from top of js/products-data.js (when client is done testing)
- [x] Replace placeholder email → aljamaalcustomersupport@gmail.com
- [x] Replace placeholder WhatsApp → +27 79 753 0827
