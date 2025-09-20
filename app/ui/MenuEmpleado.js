"use client";
import userRoles from '@/app/lib/checkUserRoles';

const MenuEmpleado = () => {
  const roles = userRoles();
  console.log(roles);

  return (
    <aside className="w-64 bg-gray-100 shadow-lg rounded-lg p-4">
      <ul className="flex flex-col gap-4">
        {/* Mostrar "Dashboard administrador" solo si roles incluye el valor 1 */}
        {roles.includes(1) && (
          <li>
            <a
              href="/dashboard/operaciones/admin"
              className="block px-4 py-2 bg-green-500 text-white rounded-md text-center hover:bg-green-600 transition duration-300"
            >
              Dashboard administrador
            </a>
          </li>
        )}
        <li>
          <a
            href="/dashboard/operaciones/empleado"
            className="block px-4 py-2 bg-green-500 text-white rounded-md text-center hover:bg-green-600 transition duration-300"
          >
            Dashboard Empleados
          </a>
        </li>
        <li>
          <a href="/dashboard/operaciones/caja"
            className="block px-4 py-2 bg-green-500 text-white rounded-md text-center hover:bg-green-600 transition duration-300">
            Hoja de caja
          </a>
        </li>
        <li>
          <a
            href="/dashboard/operaciones/empleado/caja"
            className="block px-4 py-2 bg-green-500 text-white rounded-md text-center hover:bg-green-600 transition duration-300"
          >
            Cerrar Caja
          </a>
        </li>
        <li>
          <a href="/dashboard/productos"
            className="block px-4 py-2 bg-green-500 text-white rounded-md text-center hover:bg-green-600 transition duration-300">
            Productos
          </a>
        </li>
        <li>
          <a href="/dashboard/tipo-salida"
            className="block px-4 py-2 bg-green-500 text-white rounded-md text-center hover:bg-green-600 transition duration-300">
            Tipo Gastos
          </a>
        </li>
      </ul>
    </aside>
  );
};

export default MenuEmpleado;
