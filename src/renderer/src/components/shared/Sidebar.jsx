import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',             label: 'Dashboard',      icon: '📊' },
  { to: '/beneficiaries',label: 'Beneficiaries',  icon: '👥' },
  { to: '/production',   label: 'Production Log', icon: '🏭' },
  { to: '/stall-sales',  label: 'Stall Sales',    icon: '🛒' },
]

export default function Sidebar() {
  return (
    <div style={{
      width: 200,
      background: 'white',
      borderRight: '1px solid #D6E0D7',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 12
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#8A9E8D',
        padding: '8px 16px',
        letterSpacing: '0.6px'
      }}>
        NAVIGATION
      </div>

      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#2D6A35' : '#4A5E4D',
            background: isActive ? '#EAF3EB' : 'none',
            borderLeft: isActive ? '3px solid #2D6A35' : '3px solid transparent',
            transition: 'all 0.15s',
          })}
        >
          <span style={{ fontSize: 16 }}>{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      <div style={{
        marginTop: 'auto',
        padding: 16,
        borderTop: '1px solid #D6E0D7',
        fontSize: 11,
        color: '#8A9E8D'
      }}>
        🔒 All data stored locally
      </div>
    </div>
  )
}