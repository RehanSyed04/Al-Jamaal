// Cloudflare Worker — aljamaal-shipping
// Deploy via: https://dash.cloudflare.com → Workers → aljamaal-shipping → Edit

const TCG_API_KEY = 'd4ef5bf33dbe49d7b720a4002b7dedae';
const TCG_BASE_URL = 'https://api.shiplogic.com';
const RESEND_API_KEY = 're_FAzY8gYH_PFFkELit8ShPW2uMuGFzReZJ';
const R2_PUBLIC_URL = 'https://pub-b35de379d8c54969986deae8388ecdd1.r2.dev';

const COLLECTION_ADDRESS = {
  type: 'business', company: 'Aljamaal Official',
  street_address: '9 Altham Road', local_area: 'Robertsham',
  city: 'Johannesburg', zone: 'Gauteng', country: 'ZA', code: '2091'
};

const COLLECTION_CONTACT = {
  name: 'Aljamaal Official',
  mobile_number: '+27603023555'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function bustProductsCache(ctx, requestUrl) {
  const base = new URL(requestUrl);
  base.pathname = '/get-products';
  base.search = '';
  const cache = caches.default;
  ctx.waitUntil(Promise.all([
    cache.delete(new Request(base.toString())),
    cache.delete(new Request(base.toString() + '?stock=1'))
  ]));
}

function normPhone(p) {
  if (!p) return '';
  const d = p.replace(/\D/g, '');
  if (d.startsWith('27') && d.length === 11) return '0' + d.slice(2);
  return p;
}

function parseUA(ua) {
  if (!ua) return { os: 'Unknown', browser: 'Unknown' };
  let os = 'Unknown';
  if (ua.includes('Windows NT'))                          os = 'Windows';
  else if (ua.includes('Android'))                        os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad'))  os = 'iOS';
  else if (ua.includes('Mac OS X'))                       os = 'macOS';
  else if (ua.includes('Linux'))                          os = 'Linux';
  let browser = 'Unknown';
  if (ua.includes('Edg/'))                                browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera/'))  browser = 'Opera';
  else if (ua.includes('Firefox/'))                       browser = 'Firefox';
  else if (ua.includes('Chrome/'))                        browser = 'Chrome';
  else if (ua.includes('Safari/'))                        browser = 'Safari';
  return { os, browser };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const url  = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'POST' && path === '/rates') {
      try {
        const body = await request.json();
        const res = await fetch(`${TCG_BASE_URL}/rates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TCG_API_KEY}` },
          body: JSON.stringify({ collection_address: COLLECTION_ADDRESS, delivery_address: body.delivery_address, parcels: body.parcels })
        });
        const text = await res.text();
        try { return json(JSON.parse(text), res.status); }
        catch (e) { return json({ error: 'TCG raw response', detail: text }, 502); }
      } catch (err) { return json({ error: 'Worker error', detail: err.message }, 500); }
    }

    if (request.method === 'POST' && path === '/shipments') {
      try {
        const body = await request.json();
        const dc = body.delivery_contact || {};
        const payload = {
          service_level_code: body.service_level_code,
          collection_address: COLLECTION_ADDRESS,
          collection_contact: {
            name: COLLECTION_CONTACT.name,
            mobile_number: normPhone(COLLECTION_CONTACT.mobile_number)
          },
          delivery_address: body.delivery_address,
          delivery_contact: {
            name: dc.name || '',
            mobile_number: normPhone(dc.mobile_number),
            email: dc.email || ''
          },
          parcels: body.parcels
        };
        const res = await fetch(`${TCG_BASE_URL}/shipments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TCG_API_KEY}` },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log('TCG /shipments status:', res.status, '| body:', text.slice(0, 800));
        try {
          const shipData = JSON.parse(text);
          if (res.status < 300 && shipData.short_tracking_reference) {
            await env.DB.prepare('INSERT INTO logs (event_type, description) VALUES (?, ?)')
              .bind('shipment_booked', `Shipment booked — Tracking: ${shipData.short_tracking_reference}`).run();
          }
          return json(shipData, res.status);
        } catch (e) {
          console.error('TCG non-JSON response (status ' + res.status + '):', text.slice(0, 800));
          return json({ error: 'TCG raw response', detail: text.slice(0, 800) }, 502);
        }
      } catch (err) {
        console.error('Worker /shipments error:', err.message);
        return json({ error: 'Worker error', detail: err.message }, 500);
      }
    }

    if (request.method === 'POST' && path === '/send-confirmation') {
      try {
        const body = await request.json();
        const contact = body.delivery_contact || {};
        const addr = body.delivery_address || {};
        const ship = body.shipping || {};
        const items = body.items || [];

        const itemsHTML = items.map(item =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
            <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">R ${(item.price * item.qty).toFixed(2)}</td>
          </tr>`
        ).join('');

        const trackingHTML = body.tracking_number
          ? `<p><strong>Tracking Number:</strong> <span style="font-family:monospace;font-size:16px;">${body.tracking_number}</span></p>
             <p><a href="https://www.thecourierguy.co.za/tracking/" style="color:#8B7355;">Track your parcel →</a></p>`
          : `<p style="color:#888;">Your shipment is being arranged. We'll be in touch shortly.</p>`;

        const customerHTML = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#1a1a1a;padding:24px;text-align:center;">
              <h1 style="color:#C9A96E;font-size:24px;margin:0;">Al Jamaal Official</h1>
              <p style="color:#888;margin:4px 0 0;font-size:13px;">الجمال</p>
            </div>
            <div style="padding:32px 24px;">
              <h2 style="color:#1a1a1a;">Order Confirmed</h2>
              <p>Hi ${contact.name || 'there'},</p>
              <p>Thank you for your order! Your payment was received and your order is being prepared.</p>
              <h3 style="border-bottom:2px solid #C9A96E;padding-bottom:8px;">Items Ordered</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr style="font-size:12px;text-transform:uppercase;color:#888;">
                  <th style="text-align:left;padding-bottom:8px;">Item</th>
                  <th style="text-align:center;padding-bottom:8px;">Qty</th>
                  <th style="text-align:right;padding-bottom:8px;">Price</th>
                </tr>
                ${itemsHTML}
              </table>
              <table style="width:100%;margin-top:16px;">
                <tr><td>Subtotal</td><td style="text-align:right;">R ${parseFloat(body.subtotal||0).toFixed(2)}</td></tr>
                <tr><td>Shipping (${ship.name||''})</td><td style="text-align:right;">R ${parseFloat(ship.rate||0).toFixed(2)}</td></tr>
                <tr style="font-weight:bold;font-size:16px;">
                  <td style="padding-top:8px;border-top:2px solid #1a1a1a;">Total (ZAR)</td>
                  <td style="padding-top:8px;border-top:2px solid #1a1a1a;text-align:right;">R ${parseFloat(body.grand_total||0).toFixed(2)}</td>
                </tr>
              </table>
              <h3 style="border-bottom:2px solid #C9A96E;padding-bottom:8px;margin-top:32px;">Delivery</h3>
              ${trackingHTML}
              <p style="margin-top:32px;">If you have any questions, contact us on <a href="https://wa.me/27603023555" style="color:#8B7355;">WhatsApp</a> or email <a href="mailto:aljamaalcustomersupport@gmail.com" style="color:#8B7355;">aljamaalcustomersupport@gmail.com</a>.</p>
              <p>JazakAllah Khair,<br><strong>Al Jamaal Official</strong></p>
            </div>
            <div style="background:#f5f5f0;padding:16px;text-align:center;font-size:12px;color:#888;">
              &copy; 2026 Al Jamaal Official &mdash; Timeless South African Fashion
            </div>
          </div>`;

        const clientHTML = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#1a1a1a;padding:24px;text-align:center;">
              <h1 style="color:#C9A96E;font-size:24px;margin:0;">New Order Received</h1>
            </div>
            <div style="padding:32px 24px;">
              <h3 style="border-bottom:2px solid #C9A96E;padding-bottom:8px;">Items to Pack</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr style="font-size:12px;text-transform:uppercase;color:#888;">
                  <th style="text-align:left;padding-bottom:8px;">Item</th>
                  <th style="text-align:center;padding-bottom:8px;">Qty</th>
                  <th style="text-align:right;padding-bottom:8px;">Price</th>
                </tr>
                ${itemsHTML}
              </table>
              <table style="width:100%;margin-top:16px;">
                <tr><td>Subtotal</td><td style="text-align:right;">R ${parseFloat(body.subtotal||0).toFixed(2)}</td></tr>
                <tr><td>Shipping (${ship.name||''})</td><td style="text-align:right;">R ${parseFloat(ship.rate||0).toFixed(2)}</td></tr>
                <tr style="font-weight:bold;font-size:16px;">
                  <td style="padding-top:8px;border-top:2px solid #1a1a1a;">Total (ZAR)</td>
                  <td style="padding-top:8px;border-top:2px solid #1a1a1a;text-align:right;">R ${parseFloat(body.grand_total||0).toFixed(2)}</td>
                </tr>
              </table>
              <h3 style="border-bottom:2px solid #C9A96E;padding-bottom:8px;margin-top:32px;">Ship To</h3>
              <p style="margin:4px 0;"><strong>${contact.name||'—'}</strong></p>
              <p style="margin:4px 0;">${contact.email||'—'}</p>
              <p style="margin:4px 0;">${contact.mobile_number||'—'}</p>
              <p style="margin:4px 0;margin-top:8px;">${addr.street_address||''}, ${addr.local_area||''}</p>
              <p style="margin:4px 0;">${addr.city||''}, ${addr.zone||''}, ${addr.code||''}</p>
              ${body.tracking_number ? `<h3 style="border-bottom:2px solid #C9A96E;padding-bottom:8px;margin-top:32px;">TCG Tracking</h3><p style="font-family:monospace;font-size:18px;font-weight:bold;">${body.tracking_number}</p>` : ''}
            </div>
          </div>`;

        await Promise.all([
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: 'Al Jamaal Official <orders@aljamaalofficial.com>',
              reply_to: ['aljamaalcustomersupport@gmail.com'],
              to: [contact.email],
              subject: 'Your Al Jamaal Order is Confirmed',
              html: customerHTML
            })
          }),
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: 'Al Jamaal Official <orders@aljamaalofficial.com>',
              to: ['aljamaalcustomersupport@gmail.com'],
              subject: `New Order — ${contact.name || 'Customer'} — R ${parseFloat(body.grand_total||0).toFixed(2)}`,
              html: clientHTML
            })
          })
        ]);

        await env.DB.prepare('INSERT INTO logs (event_type, description) VALUES (?, ?)')
          .bind('email_sent', `Confirmation email sent to ${contact.email || 'customer'}`).run();

        return json({ ok: true });
      } catch (err) { return json({ error: 'Worker error', detail: err.message }, 500); }
    }

    // ── Image endpoints ──────────────────────────────────────────

    if (request.method === 'POST' && path === '/upload-image') {
      const authKey = request.headers.get('X-Admin-Key');
      if (!authKey || authKey !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) return json({ error: 'No file provided' }, 400);
        const ext = (file.name || '').split('.').pop().toLowerCase();
        if (!['jpg','jpeg','png','webp','gif'].includes(ext))
          return json({ error: 'Invalid file type. Use JPG, PNG, WEBP, or GIF.' }, 400);
        const objectKey = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const buffer = await file.arrayBuffer();
        await env.IMAGES.put(objectKey, buffer, { httpMetadata: { contentType: file.type } });
        return json({ ok: true, key: objectKey, url: `${R2_PUBLIC_URL}/${objectKey}` });
      } catch (err) { return json({ error: 'Upload failed', detail: err.message }, 500); }
    }

    if (request.method === 'GET' && path === '/list-images') {
      const authKey = request.headers.get('X-Admin-Key');
      if (!authKey || authKey !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      try {
        const listed = await env.IMAGES.list();
        const images = (listed.objects || []).map(function(obj) {
          return { key: obj.key, url: `${R2_PUBLIC_URL}/${obj.key}`, size: obj.size, uploaded: obj.uploaded };
        });
        return json(images);
      } catch (err) { return json({ error: 'List failed', detail: err.message }, 500); }
    }

    if (request.method === 'POST' && path === '/delete-image') {
      const authKey = request.headers.get('X-Admin-Key');
      if (!authKey || authKey !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (!body.key) return json({ error: 'key required' }, 400);
      try {
        await env.IMAGES.delete(body.key);
        return json({ ok: true });
      } catch (err) { return json({ error: 'Delete failed', detail: err.message }, 500); }
    }

    // ── Stock endpoints ──────────────────────────────────────────

    if (request.method === 'GET' && path === '/get-stock') {
      const productId = parseInt(url.searchParams.get('product_id'));
      if (!productId) return json({ error: 'Missing product_id' }, 400);
      const rows = await env.DB.prepare(
        'SELECT stock_key, color, qty FROM stock WHERE product_id = ?'
      ).bind(productId).all();
      if (!rows.results || rows.results.length === 0)
        return json({ product_id: productId, stock: null });
      const complexRows = rows.results.filter(r => r.stock_key !== '__simple__');
      if (complexRows.length === 0) {
        // Purely simple stock — return total qty
        const simpleRow = rows.results.find(r => r.stock_key === '__simple__');
        return json({ product_id: productId, stock: simpleRow ? simpleRow.qty : 0 });
      }
      // Has size/colour stock — build map from complex rows only (ignore stale __simple__)
      const stock = {};
      for (const row of complexRows) {
        if (!stock[row.stock_key]) stock[row.stock_key] = {};
        stock[row.stock_key][row.color] = row.qty;
      }
      return json({ product_id: productId, stock });
    }

    if (request.method === 'GET' && path === '/get-all-stock') {
      const rows = await env.DB.prepare(
        'SELECT product_id, stock_key, color, qty FROM stock ORDER BY product_id, stock_key, color'
      ).all();
      const result = {};
      for (const row of rows.results) {
        const pid = row.product_id;
        if (!result[pid]) result[pid] = {};
        if (row.stock_key === '__simple__') {
          result[pid].__simple__ = row.qty;
        } else {
          if (!result[pid][row.stock_key]) result[pid][row.stock_key] = {};
          result[pid][row.stock_key][row.color] = row.qty;
        }
      }
      return json(result);
    }

    if (request.method === 'POST' && path === '/decrement-stock') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      const items = body.items;
      if (!Array.isArray(items) || items.length === 0)
        return json({ error: 'items array required' }, 400);
      const results = [], failed = [];
      const updatedProductIds = new Set();
      for (const item of items) {
        const { productId, stockKey, color, qty } = item;
        if (!stockKey && !color) { results.push({ ...item, status: 'skipped' }); continue; }
        const key   = stockKey || '__simple__';
        const col   = color    || '__none__';
        const decBy = parseInt(qty) || 1;
        const stmt = await env.DB.prepare(
          `UPDATE stock SET qty = qty - ?, updated_at = datetime('now')
           WHERE product_id = ? AND stock_key = ? AND color = ? AND qty >= ?`
        ).bind(decBy, productId, key, col, decBy).run();
        if (stmt.meta.changes === 0) {
          failed.push({ productId, stockKey, color, requested: decBy });
          results.push({ ...item, status: 'insufficient' });
        } else {
          results.push({ ...item, status: 'ok' });
          updatedProductIds.add(productId);
          const depRow = await env.DB.prepare(
            'SELECT qty FROM stock WHERE product_id = ? AND stock_key = ? AND color = ?'
          ).bind(productId, key, col).first();
          if (depRow && depRow.qty === 0) {
            const label = key === '__simple__' ? 'simple' : key + (col !== '__none__' ? '/' + col : '');
            await env.DB.prepare('INSERT INTO logs (event_type, description) VALUES (?, ?)')
              .bind('stock_depleted', `Stock depleted — Product ${productId} [${label}]`).run();
          }
        }
      }
      for (const pid of updatedProductIds) {
        const remaining = await env.DB.prepare(
          'SELECT SUM(qty) as total FROM stock WHERE product_id = ?'
        ).bind(pid).first();
        if (remaining && remaining.total === 0) {
          await env.DB.prepare(
            "UPDATE products SET badge = 'Sold Out' WHERE id = ?"
          ).bind(pid).run();
        }
      }
      const orderMeta = body.orderMeta || {};
      const orderDesc = orderMeta.customerName
        ? `Order by ${orderMeta.customerName} — ${orderMeta.itemCount} item(s) — R ${parseFloat(orderMeta.grandTotal || 0).toFixed(2)}`
        : `Order placed — ${items.length} item(s)`;
      await env.DB.prepare('INSERT INTO logs (event_type, description) VALUES (?, ?)')
        .bind('order_placed', orderDesc).run();
      return json({ results, failed }, failed.length === 0 ? 200 : 207);
    }

    if (request.method === 'POST' && path === '/set-stock') {
      const authHeader = request.headers.get('X-Admin-Key');
      if (!authHeader || authHeader !== env.ADMIN_SECRET)
        return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      const { productId, stockKey, color, qty } = body;
      if (!productId || qty === undefined)
        return json({ error: 'productId and qty required' }, 400);
      const key = stockKey || '__simple__';
      const col = color    || '__none__';
      await env.DB.prepare(
        `INSERT INTO stock (product_id, stock_key, color, qty, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT (product_id, stock_key, color)
         DO UPDATE SET qty = excluded.qty, updated_at = excluded.updated_at`
      ).bind(productId, key, col, parseInt(qty)).run();
      const remaining = await env.DB.prepare(
        'SELECT SUM(qty) as total FROM stock WHERE product_id = ?'
      ).bind(productId).first();
      if (remaining && remaining.total === 0) {
        await env.DB.prepare(
          "UPDATE products SET badge = 'Sold Out' WHERE id = ?"
        ).bind(productId).run();
      } else if (remaining && remaining.total > 0) {
        await env.DB.prepare(
          "UPDATE products SET badge = '' WHERE id = ? AND badge = 'Sold Out'"
        ).bind(productId).run();
      }
      bustProductsCache(ctx, request.url);
      return json({ ok: true });
    }

    if (request.method === 'POST' && path === '/verify-admin') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      const ua = parseUA(request.headers.get('User-Agent') || '');
      const cf = request.cf || {};
      const ip = request.headers.get('CF-Connecting-IP') || 'Unknown';
      const location = [cf.city, cf.region, cf.country].filter(Boolean).join(', ') || 'Unknown';
      await env.DB.prepare('INSERT INTO logs (event_type, description) VALUES (?, ?)')
        .bind('admin_login', `Admin login — ${ua.browser} on ${ua.os} — ${location} (${ip})`).run();
      return json({ ok: true });
    }

    if (request.method === 'POST' && path === '/log-event') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare('INSERT INTO logs (event_type, description, details) VALUES (?, ?, ?)')
        .bind(body.event_type || 'unknown', body.description || '', body.details ? JSON.stringify(body.details) : null).run();
      return json({ ok: true });
    }

    if (request.method === 'GET' && path === '/get-logs') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      const { results } = await env.DB.prepare(
        'SELECT * FROM logs ORDER BY created_at DESC LIMIT 500'
      ).all();
      return json(results);
    }

    if (request.method === 'GET' && path === '/maintenance-status') {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'maintenance_mode'").first();
      return json({ maintenance: row ? row.value === 'true' : false });
    }

    if (request.method === 'GET' && path === '/get-featured') {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'featured_products'").first();
      if (!row) return json([1, 2, 50, 10]);
      try { return json(JSON.parse(row.value)); } catch { return json([1, 2, 50, 10]); }
    }

    if (request.method === 'POST' && path === '/set-featured') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare(
        "INSERT INTO settings (key, value) VALUES ('featured_products', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      ).bind(JSON.stringify(body)).run();
      return json({ ok: true });
    }

    if (request.method === 'GET' && path === '/get-announcements') {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'announcements'").first();
      if (!row) return json([]);
      try { return json(JSON.parse(row.value)); } catch { return json([]); }
    }

    if (request.method === 'POST' && path === '/set-announcements') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare(
        "INSERT INTO settings (key, value) VALUES ('announcements', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      ).bind(JSON.stringify(body)).run();
      return json({ ok: true });
    }

    if (request.method === 'GET' && path === '/get-popup') {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'popup_config'").first();
      if (!row) return json(null);
      try { return json(JSON.parse(row.value)); } catch { return json(null); }
    }

    if (request.method === 'POST' && path === '/set-popup') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare(
        "INSERT INTO settings (key, value) VALUES ('popup_config', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      ).bind(JSON.stringify(body)).run();
      return json({ ok: true });
    }

    if (request.method === 'POST' && path === '/set-maintenance') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare(
        "INSERT INTO settings (key, value) VALUES ('maintenance_mode', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      ).bind(body.on ? 'true' : 'false').run();
      return json({ ok: true, maintenance: body.on });
    }

    if (request.method === 'GET' && path === '/get-products') {
      const isAdmin = request.headers.get('X-Admin-Key') === env.ADMIN_SECRET;
      const includeStock = isAdmin || url.searchParams.get('stock') === '1';

      // Serve from edge cache for non-admin requests without cache-busting param
      // Admin always bypasses cache; ?t= param (checkout stock check) also bypasses
      const canCache = !isAdmin && !url.searchParams.get('t');
      if (canCache) {
        const cache = caches.default;
        const cacheKey = new Request(request.url);
        const cached = await cache.match(cacheKey);
        if (cached) return cached;
      }

      const productSql = isAdmin
        ? 'SELECT * FROM products WHERE active = 1 ORDER BY sort_order, id'
        : 'SELECT * FROM products WHERE active = 1 AND (hidden IS NULL OR hidden = 0) ORDER BY sort_order, id';
      const queries = [env.DB.prepare(productSql).all()];
      if (includeStock) queries.push(env.DB.prepare('SELECT product_id, stock_key, color, qty FROM stock').all());
      const [productRows, stockResult] = await Promise.all(queries);
      const stockMap = {};
      const stockHasComplex = {};
      if (includeStock) {
        for (const row of ((stockResult && stockResult.results) || [])) {
          const pid = row.product_id;
          if (!stockMap[pid]) stockMap[pid] = {};
          if (row.stock_key === '__simple__') {
            stockMap[pid].__simple__ = row.qty;
          } else {
            stockHasComplex[pid] = true;
            if (!stockMap[pid][row.stock_key]) stockMap[pid][row.stock_key] = {};
            stockMap[pid][row.stock_key][row.color] = row.qty;
          }
        }
        // Remove stale __simple__ entries from products that have size/colour stock
        for (const pid of Object.keys(stockHasComplex)) {
          delete stockMap[pid].__simple__;
        }
      }
      const products = (productRows.results || []).map(function(r) {
        return Object.assign({}, r, {
          images:          JSON.parse(r.images      || '[]'),
          sizes:           JSON.parse(r.sizes       || '[]'),
          colors:          JSON.parse(r.colors      || '[]'),
          size_labels:     JSON.parse(r.size_labels || '[]'),
          bubble_selector: r.bubble_selector === 1,
          parcel_size:     r.parcel_size || 'large',
          stock:           includeStock ? (stockMap[r.id] || null) : undefined,
          scent_profile:   r.scent_profile ? JSON.parse(r.scent_profile) : null
        });
      });

      const ttl = includeStock ? 20 : 20; // 20s TTL — short enough that product changes propagate quickly
      const response = new Response(JSON.stringify(products), {
        headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttl}` }
      });

      if (canCache) {
        const cache = caches.default;
        const cacheKey = new Request(request.url);
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      return response;
    }

    if (request.method === 'POST' && path === '/set-product') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let b;
      try { b = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare(`
        INSERT INTO products (id, name, category, price, description, badge, image, images, sizes, colors, size_labels, sort_order, bubble_selector, parcel_size, active, hidden, scent_profile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, category=excluded.category, price=excluded.price,
          description=excluded.description, badge=excluded.badge, image=excluded.image,
          images=excluded.images, sizes=excluded.sizes, colors=excluded.colors,
          size_labels=excluded.size_labels, sort_order=excluded.sort_order,
          bubble_selector=excluded.bubble_selector, parcel_size=excluded.parcel_size,
          active=1, hidden=excluded.hidden, scent_profile=excluded.scent_profile
      `).bind(
        b.id, b.name, b.category, b.price,
        b.description || '', b.badge || '', b.image || '',
        JSON.stringify(b.images || []), JSON.stringify(b.sizes || []),
        JSON.stringify(b.colors || []), JSON.stringify(b.size_labels || []),
        b.sort_order || 0, b.bubble_selector ? 1 : 0, b.parcel_size || 'large',
        b.hidden ? 1 : 0,
        b.scent_profile ? JSON.stringify(b.scent_profile) : ''
      ).run();
      const sizes = b.sizes || [];
      const colors = b.colors || [];
      if (sizes.length && colors.length) {
        for (const s of sizes) {
          for (const c of colors) {
            await env.DB.prepare(
              `INSERT INTO stock (product_id, stock_key, color, qty, updated_at)
               VALUES (?, ?, ?, 0, datetime('now'))
               ON CONFLICT (product_id, stock_key, color) DO NOTHING`
            ).bind(b.id, s.size, c).run();
          }
        }
      }
      bustProductsCache(ctx, request.url);
      return json({ ok: true });
    }

    if (request.method === 'POST' && path === '/set-product-hidden') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let b;
      try { b = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (!b.id) return json({ error: 'id required' }, 400);
      await env.DB.prepare('UPDATE products SET hidden = ? WHERE id = ?')
        .bind(b.hidden ? 1 : 0, b.id).run();
      bustProductsCache(ctx, request.url);
      return json({ ok: true });
    }

    if (request.method === 'POST' && path === '/set-sort-orders') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let b;
      try { b = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      for (const item of (b.orders || [])) {
        await env.DB.prepare('UPDATE products SET sort_order = ? WHERE id = ?')
          .bind(item.sort_order, item.id).run();
      }
      // Bust edge cache so reorder reflects immediately
      const cache = caches.default;
      const base = new URL(request.url);
      base.pathname = '/get-products';
      base.search = '';
      ctx.waitUntil(Promise.all([
        cache.delete(new Request(base.toString())),
        cache.delete(new Request(base.toString() + '?stock=1'))
      ]));
      return json({ ok: true });
    }

    if (request.method === 'POST' && path === '/delete-product') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let b;
      try { b = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare('UPDATE products SET active = 0 WHERE id = ?').bind(b.id).run();
      await env.DB.prepare('DELETE FROM stock WHERE product_id = ?').bind(b.id).run();
      return json({ ok: true });
    }

    // ── Review endpoints ─────────────────────────────────────────

    if (request.method === 'GET' && path === '/get-reviews') {
      const productId = url.searchParams.get('product_id');
      if (!productId) return json({ error: 'Missing product_id' }, 400);
      const { results } = await env.DB.prepare(
        'SELECT id, reviewer_name, rating, body, location, size_colour, created_at FROM reviews WHERE product_id = ? AND approved = 1 ORDER BY created_at DESC'
      ).bind(productId).all();
      return json(results);
    }

    if (request.method === 'POST' && path === '/submit-review') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (!body.product_id || !body.reviewer_name || !body.rating || !body.body)
        return json({ error: 'Missing fields' }, 400);
      if (body.rating < 1 || body.rating > 5)
        return json({ error: 'Invalid rating' }, 400);
      const name = String(body.reviewer_name).slice(0, 80);
      const text = String(body.body).slice(0, 1000);
      const location = String(body.location || '').slice(0, 80);
      const sizeColour = String(body.size_colour || '').slice(0, 80);
      const ip = request.headers.get('CF-Connecting-IP') || '';
      const existing = ip
        ? await env.DB.prepare('SELECT id FROM reviews WHERE product_id = ? AND ip_address = ?').bind(body.product_id, ip).first()
        : null;
      const approved = existing ? 0 : 1;
      await env.DB.prepare(
        'INSERT INTO reviews (product_id, reviewer_name, rating, body, approved, ip_address, location, size_colour) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(body.product_id, name, body.rating, text, approved, ip, location, sizeColour).run();
      if (existing) {
        await env.DB.prepare('UPDATE reviews SET approved = 0 WHERE id = ?').bind(existing.id).run();
        await env.DB.prepare('INSERT INTO logs (event_type, description) VALUES (?, ?)')
          .bind('review_flagged', `Review flagged for spam — "${name}" on product #${body.product_id} (duplicate IP)`).run();
      } else {
        const meta = [`${body.rating}/5 stars`, location, sizeColour].filter(Boolean).join(' · ');
        await env.DB.prepare('INSERT INTO logs (event_type, description) VALUES (?, ?)')
          .bind('review_submitted', `New review by "${name}" on product #${body.product_id} — ${meta}`).run();
      }
      return json({ ok: true });
    }

    if (request.method === 'GET' && path === '/get-all-reviews') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      const { results } = await env.DB.prepare(
        'SELECT id, product_id, reviewer_name, rating, body, location, size_colour, created_at, approved FROM reviews ORDER BY created_at DESC'
      ).all();
      return json(results);
    }

    if (request.method === 'POST' && path === '/set-review-status') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare('UPDATE reviews SET approved = ? WHERE id = ?')
        .bind(body.approved, body.id).run();
      return json({ ok: true });
    }

    if (request.method === 'POST' && path === '/delete-review') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_SECRET) return json({ error: 'Unauthorized' }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      await env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(body.id).run();
      return json({ ok: true });
    }

    if (request.method === 'GET' && path === '/export-products') {
      const rows = await env.DB.prepare(
        'SELECT * FROM products WHERE active = 1 AND (hidden IS NULL OR hidden = 0) ORDER BY sort_order, id'
      ).all();
      const products = (rows.results || []).map(function(r) {
        return Object.assign({}, r, {
          images:          JSON.parse(r.images      || '[]'),
          sizes:           JSON.parse(r.sizes       || '[]'),
          colors:          JSON.parse(r.colors      || '[]'),
          size_labels:     JSON.parse(r.size_labels || '[]'),
          bubble_selector: r.bubble_selector === 1,
          parcel_size:     r.parcel_size || 'large',
          scent_profile:   r.scent_profile ? JSON.parse(r.scent_profile) : null
        });
      });
      return new Response('window.productsData = ' + JSON.stringify(products) + ';', {
        headers: { ...CORS, 'Content-Type': 'application/javascript', 'Cache-Control': 'no-cache' }
      });
    }

    return new Response('Not Found', { status: 404, headers: CORS });
  },

  async scheduled(event, env, ctx) {
    // Keeps D1 warm — runs every 5 minutes via cron trigger
    await env.DB.prepare('SELECT 1 FROM products LIMIT 1').first();
  }
};
