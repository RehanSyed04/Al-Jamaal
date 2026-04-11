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
- **Pure static HTML/CSS/JS — no frameworks, no build tools, no backend**
- All product data lives in `js/products-data.js` (single source of truth)
- Cart state stored in `localStorage` under key `aljamaal_cart`, managed via `CartManager` object in `script.js`
- Order data passed from checkout → thank you page via `localStorage` key `aljamaal_last_order`

---

## Code Style Rules
- Write the **simplest code possible** — plain HTML/CSS/JS only
- No abstractions, no clever patterns, no frameworks
- Comment only where logic isn't obvious
- The user has low coding experience — keep everything readable and maintainable
- Do **not** add "Co-Authored-By" lines to git commit messages

---

## External Services

### PayFast (Payments) — currently SANDBOX
- Merchant ID: `10000100` | Merchant Key: `46f0cd694581a`
- Sandbox URL: `https://sandbox.payfast.co.za/eng/process`
- Return URL: `https://umbit485g8.disent.com/thankyou.html`
- Cancel URL: `https://umbit485g8.disent.com/cart.html`
- **Go-live:** swap Merchant ID/Key/URL and update return/cancel URLs to aljamaalofficial.com

### The Courier Guy / Shiplogic (Shipping) — currently SANDBOX
- API via Cloudflare Worker (keeps API key off the browser)
- Worker URL: `https://aljamaal-shipping.syedsarmiento.workers.dev`
- Endpoints: `/rates` (POST) and `/shipments` (POST)
- Auth: `Authorization: Bearer <key>` (NOT X-API-Key)
- Tracking reference field: `short_tracking_reference` (not `waybill_number`)
- **Go-live:** client registers production Shiplogic account, gets real API key, updates Worker

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
| Small | 3, 7, 11, 12 | 30 × 20 × 5 | 0.5 |
| Medium | 5, 6, 8, 13 | 40 × 30 × 8 | 1.0 |
| Large | all others | 50 × 40 × 10 | 1.5 |

### aljamaal_last_order Structure
```json
{
  "delivery_address": { "type": "residential", "street_address": "...", "local_area": "...", "city": "...", "zone": "...", "country": "ZA", "code": "..." },
  "delivery_contact": { "name": "...", "mobile_number": "...", "email": "..." },
  "parcels": [{ "submitted_length_cm": 30, "submitted_width_cm": 20, "submitted_height_cm": 5, "submitted_weight_kg": 0.5 }],
  "shipping": { "code": "ECO", "rate": 95.00, "name": "Economy" },
  "subtotal": 950.00,
  "grand_total": 1045.00
}
```

---

## Open Bugs (as of Apr 2026)
| # | Description |
|---|---|
| 28 | No branded order confirmation email after PayFast payment |
| 34 | Sizes missing from individual product pages |
| 35 | ~~Collection address + TCG API key are placeholders~~ — resolved Apr 2026 |
| 37 | PayFast return URL points to disent.com instead of aljamaalofficial.com |
| 39 | Non-SA phone numbers clear the phone field — TCG gets empty mobile_number |
| 40 | Mobile remove button on cart doesn't show |

---

## Go-Live Checklist (for client handoff)
- [ ] PayFast: register production account, swap Merchant ID + Key + action URL in checkout.html
- [ ] TCG/Shiplogic: register production account, get real API key
- [x] Cloudflare Worker: swap API key, collection address, and collection phone number
- [ ] Update PayFast return/cancel URLs from disent.com → aljamaalofficial.com
- [ ] Muslim Blocks product: add real image or mark Sold Out
- [ ] Add sizes to all individual product pages
- [x] Replace placeholder email → aljamaalcustomersupport@gmail.com
- [x] Replace placeholder WhatsApp → +27 79 753 0827
