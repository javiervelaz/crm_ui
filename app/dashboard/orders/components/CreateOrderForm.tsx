'use client'

import { createOrder } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CreateOrderPage = () => {
  const [orderDetails, setOrderDetails] = useState({
    date: '',
    item: '',
    price: ''
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setOrderDetails({
      ...orderDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createOrder(orderDetails);
      router.push('/dashboard/orders');
    } catch (error) {
      console.error('Failed to create order', error);
    }
  };

  const handleCancel = () => {
    setOrderDetails({
      date: '',
      item: '',
      price: ''
    });
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl mb-6">Create Order</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={orderDetails.date}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Item
          </label>
          <input
            type="text"
            name="item"
            value={orderDetails.item}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={orderDetails.price}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
