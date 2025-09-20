'use client'

import { useRouter } from 'next/navigation';

export const CreateOrderButton = () => {
  const router = useRouter();

  const handleCreateOrder = () => {
    router.push('/dashboard/orders/create');
  };

  return (
    <button
      onClick={handleCreateOrder}
      className="bg-blue-500 text-white px-4 py-2 rounded-md"
    >
      Create Order
    </button>
  );
};
