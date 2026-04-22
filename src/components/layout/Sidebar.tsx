import { NavLink } from 'react-router-dom';
import { Users, CalendarDays } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r flex flex-col p-4 gap-2">
      <h1 className="text-lg font-semibold mb-4">🐾 Petshop</h1>
      <NavLink
        to="/customers"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            isActive ? 'bg-gray-100 font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`
        }
      >
        <Users size={16} /> Clientes
      </NavLink>
      <NavLink
        to="/scheduling"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            isActive ? 'bg-gray-100 font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`
        }
      >
        <CalendarDays size={16} /> Calendário
      </NavLink>
    </aside>
  );
}