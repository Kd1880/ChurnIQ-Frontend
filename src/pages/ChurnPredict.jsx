import { useState } from 'react'
import { api } from '../api/churniq'
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const DEFAULTS = {
  plan_type:             'Basic',
  monthly_charge:        199,
  watch_hours_per_week:  5,
  tenure_months:         12,
  logins_last_30_days:   10,
  payment_failures_3m:   0,
  support_tickets:       0,
  device_type:           'Mobile',
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {hint && <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function ChurnPredict() {
  const [form, setForm]       = useState(DEFAULTS)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const predict = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    const res = await api.whatIf({
      customer_id:           'CUST00001',
      watch_hours_per_week:  parseFloat(form.watch_hours_per_week),
      tenure_months:         parseInt(form.tenure_months),
      payment_failures_3m:   parseInt(form.payment_failures_3m),
      support_tickets:       parseInt(form.support_tickets),
      logins_last_30_days:   parseInt(form.logins_last_30_days),
      monthly_charge:        parseInt(form.monthly_charge),
    })

    if (res) {
      setResult({ probability: res.new_churn_prob, risk: res.new_risk })
    } else {
      // Rule-based fallback
      const score =
        (parseInt(form.payment_failures_3m) * 0.25) +
        (parseInt(form.support_tickets) * 0.15) +
        (parseFloat(form.watch_hours_per_week) < 3 ? 0.3 : 0) +
        (parseInt(form.tenure_months) < 6 ? 0.25 : 0) +
        (parseInt(form.logins_last_30_days) < 5 ? 0.2 : 0)
      const prob = Math.min(0.95, Math.max(0.05, score))
      setResult({ probability: prob, risk: prob > 0.7 ? 'HIGH' : prob > 0.4 ? 'MEDIUM' : 'LOW' })
      setError('Backend unavailable — showing estimated prediction')
    }
    setLoading(false)
  }

  const pct = result ? Math.round(result.probability * 100) : 0
  const riskColor = result?.risk === 'HIGH' ? 'var(--red)' : result?.risk === 'MEDIUM' ? 'var(--yellow)' : 'var(--green)'

  const SUGGESTIONS = {
    HIGH:   ['Offer 1-month free subscription immediately', 'Resolve payment method issues', 'Send personalized content digest', 'Assign dedicated support agent'],
    MEDIUM: ['Send weekly curated content recommendations', 'Offer loyalty discount (10-15%)', 'Trigger re-engagement notification'],
    LOW:    ['Continue standard engagement', 'Monitor monthly for changes', 'Customer is healthy — no action needed'],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Churn Predict</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
          Enter customer attributes to predict churn probability using XGBoost model
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>

        {/* Form */}
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Customer Attributes</p>

          <Field label="Plan Type">
            <select value={form.plan_type}
              onChange={e => { set('plan_type', e.target.value); set('monthly_charge', e.target.value === 'Basic' ? 199 : e.target.value === 'Standard' ? 499 : 799) }}
              className="inp">
              <option>Basic</option>
              <option>Standard</option>
              <option>Premium</option>
            </select>
          </Field>

          <Field label="Monthly Charge" hint={`₹${form.monthly_charge}`}>
            <input type="number" value={form.monthly_charge} className="inp"
              onChange={e => set('monthly_charge', parseInt(e.target.value))} min={199} max={799} />
          </Field>

          <Field label="Watch Hours / Week" hint="0.5 – 40 hrs">
            <input type="number" value={form.watch_hours_per_week} className="inp"
              onChange={e => set('watch_hours_per_week', e.target.value)} min={0.5} max={40} step={0.5} />
          </Field>

          <Field label="Tenure" hint="1 – 72 months">
            <input type="number" value={form.tenure_months} className="inp"
              onChange={e => set('tenure_months', e.target.value)} min={1} max={72} />
          </Field>

          <Field label="Logins Last 30 Days">
            <input type="number" value={form.logins_last_30_days} className="inp"
              onChange={e => set('logins_last_30_days', e.target.value)} min={0} max={60} />
          </Field>

          <Field label="Payment Failures" hint="last 3 months (0 – 4)">
            <input type="number" value={form.payment_failures_3m} className="inp"
              onChange={e => set('payment_failures_3m', e.target.value)} min={0} max={4} />
          </Field>

          <Field label="Support Tickets" hint="0 – 5">
            <input type="number" value={form.support_tickets} className="inp"
              onChange={e => set('support_tickets', e.target.value)} min={0} max={5} />
          </Field>

          <Field label="Device Type">
            <select value={form.device_type} onChange={e => set('device_type', e.target.value)} className="inp">
              <option>Mobile</option>
              <option>Laptop</option>
              <option>Smart TV</option>
              <option>Tablet</option>
            </select>
          </Field>

          <button onClick={predict} disabled={loading}
            style={{
              padding: '11px', borderRadius: 9, border: 'none',
              background: 'var(--accent)', color: 'var(--bg)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.7 : 1, marginTop: 4,
              letterSpacing: '-0.01em',
            }}>
            {loading
              ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: 'var(--bg)' }} />
              : <><TrendingUp size={15} /> Predict Churn</>
            }
          </button>
        </div>

        {/* Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!result && !loading && (
            <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
              <TrendingUp size={36} style={{ color: 'var(--border)', marginBottom: 14 }} />
              <p style={{ fontWeight: 600, color: 'var(--text2)', fontSize: 14 }}>Fill the form to predict</p>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
                The XGBoost model will calculate churn probability based on customer behavior signals
              </p>
            </div>
          )}

          {result && (
            <>
              {/* Risk card */}
              <div className="card fade-in" style={{ borderLeft: `3px solid ${riskColor}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {result.risk === 'LOW'
                    ? <CheckCircle size={28} style={{ color: riskColor }} />
                    : <AlertTriangle size={28} style={{ color: riskColor }} />
                  }
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 800, color: riskColor, letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {result.risk} RISK
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>
                      Churn probability: {pct}%
                    </p>
                  </div>
                </div>

                {/* Probability bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>
                    <span>Low risk (0%)</span>
                    <span style={{ fontWeight: 700, color: riskColor, fontSize: 12 }}>{pct}%</span>
                    <span>High risk (100%)</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--bg2)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: riskColor, borderRadius: 4,
                      transition: 'width 0.8s cubic-bezier(.4,0,.2,1)'
                    }} />
                  </div>
                  {/* Threshold markers */}
                  <div style={{ position: 'relative', height: 16, marginTop: 2 }}>
                    <div style={{ position: 'absolute', left: '40%', fontSize: 9, color: 'var(--text3)' }}>40%</div>
                    <div style={{ position: 'absolute', left: '70%', fontSize: 9, color: 'var(--text3)' }}>70%</div>
                  </div>
                </div>
              </div>

              {/* Feature impact breakdown */}
              <div className="card fade-in">
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Feature Impact Estimate</p>
                {[
                  { label: 'Payment failures',  value: parseInt(form.payment_failures_3m) * 25, max: 100 },
                  { label: 'Watch hours',        value: Math.max(0, 100 - parseFloat(form.watch_hours_per_week) * 5), max: 100 },
                  { label: 'Short tenure',       value: parseInt(form.tenure_months) < 6 ? 60 : parseInt(form.tenure_months) < 12 ? 30 : 10, max: 100 },
                  { label: 'Support tickets',    value: parseInt(form.support_tickets) * 15, max: 100 },
                  { label: 'Login frequency',    value: Math.max(0, 60 - parseInt(form.logins_last_30_days) * 4), max: 100 },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text2)', width: 120, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg2)' }}>
                      <div style={{
                        height: '100%', width: `${Math.min(value, 100)}%`,
                        background: value > 60 ? 'var(--red)' : value > 30 ? 'var(--yellow)' : 'var(--green)',
                        borderRadius: 3, transition: 'width 0.6s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', width: 30, textAlign: 'right' }}>
                      {Math.min(value, 100)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Retention suggestions */}
              <div className="card fade-in" style={{ background: riskColor + '08', borderColor: riskColor + '30' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
                  Retention Suggestions
                </p>
                {(SUGGESTIONS[result.risk] || []).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 11, color: riskColor }}>→</span>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{s}</p>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(214,158,46,0.1)', border: '1px solid rgba(214,158,46,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Info size={14} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
                  <p style={{ fontSize: 11, color: 'var(--yellow)' }}>{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
