'use client'

import { lusitana } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateOrderButton } from './CreateOrderButton';
import OrdersTable from './OrderTable';
import { OrdersTableSkeleton } from './OrdersTableSkeleton';
import SearchOrder from './SearchOrder';

interface Order {
  id: number;
  date: string;
  item: string;
  price: number;
}

const mockOrders = [
  { id: 1, date: '2024/08/22', item: 'Pizza Margherita', price: 12.99 },
  { id: 2, date: '2024/08/22', item: 'Pizza Pepperoni', price: 15.99 },
  { id: 3, date: '2024/08/22', item: 'Pizza Vegana', price: 13.99 },
  { id: 4, date: '2024/08/22', item: 'Pizza Hawaiana', price: 14.99 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); // Redirige al login si no hay token
    }
    // Simulación de carga de datos
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 3000);
  }, [router]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleEdit = (id: number) => {
    // Lógica para editar una orden
    console.log(`Editar orden con id: ${id}`);
  };

  const handleDelete = (id: number) => {
    // Lógica para eliminar una orden
    console.log(`Eliminar orden con id: ${id}`);
    setOrders(orders.filter(order => order.id !== id));
  };

  const filteredOrders = orders.filter(order => 
    order.item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className={`${lusitana.className} text-2xl`}>Orders</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-6">
        <SearchOrder placeholder="Search orders..." onSearch={handleSearch} />
        <CreateOrderButton />
      </div>
      {loading ? (
        <OrdersTableSkeleton />
      ) : (
        <OrdersTable orders={filteredOrders} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
    </div>
  );
}
