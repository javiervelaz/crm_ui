'use client'

import { getClienteId } from "@/app/lib/authService";
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { deleteUser, getUserList, getUserTypes } from '@/app/lib/usuario.api';
import { MENSAJE_ACADEMIA, tiposDeStaff } from '@/app/lib/rolesStaff';
import { sessionModules, type SessionToken } from '@/app/lib/modules';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { CreateUsuarioButton } from './CreateUsuarioButton';
import SearchUsuario from './SearchUsuario';
import UsuarioTable from './UsuarioTable';
import UsuarioTabs from './UsuarioTabs'; // Nuevo componente

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: number;
  user_type_id: number;
  user_type_codigo?: string;
  user_type_descripcion?: string;
  cliente_id: BigInt;
}

interface UserType {
  id: number;
  descripcion: string;
  codigo: string;
}

export default function UsuariosPage() {
  useAuthCheck();
  const [usuarios, setUsers] = useState<Usuario[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<bigint | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [conAcademia, setConAcademia] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
  
    // Academia (módulo alumnos): avisar dónde se gestionan profesores, tutores y alumnos.
    try {
      setConAcademia(sessionModules(jwtDecode<SessionToken>(token)).includes('alumnos'));
    } catch {
      setConAcademia(false);
    }

    const fetchData = async () => {
     
      try {
        const [usersData, typesData] = await Promise.all([
          getUserList(getClienteId()),
          getUserTypes()
        ]);
        
        // Enriquecer usuarios con información del tipo
      const enrichedUsers = usersData.map((user: any) => {
        const userType = typesData.find((type: any) => type.id === user.user_type_id);
        return {
          ...user,
          user_type_codigo: userType?.codigo,
          user_type_descripcion: userType?.descripcion
        };
      });
   
        setUsers(enrichedUsers);
        setUserTypes(tiposDeStaff(typesData));
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/profile/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este Usuario?')) {
      try {
        await deleteUser(id,getClienteId());
        // Recargar la lista de usuarios
        const [usersData, typesData] = await Promise.all([
          getUserList(getClienteId()),
          getUserTypes()
        ]);
        
        // Enriquecer usuarios con información del tipo
        const enrichedUsers = usersData.map((user: any) => {
          const userType = typesData.find((type: any) => type.id === user.user_type_id);
          return {
            ...user,
            user_type_codigo: userType?.codigo,
            user_type_descripcion: userType?.descripcion
          };
        });
      
        setUsers(enrichedUsers);
        setUserTypes(tiposDeStaff(typesData));
      
        notifySuccess('Usuario eliminado correctamente');
      } catch (error) {
        notifyError('Error al eliminar el usuario');
      }
    }
  };

  // Filtrar usuarios basado en búsqueda y tab activo
  const filteredUsuarios = usuarios.filter(user => {
    const matchesSearch = user.apellido.toLowerCase().includes(query.toLowerCase()) ||
                         user.nombre.toLowerCase().includes(query.toLowerCase()) ||
                         user.email.toLowerCase().includes(query.toLowerCase());
                           // Obtener el código del tipo de usuario basado en el user_type_id
  const userTypeCode = userTypes.find(type => type.id === user.user_type_id)?.codigo;
    
    const matchesTab = activeTab === 'all' || userTypeCode === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Ordenar alfabéticamente
  const sortedUsuarios = [...filteredUsuarios].sort((a, b) => {
    if (a.apellido.toLowerCase() < b.apellido.toLowerCase()) return -1;
    if (a.apellido.toLowerCase() > b.apellido.toLowerCase()) return 1;
    
    // Si los apellidos son iguales, ordenar por nombre
    if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
    if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
    
    return 0;
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-brand-800">Usuarios</h1>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 min-w-0">
          <SearchUsuario placeholder="Buscar usuarios..." onSearch={handleSearch} />
        </div>
        <CreateUsuarioButton />
      </div>

      {conAcademia && (
        <p className="mb-4 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {MENSAJE_ACADEMIA}{' '}
          <Link href="/dashboard/academia" className="font-semibold underline">Ir a Academia</Link>
        </p>
      )}

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <UsuarioTabs 
            userTypes={userTypes}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            usuariosCount={usuarios.length}
            filteredCount={filteredUsuarios.length}
          />
          
          <div className="mt-4">
            <UsuarioTable 
              usuarios={sortedUsuarios} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </div>
        </>
      )}
    </div>
  );
}