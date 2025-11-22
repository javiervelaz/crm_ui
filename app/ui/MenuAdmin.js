import { DollarSign, FileText, Home, LogOut, Package, Users } from "lucide-react";

const MenuAdmin = () => {
  return (
    <aside className="w-64 bg-white shadow-xl  p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-6">Panel Administrador</h2>
      <ul className="flex flex-col gap-3">
        <li>
          <a
            href="/dashboard/operaciones/admin"
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700  shadow hover:scale-105 hover:bg-gray-200 transition"
          >
            <Home size={18} /> Dashboard administrador
          </a>
        </li>
        <li>
          <a
            href="/dashboard/operaciones/empleado"
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700  hover:bg-gray-200 transition"
          >
            <Users size={18} /> Ingresar como Empleado
          </a>
        </li>
        <li>
          <a
            href="/dashboard/operaciones/caja"
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700  hover:bg-gray-200 transition"
          >
            <FileText size={18} /> Hoja de caja
          </a>
        </li>
        <li>
          <a
            href="/dashboard/operaciones/empleado/caja"
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700  hover:bg-gray-200 transition"
          >
            <LogOut size={18} /> Cerrar Caja
          </a>
        </li>
        <li>
          <a
            href="/dashboard/usuarios"
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700  hover:bg-gray-200 transition"
          >
            <Users size={18} /> Usuarios
          </a>
        </li>
        <li>
          <a
            href="/dashboard/productos"
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700  hover:bg-gray-200 transition"
          >
            <Package size={18} /> Productos
          </a>
        </li>
        <li>
          <a
            href="/dashboard/tipo-salida"
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700  hover:bg-gray-200 transition"
          >
            <DollarSign size={18} /> Tipo Gastos
          </a>
        </li>
      </ul>
    </aside>
  );
};

export default MenuAdmin;
