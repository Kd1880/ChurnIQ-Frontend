import { useEffect, useState } from 'react'
import { api } from '../api/churniq'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const MOCK = {
  by_plan:   [{ plan_type:'Basic', churn_rate_pct:43.9 }, { plan_type:'Standard', churn_rate_pct:43.6 }, { plan_type:'Premium', churn_rate_pct:40.2 }],
  by_device: [{ device_type:'Mobile', churn_rate_pct:48.0 }, { device_type:'Smart TV', churn_rate_pct:46.6 }, { device_type:'Tablet', churn_rate_pct:44.8 }, { device_type:'Laptop', churn_rate_pct:40.9 }],
  by_tenure: [{ tenure_bucket:'0-3m', churn_rate_pct:72 }, { tenure_bucket:'3-6m', churn_rate_pct:58 }, { tenure_bucket:'6-12m', churn_rate_pct:45 }, { tenure_bucket:'1-2yr', churn_rate_pct:48 }, { tenure_bucket:'2yr+', churn_rate_pct:33 }],
  by_genre:  [{ preferred_genre:'Romance', churn_rate_pct:46 }, { preferred_genre:'Drama', churn_rate_pct:45 }, { preferred_genre:'Action', churn_rate_pct:43 }, { preferred_genre:'Comedy', churn_rate_pct:42 }, { preferred_genre:'Thriller', churn_rate_pct:41 }, { preferred_genre:'Kids', churn_rate_pct:40 }, { preferred_genre:'Documentary', churn_rate_pct:39 }],
}

const REVENUE = [
  { segment: 'Basic',    risk: 285000 },
  { segment: 'Standard', risk: 456000 },
  { segment: 'Premium',  risk: 178000 },
]

const INSIGHTS = [
  'Mobile users show 15% higher churn than Smart TV users.',
  'New users (0–3 months) have the highest churn rate at 72%.',
  'Users with payment issues churn 2× more than those without.',
  'Romance and Drama genre viewers show highest churn rates.',
  'Premium plan users churn 3.7% less than Basic plan users.',
]

const tip = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }

function ChartCard({ title, children }) {
  return (
    <div className="card fade-in">
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  )
}

export default function SegmentAnalysis() {
  const [seg, setSeg]         = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSegments().then(d => {
      setSeg(d || MOCK)
      setLoading(false)
    })
  }, [])

  const s = seg || MOCK

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Segment Analysis</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Churn breakdown by key customer segments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14 }}>

        {/* By Plan */}
        <ChartCard title="Churn Rate by Plan Type">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={s.by_plan} barSize={44} margin={{ left: -20 }}>
              <XAxis dataKey="plan_type" tick={{ fontSize: 12, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Churn Rate']} contentStyle={tip} />
              <Bar dataKey="churn_rate_pct" fill="var(--text)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* By Device */}
        <ChartCard title="Churn Rate by Device Type">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={s.by_device} barSize={36} margin={{ left: -20 }}>
              <XAxis dataKey="device_type" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Churn Rate']} contentStyle={tip} />
              <Bar dataKey="churn_rate_pct" fill="var(--text2)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* By Tenure */}
        <ChartCard title="Churn Rate by Tenure Bucket">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={s.by_tenure} margin={{ left: -20 }}>
              <XAxis dataKey="tenure_bucket" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Churn Rate']} contentStyle={tip} />
              <Line type="monotone" dataKey="churn_rate_pct" stroke="var(--text)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--text)' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Genre table */}
        <ChartCard title="Churn Rate by Preferred Genre">
          <table className="tbl">
            <thead>
              <tr>
                <th>Genre</th>
                <th>Churn Rate</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {s.by_genre?.map(g => (
                <tr key={g.preferred_genre}>
                  <td style={{ fontWeight: 500 }}>{g.preferred_genre}</td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: g.churn_rate_pct >= 44 ? 'var(--red)' : 'var(--green)' }}>
                    {g.churn_rate_pct}%
                  </td>
                  <td>
                    <span className={g.churn_rate_pct >= 44 ? 'badge-high' : 'badge-low'}>
                      {g.churn_rate_pct >= 44 ? 'High' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>

        {/* Revenue at Risk */}
        <ChartCard title="Revenue at Risk by Segment">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={REVENUE} barSize={44} margin={{ left: -20 }}>
              <XAxis dataKey="segment" tick={{ fontSize: 12, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => [`₹${(v/1000).toFixed(0)}K`, 'Revenue at Risk']} contentStyle={tip} />
              <Bar dataKey="risk" fill="var(--yellow)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            {REVENUE.map(r => (
              <div key={r.segment} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3 }}>{r.segment}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>₹{(r.risk/1000).toFixed(0)}K</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Strategic Insights */}
        <div className="card fade-in" style={{ borderLeft: '3px solid var(--text)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Strategic Insights</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {INSIGHTS.map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  color: 'var(--text2)', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>{i + 1}</span>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{ins}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
