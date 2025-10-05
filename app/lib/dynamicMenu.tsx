'use client'

import { useAuthCheck } from '@/app/lib/useAuthCheck';
import MenuAdmin from '@/app/ui/MenuAdmin';
import MenuEmpleado from '@/app/ui/MenuEmpleado'; // Necesitarás crear este componente

export default function DynamicMenu() {
  const { userRole, loading } = useAuthCheck();

  if (loading) {
    return (
      <div className="w-64 bg-gray-800 min-h-screen" >
        <div className="p-4 animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  console.log("user role", userRole);
  switch (userRole) {
    case 1: // Admin
      return <MenuAdmin />;
    case 2: // Empleado
      return <MenuEmpleado />;
    default:
      return null;
  }
}