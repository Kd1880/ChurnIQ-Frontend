import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/churniq'
import { Search, Eye, ChevronUp, ChevronDown } from 'lucide-react'

function RiskBadge({ level }) {
  const cls = level === 'HIGH' ? 'badge-high' : level === 'MEDIUM' ? 'badge-medium' : 'badge-low'
  return <span className={cls}>{level}</span>
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="inp" style={{ width: 'auto', minWidth: 130 }}>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

export default function RiskTable() {
  const [all, setAll]         = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [risk, setRisk]       = useState('ALL')
  const [plan, setPlan]       = useState('ALL')
  const [sort, setSort]       = useState({ key: 'churn_prob', dir: 'desc' })
  const nav = useNavigate()

  useEffect(() => {
    api.getCustomers().then(d => {
      setAll(d?.customers || [])
      setLoading(false)
    })
  }, [])

  const rows = useMemo(() => {
    let list = [...all]
    if (search) list = list.filter(c =>
      c.customer_id.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    )
    if (risk !== 'ALL') list = list.filter(c => c.risk_level === risk)
    if (plan !== 'ALL') list = list.filter(c => c.plan_type  === plan)
    list.sort((a, b) => {
      const va = a[sort.key], vb = b[sort.key]
      return sort.dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return list
  }, [all, search, risk, plan, sort])

  const sortBy = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))

  const SortIcon = ({ k }) => sort.key === k
    ? (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
    : null

  const rowBg = (level) => level === 'HIGH'
    ? 'rgba(229,62,62,0.04)'
    : level === 'MEDIUM' ? 'rgba(214,158,46,0.04)' : 'transparent'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Customer Risk Table</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
          {rows.length} customers — sorted by {sort.key.replace('_', ' ')}
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', padding: 14 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
          <input
            className="inp" placeholder="Search name or ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <Sel value={risk} onChange={setRisk} options={[
          { v: 'ALL', l: 'All Risk Levels' },
          { v: 'HIGH', l: '🔴 High Risk' },
          { v: 'MEDIUM', l: '🟡 Medium Risk' },
          { v: 'LOW', l: '🟢 Low Risk' },
        ]} />
        <Sel value={plan} onChange={setPlan} options={[
          { v: 'ALL', l: 'All Plans' },
          { v: 'Basic', l: 'Basic' },
          { v: 'Standard', l: 'Standard' },
          { v: 'Premium', l: 'Premium' },
        ]} />
        <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>
          Showing {Math.min(rows.length, 100)} of {rows.length}
        </span>
      </div>

      {/* Table */}
      <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div className="spinner" />
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text2)', fontSize: 13 }}>
            No customers match the current filters
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  {[
                    { label: 'Customer ID',  key: 'customer_id' },
                    { label: 'Name',         key: 'name' },
                    { label: 'Churn %',      key: 'churn_prob' },
                    { label: 'Risk',         key: 'risk_level' },
                    { label: 'Plan',         key: 'plan_type' },
                    { label: 'CLV Score',    key: 'clv_score' },
                    { label: 'Top Risk Factor', key: null },
                    { label: 'Action',       key: null },
                  ].map(({ label, key }) => (
                    <th key={label}
                      onClick={() => key && sortBy(key)}
                      style={{ cursor: key ? 'pointer' : 'default', userSelect: 'none' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {label} {key && <SortIcon k={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map(c => (
                  <tr key={c.customer_id} style={{ background: rowBg(c.risk_level) }}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>{c.customer_id}</td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ fontWeight: 700,
                      color: c.churn_prob > 0.7 ? 'var(--red)' : c.churn_prob > 0.4 ? 'var(--yellow)' : 'var(--green)'
                    }}>
                      {c.churn_percent}
                    </td>
                    <td><RiskBadge level={c.risk_level} /></td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{c.plan_type}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(c.clv_score).toLocaleString()}</td>
                    <td style={{ maxWidth: 200, color: 'var(--text2)', fontSize: 11 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {c.top_reason_1?.split('[')[0]?.trim()}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => nav(`/risk/${c.customer_id}`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 7,
                          border: '1px solid var(--border)',
                          background: 'var(--bg2)',
                          color: 'var(--text)', fontSize: 12, fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
