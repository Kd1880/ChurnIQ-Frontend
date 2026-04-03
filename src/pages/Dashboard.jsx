import { useEffect, useState } from 'react'
import { api } from '../api/churniq'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Users, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react'

// ── Fallback mock data ───────────────────────────────────────
const MOCK_DASHBOARD = {
  kpis: {
    total_customers: 5000,
    high_risk_count: 237,
    avg_churn_percent: '43.1%',
    revenue_at_risk_formatted: '₹1,91,150',
  },
  churn_reasons_breakdown: {
    low_engagement: 1820,
    payment_issues: 1460,
    new_customers: 890,
    support_issues: 620,
  },
}

const TREND_DATA = [
  { m: 'Jan', v: 38 }, { m: 'Feb', v: 41 }, { m: 'Mar', v: 39 },
  { m: 'Apr', v: 44 }, { m: 'May', v: 42 }, { m: 'Jun', v: 46 },
  { m: 'Jul', v: 43 }, { m: 'Aug', v: 48 }, { m: 'Sep', v: 45 },
  { m: 'Oct', v: 47 }, { m: 'Nov', v: 44 }, { m: 'Dec', v: 43 },
]

const PLAN_DATA = [
  { plan: 'Basic', rate: 43.9 },
  { plan: 'Standard', rate: 43.6 },
  { plan: 'Premium', rate: 40.2 },
]

const PIE_COLORS = ['#0f0f0f', '#6b6b6b', '#c0c0c0', '#e2e2dc']
const PIE_COLORS_DARK = ['#f0f0f0', '#909090', '#505050', '#303030']

const CLV_CARDS = [
  { label: 'Avg CLV',      value: '₹6,322', sub: 'per customer' },
  { label: 'Median CLV',   value: '₹3,844', sub: '50th percentile' },
  { label: '75th Pct CLV', value: '₹8,132', sub: 'top quartile' },
]

const tipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--text)',
}

function KPICard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</p>}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="card fade-in">
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const dark = document.documentElement.classList.contains('dark')

  useEffect(() => {
    api.getDashboard().then(d => {
      setData(d || MOCK_DASHBOARD)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  )

  const d = data || MOCK_DASHBOARD
  const reasons = [
    { name: 'Low Engagement', value: d.churn_reasons_breakdown?.low_engagement  || 1820 },
    { name: 'Payment Issues', value: d.churn_reasons_breakdown?.payment_issues  || 1460 },
    { name: 'New Customers',  value: d.churn_reasons_breakdown?.new_customers   || 890  },
    { name: 'Support Issues', value: d.churn_reasons_breakdown?.support_issues  || 620  },
  ]
  const pieColors = dark ? PIE_COLORS_DARK : PIE_COLORS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Real-time OTT churn intelligence overview</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <KPICard icon={Users}         label="Total Customers"       value={d.kpis?.total_customers?.toLocaleString() || '5,000'} color="var(--text)"   />
        <KPICard icon={AlertTriangle} label="High Risk Count"       value={d.kpis?.high_risk_count || 237}                       color="var(--red)"    sub="≥70% churn probability" />
        <KPICard icon={DollarSign}    label="Revenue at Risk / mo"  value={d.kpis?.revenue_at_risk_formatted || '₹1,91,150'}     color="var(--yellow)" />
        <KPICard icon={TrendingDown}  label="Avg Churn Probability" value={d.kpis?.avg_churn_percent || '43.1%'}                 color="var(--blue)"   />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}>

        {/* Churn trend */}
        <ChartCard title="Churn Rate Trend — 12 Months">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Churn Rate']} contentStyle={tipStyle} />
              <Line type="monotone" dataKey="v" stroke="var(--text)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut chart */}
        <ChartCard title="Churn Reasons Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={reasons} cx="45%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {reasons.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={tipStyle} />
              <Legend
                layout="vertical" align="right" verticalAlign="middle"
                iconType="circle" iconSize={7}
                formatter={v => <span style={{ fontSize: 11, color: 'var(--text2)' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Plan bar chart */}
        <ChartCard title="Churn Rate by Plan Type">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PLAN_DATA} barSize={40} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="plan" tick={{ fontSize: 12, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Churn Rate']} contentStyle={tipStyle} />
              <Bar dataKey="rate" fill="var(--text)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* CLV cards */}
        <ChartCard title="Customer Lifetime Value">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, height: 160, alignContent: 'center' }}>
            {CLV_CARDS.map(({ label, value, sub }) => (
              <div key={label} style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                background: 'var(--bg2)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '12px 8px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</p>
                <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{sub}</p>
              </div>
            ))}
          </div>
        </ChartCard>

      </div>

      {/* Priority customers */}
      {d.priority_customers?.length > 0 && (
        <div className="card fade-in">
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
            Top Priority — High CLV + High Risk
          </p>
          <table className="tbl">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Churn Risk</th>
                <th>Plan</th>
                <th>CLV Score</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {d.priority_customers.map(c => (
                <tr key={c.customer_id}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.customer_id}</td>
                  <td style={{ fontWeight: 700, color: 'var(--red)' }}>{c.churn_pct}</td>
                  <td>{c.plan_type}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(c.clv_score).toLocaleString()}</td>
                  <td><span className="badge-high">HIGH</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
