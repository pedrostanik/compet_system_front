import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, CalendarDays, Package, BarChart2, Menu, X, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Sidebar() {
  const [open, setOpen] = useState(false);

const { logout } = useAuth();

  const links = [
    { to: '/customers', icon: <Users size={16} />, label: 'Clientes' },
    { to: '/scheduling', icon: <CalendarDays size={16} />, label: 'Calendário' },
    { to: '/pack', icon: <Package size={16} />, label: 'Pacotes' },
    { to: '/report', icon: <BarChart2 size={16} />, label: 'Relatório' },
    { to: '/protocol', icon: <FileText size={16} />, label: 'Procedimentos' },
  ];

  return (
    <>
      {/* Botão hamburguer — só aparece em mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white border rounded-md p-2 shadow-sm"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay escuro ao abrir o menu em mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-56 bg-white border-r flex flex-col p-4 gap-2
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <h1 className="text-lg font-semibold mb-4 mt-10 md:mt-0">🐾 Petshop</h1>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-gray-100 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            {icon} {label}
          </NavLink>
        ))}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 mt-auto"
          >
            <LogOut size={16} /> Sair
          </button>
      </aside>

    </>
  );
}