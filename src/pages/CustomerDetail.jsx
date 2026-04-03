import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/churniq'
import { ArrowLeft, Mail, Copy, Send, AlertTriangle, CheckCircle, Sliders } from 'lucide-react'

function RiskBadge({ level }) {
  const cls = level === 'HIGH' ? 'badge-high' : level === 'MEDIUM' ? 'badge-medium' : 'badge-low'
  return <span className={cls}>{level}</span>
}

function Gauge({ pct }) {
  const r = 52, cx = 64, cy = 64
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 70 ? 'var(--red)' : pct >= 40 ? 'var(--yellow)' : 'var(--green)'
  return (
    <svg width={128} height={128} viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font)', fill: color }}>
        {pct}%
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle"
        style={{ fontSize: 9, fontFamily: 'var(--font)', fill: 'var(--text2)' }}>
        CHURN RISK
      </text>
    </svg>
  )
}

function Slider({ label, value, min, max, step = 1, onChange, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>{label}</label>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
          {value}{hint}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--text)' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)' }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const nav    = useNavigate()

  const [customer, setCustomer]   = useState(null)
  const [loading, setLoading]     = useState(true)

  // What-if state
  const [sliders, setSliders]     = useState({})
  const [wiResult, setWiResult]   = useState(null)
  const [wiLoading, setWiLoading] = useState(false)

  // Email state
  const [emailData, setEmailData]   = useState(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [sendLoading, setSendLoading]   = useState(false)
  const [sendResult, setSendResult]     = useState(null)
  const [copied, setCopied]             = useState(false)

  useEffect(() => {
    api.getCustomer(id).then(d => {
      setCustomer(d)
      if (d) setSliders({
        watch_hours_per_week: d.watch_hours_per_week,
        tenure_months:        d.tenure_months,
        payment_failures_3m:  d.payment_failures_3m,
        support_tickets:      d.support_tickets,
        logins_last_30_days:  d.logins_last_30_days,
      })
      setLoading(false)
    })
  }, [id])

  const runWhatIf = async () => {
    setWiLoading(true)
    setWiResult(null)
    const res = await api.whatIf({ customer_id: id, ...sliders })
    setWiResult(res)
    setWiLoading(false)
  }

  const generateEmail = async () => {
    setEmailLoading(true)
    setEmailData(null)
    setSendResult(null)
    const res = await api.getRetention(id)
    setEmailData(res)
    setEmailLoading(false)
  }

  const handleSend = async () => {
    if (!emailData) return
    setSendLoading(true)
    const res = await api.sendEmail({
      customer_id: id,
      subject: emailData.subject,
      body: emailData.email,
    })
    setSendResult(res)
    setSendLoading(false)
  }

  const handleCopy = () => {
    if (!emailData) return
    navigator.clipboard.writeText(`Subject: ${emailData.subject}\n\n${emailData.email}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  )

  if (!customer) return (
    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text2)' }}>
      <p>Customer not found: {id}</p>
      <button onClick={() => nav('/risk')} style={{ marginTop: 16, color: 'var(--text)', fontSize: 13, cursor: 'pointer', background: 'none', border: 'none' }}>
        ← Back to Risk Table
      </button>
    </div>
  )

  const pct    = Math.round(customer.churn_prob * 100)
  const wiPct  = wiResult ? Math.round(wiResult.new_churn_prob * 100) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Back */}
      <button onClick={() => nav('/risk')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content' }}>
        <ArrowLeft size={14} /> Back to Risk Table
      </button>

      {/* Profile + Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
        <div className="card fade-in">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{customer.name}</h2>
                <RiskBadge level={customer.risk_level} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{customer.customer_id}</p>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'Plan',    value: customer.plan_type },
                { label: 'Charge',  value: `₹${customer.monthly_charge}/mo` },
                { label: 'Tenure',  value: `${customer.tenure_months} months` },
                { label: 'Device',  value: customer.device_type },
                { label: 'CLV',     value: `₹${Number(customer.clv_score).toLocaleString()}` },
                { label: 'Segment', value: customer.clv_segment },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gauge pct={pct} />
        </div>
      </div>

      {/* SHAP Reasons */}
      <div className="card fade-in">
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Top Churn Reasons — SHAP Analysis</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[customer.top_reason_1, customer.top_reason_2, customer.top_reason_3].filter(Boolean).map((r, i) => {
            const shap = r.match(/SHAP: ([+-][\d.]+)/)?.[1]
            const text = r.split('[')[0].trim()
            const pctBar = Math.min(100, (Math.abs(parseFloat(shap) || 0) / 3) * 100)
            const colors = ['var(--red)', 'var(--yellow)', 'var(--blue)']
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: colors[i] + '20', color: colors[i],
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>{text}</p>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pctBar}%`, background: colors[i], borderRadius: 2, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                {shap && <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: colors[i], flexShrink: 0 }}>+{shap}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* What-If + Email side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* What-If Simulator */}
        <div className="card fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sliders size={15} style={{ color: 'var(--text2)' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>What-If Simulator</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Slider label="Watch Hours / Week" value={sliders.watch_hours_per_week ?? 5} min={0.5} max={40} step={0.5} hint=" hrs"
              onChange={v => setSliders(s => ({ ...s, watch_hours_per_week: v }))} />
            <Slider label="Logins Last 30 Days" value={sliders.logins_last_30_days ?? 10} min={0} max={30} hint=""
              onChange={v => setSliders(s => ({ ...s, logins_last_30_days: v }))} />
            <Slider label="Payment Failures" value={sliders.payment_failures_3m ?? 0} min={0} max={4} hint=""
              onChange={v => setSliders(s => ({ ...s, payment_failures_3m: v }))} />
            <Slider label="Support Tickets" value={sliders.support_tickets ?? 0} min={0} max={5} hint=""
              onChange={v => setSliders(s => ({ ...s, support_tickets: v }))} />
            <Slider label="Tenure (months)" value={sliders.tenure_months ?? 12} min={1} max={72} hint=" mo"
              onChange={v => setSliders(s => ({ ...s, tenure_months: v }))} />
          </div>
          <button onClick={runWhatIf} disabled={wiLoading}
            style={{
              marginTop: 16, width: '100%', padding: '10px',
              borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: 'var(--bg)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: wiLoading ? 0.7 : 1,
            }}>
            {wiLoading ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: 'var(--bg)' }} /> : 'Recalculate Churn'}
          </button>
          {wiResult && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>{pct}%</p>
                </div>
                <span style={{ fontSize: 18, color: 'var(--text3)' }}>→</span>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>After</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: wiResult.improved ? 'var(--green)' : 'var(--red)' }}>{wiPct}%</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: wiResult.improved ? 'var(--green)' : 'var(--red)' }}>
                    {wiResult.change_percent}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Retention Email */}
        <div className="card fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Mail size={15} style={{ color: 'var(--text2)' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Retention Email</p>
          </div>

          {!emailData && !emailLoading && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text2)' }}>
              <Mail size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Gemini AI will generate a personalized retention email based on SHAP churn reasons</p>
            </div>
          )}

          {emailLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
              <div className="spinner" />
            </div>
          )}

          {emailData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Subject</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{emailData.subject}</p>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', maxHeight: 160, overflowY: 'auto' }}>
                <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Email Body</p>
                <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{emailData.email}</p>
              </div>
              {emailData.suggested_offer && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(56,161,105,0.08)', border: '1px solid rgba(56,161,105,0.2)' }}>
                  <p style={{ fontSize: 11, color: 'var(--green)' }}>💡 {emailData.suggested_offer}</p>
                </div>
              )}
              {emailData.actions?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Recommended Actions:</p>
                  {emailData.actions.map((a, i) => (
                    <p key={i} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 3 }}>→ {a}</p>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={handleCopy}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 7,
                    border: '1px solid var(--border)',
                    background: 'var(--bg2)', color: 'var(--text)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                  <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleSend} disabled={sendLoading}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 7,
                    border: 'none',
                    background: 'var(--accent)', color: 'var(--bg)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    opacity: sendLoading ? 0.7 : 1,
                  }}>
                  {sendLoading
                    ? <div className="spinner" style={{ width: 12, height: 12, borderTopColor: 'var(--bg)' }} />
                    : <><Send size={12} /> Send Email</>
                  }
                </button>
              </div>
              {sendResult?.success && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} style={{ color: 'var(--green)' }} />
                  <p style={{ fontSize: 12, color: 'var(--green)' }}>Email sent to {sendResult.sent_to}!</p>
                </div>
              )}
            </div>
          )}

          <button onClick={generateEmail} disabled={emailLoading}
            style={{
              marginTop: emailData ? 0 : 16,
              width: '100%', padding: '10px',
              borderRadius: 8, border: emailData ? '1px solid var(--border)' : 'none',
              background: emailData ? 'var(--bg2)' : 'var(--accent)',
              color: emailData ? 'var(--text)' : 'var(--bg)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: emailLoading ? 0.7 : 1,
            }}>
            <Mail size={14} />
            {emailData ? 'Regenerate Email' : 'Generate AI Email'}
          </button>
        </div>
      </div>
    </div>
  )
}
