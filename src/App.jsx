import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BarChart3, TrendingUp,
  Sun, Moon, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import Dashboard      from './pages/Dashboard'
import RiskTable      from './pages/RiskTable'
import CustomerDetail from './pages/CustomerDetail'
import SegmentAnalysis from './pages/SegmentAnalysis'
import ChurnPredict   from './pages/ChurnPredict'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/risk',     icon: Users,           label: 'Risk Table'       },
  { to: '/segments', icon: BarChart3,       label: 'Segments'         },
  { to: '/predict',  icon: TrendingUp,      label: 'Churn Predict'    },
]

function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      style={{
        width: collapsed ? 60 : 220,
        background: 'var(--sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '18px 0' : '18px 18px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'white', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <Zap size={15} color="#0f0f0f" />
        </div>
        {!collapsed && (
          <span style={{ color: 'var(--sid-text)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            ChurnIQ Pro
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '9px 12px',
              borderRadius: 8,
              fontWeight: 500, fontSize: 13,
              textDecoration: 'none',
              color: isActive ? 'var(--sid-act-t)' : 'var(--sid-muted)',
              background: isActive ? 'var(--sid-active)' : 'transparent',
              transition: 'all 0.15s',
            })}
            className="nav-item"
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: '0 auto 16px',
          width: 28, height: 28, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent',
          color: 'var(--sid-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}

function Navbar({ dark, setDark }) {
  return (
    <header style={{
      height: 56,
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          ChurnIQ Pro
        </p>
        <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>
          OTT Churn Intelligence Platform
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: 'rgba(56,161,105,0.12)',
          color: 'var(--green)',
          padding: '3px 10px', borderRadius: 20,
        }}>
          ● API Live
        </span>
        <button
          onClick={() => setDark(!dark)}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg2)',
            color: 'var(--text2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}

function Layout({ dark, setDark }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar dark={dark} setDark={setDark} />
        <main style={{
          flex: 1, overflow: 'auto',
          padding: '24px',
          background: 'var(--bg)',
        }}>
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/risk"       element={<RiskTable />} />
            <Route path="/risk/:id"   element={<CustomerDetail />} />
            <Route path="/segments"   element={<SegmentAnalysis />} />
            <Route path="/predict"    element={<ChurnPredict />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <BrowserRouter>
      <Layout dark={dark} setDark={setDark} />
    </BrowserRouter>
  )
}
