const Store = (() => {
  try {
    const mod = require('@netlify/blobs');
    return { get: mod.getStore, ready: true };
  } catch (e) {
    return { get: null, ready: false };
  }
})();

async function persistLead(record) {
  if (!Store.ready) return false;
  try {
    const leads = Store.get({ name: 'leads', consistency: 'strong' });
    const key = new Date().toISOString().replace(/[:.]/g, '-') + '-' + record.email.replace(/[^a-z0-9@._-]/gi, '_');
    await leads.setJSON(key, record);
    return true;
  } catch (e) {
    console.error('Blobs persist failed:', err(e));
    return false;
  }
  function err(e) { return e && e.message ? e.message : String(e); }
}

exports.handler = async (event) => {
  const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const email = (data.email || '').trim();
  const name = (data.name || '').trim();
  const whatsapp = (data.whatsapp || '').trim();
  const source = (data.source || 'website').trim();
  const path = (data.path || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const record = {
    name: name || '(none)',
    email,
    whatsapp: whatsapp || '(none)',
    source,
    path,
    ts: new Date().toISOString()
  };

  const stored = await persistLead(record);
  console.log('LEAD', stored ? '(blobs)' : '(log-only)', JSON.stringify(record));

  const result = { ok: true, stored, contact: false, emailed: false };

  const key = process.env.BREVO_API_KEY;
  if (!key) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ...result, reason: 'email_provider_not_configured' }) };
  }

  const attributes = { FIRSTNAME: name, SOURCE: source };
  if (whatsapp) attributes.WHATSAPP = whatsapp;

  const contactPayload = {
    email,
    attributes,
    updateEnabled: true
  };
  const listId = parseInt(process.env.BREVO_LIST_ID || '', 10);
  if (listId) contactPayload.listIds = [listId];

  let contactOk = false;
  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': key,
        'content-type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(contactPayload)
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error('Brevo contact API ' + res.status + ': ' + detail);
    }
    contactOk = true;
  } catch (err) {
    console.error('Brevo contact sync failed:', err.message);
  }

  let emailed = false;
  const templateId = parseInt(process.env.BREVO_TEMPLATE_ID || '', 10);
  if (templateId) {
    const base = process.env.URL || 'https://yes.gabochie.com';
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': key,
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          to: [{ email }],
          params: {
            FIRSTNAME: name,
            PREVIEW_URL: base + '/preview',
            BUY_URL: process.env.SELAR_LINK || (base + '/')
          }
        })
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error('Brevo SMTP ' + res.status + ': ' + detail);
      }
      emailed = true;
    } catch (err) {
      console.error('Brevo welcome email failed:', err.message);
    }
  }

  result.contact = contactOk;
  result.emailed = emailed;
  return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
};
