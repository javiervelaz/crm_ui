'use client'

import { getClienteId } from "@/app/lib/authService";
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { deleteUser, getUserList, getUserTypes } from '@/app/lib/usuario.api';
import { lusitana } from '@/app/ui/fonts';
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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
  
    const fetchData = async () => {
     
      try {
        const [usersData, typesData] = await Promise.all([
          getUserList(getClienteId()),
          getUserTypes()
        ]);
        
        // Enriquecer usuarios con información del tipo
      const enrichedUsers = usersData.map(user => {
        const userType = typesData.find(type => type.id === user.user_type_id);
        return {
          ...user,
          user_type_codigo: userType?.codigo,
          user_type_descripcion: userType?.descripcion
        };
      });
   
        setUsers(enrichedUsers);
        setUserTypes(typesData);
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
        const enrichedUsers = usersData.map(user => {
          const userType = typesData.find(type => type.id === user.user_type_id);
          return {
            ...user,
            user_type_codigo: userType?.codigo,
            user_type_descripcion: userType?.descripcion
          };
        });
      
        setUsers(enrichedUsers);
        setUserTypes(typesData);
      
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
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className={`${lusitana.className} text-2xl`}>Usuarios</h1>
      </div>
      
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-6">
        <SearchUsuario placeholder="Buscar usuarios..." onSearch={handleSearch} />
        <CreateUsuarioButton />
      </div>

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