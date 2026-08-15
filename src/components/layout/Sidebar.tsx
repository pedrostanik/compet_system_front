import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { House, Users, CalendarDays, Package, BarChart2, Menu, X, FileText, ShoppingBag, Receipt, LogOut, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const links = [
    { to: '/home',       icon: <House size={16} />,        label: 'Home' },
    { to: '/customers',  icon: <Users size={16} />,       label: 'Clientes' },
    { to: '/scheduling', icon: <CalendarDays size={16} />, label: 'Calendário' },
    { to: '/protocol',   icon: <FileText size={16} />,     label: 'Serviços' },
    { to: '/pack',       icon: <Package size={16} />,      label: 'Pacotes' },
    { to: '/products',   icon: <ShoppingBag size={16} />,  label: 'Produtos' },
    { to: '/receipts',   icon: <Receipt size={16} />,      label: 'Recibos' },
    { to: '/report',     icon: <BarChart2 size={16} />,    label: 'Relatório' },
    { to: '/history',    icon: <History size={16} />,      label: 'Histórico' },

  ];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 rounded-md p-2 shadow-sm"
        style={{ background: 'var(--brand-orange)', color: '#fff' }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-56 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `} style={{ background: 'var(--bg-sidebar)' }}>

        {/* Logo */}
        <div className="px-5 py-6 mt-8 md:mt-0 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
              style={{ background: 'var(--brand-orange)', color: '#fff' }}>
              🐾
            </div>

            <div>
              <span className="font-black text-white text-lg tracking-tight"
                style={{ fontFamily: 'Nunito, sans-serif' }}>
                Com<span style={{ color: 'var(--brand-yellow)' }}>Pet</span>
              </span>
              <p className="text-white/40 text-xs -mt-0.5">Petshop</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'var(--brand-orange)',
                boxShadow: '0 2px 8px rgba(232,103,37,0.4)',
              } : {}}
            >
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}