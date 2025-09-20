'use client'

import React from 'react';

interface Order {
  id: number;
  date: string;
  item: string;
  price: number;
}

interface OrdersTableProps {
  orders: Order[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onEdit, onDelete }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden (item)</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Editar</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eliminar</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
            <td className="px-6 py-4 whitespace-nowrap">{order.item}</td>
            <td className="px-6 py-4 whitespace-nowrap">${order.price.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button onClick={() => onEdit(order.id)} className="text-blue-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536M9 11l-6 6v3h3l6-6m-4 2h4a2 2 0 012 2v4m-7-7L2 19m3-6v2m0 0l6-6m6-6l2.828 2.828a2 2 0 010 2.828l-9 9a2 2 0 01-2.828 0L7 13M16 6V4m-4 4h2m-2-2h2"
                  ></path>
                </svg>
              </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button onClick={() => onDelete(order.id)} className="text-red-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrdersTable;
