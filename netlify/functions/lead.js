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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.warn('BREVO_API_KEY not set; lead not synced. Netlify Forms backup still captured it.');
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, contact: false, reason: 'api_key_missing' }) };
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
  } catch (err) {
    console.error('Brevo contact sync failed:', err.message);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, contact: false }) };
  }

  const templateId = parseInt(process.env.BREVO_TEMPLATE_ID || '', 10);
  if (templateId) {
    const base = process.env.URL || 'https://yes.gabochie.com';
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
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
            PREVIEW_URL: base + '/preview.html',
            BUY_URL: process.env.SELAR_LINK || (base + '/')
          }
        })
      });
    } catch (err) {
      console.error('Brevo welcome email failed:', err.message);
    }
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, contact: true }) };
};
