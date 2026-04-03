// ── ChurnIQ Pro — API layer ─────────────────────────────────

export const BASE_URL = 'https://churniq-32r3.onrender.com'

async function get(path) {
  try {
    const r = await fetch(`${BASE_URL}${path}`)
    if (!r.ok) throw new Error(`${r.status}`)
    return await r.json()
  } catch (e) {
    console.warn('[API GET]', path, e.message)
    return null
  }
}

async function post(path, body) {
  try {
    const r = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(`${r.status}`)
    return await r.json()
  } catch (e) {
    console.warn('[API POST]', path, e.message)
    return null
  }
}

export const api = {
  getDashboard:  ()     => get('/dashboard/summary'),
  getCustomers:  (params = '') => get(`/customers${params}`),
  getCustomer:   (id)   => get(`/customer/${id}`),
  getSegments:   ()     => get('/segments'),
  getRetention:  (id)   => get(`/retention/${id}`),
  emailStatus:   ()     => get('/email-status'),
  whatIf:        (body) => post('/whatif', body),
  sendEmail:     (body) => post('/send-email', body),
}
