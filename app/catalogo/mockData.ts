import type { CatalogProduct } from './types';

export const catalogProducts: CatalogProduct[] = [
  {
    id: '1',
    name: 'Pizza Muzza',
    description: 'Mozzarella, salsa de tomate y aceitunas verdes.',
    price: 12000,
    imageUrl:
      'https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Pizzas',
    tags: ['Clásico', 'Promo'],
  },
  {
    id: '2',
    name: 'Pizza Napolitana',
    description: 'Mozzarella, tomate en rodajas, ajo y orégano.',
    price: 13500,
    imageUrl:
      'https://images.pexels.com/photos/1120021/pexels-photo-1120021.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Pizzas',
    tags: ['Favorito'],
  },
    {
    id: '3',
    name: 'Empanadas de Carne',
    description: 'Carne cortada a cuchillo, huevo y aceitunas.',
    price: 2200,
    imageUrl:
      'https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Empanadas',
    tags: ['Nuevo'],
  },
  {
    id: '4',
    name: 'Empanadas de JyQ',
    description: 'Jamón cocido y queso mozzarella.',
    price: 2100,
    imageUrl:
      'https://images.pexels.com/photos/4109992/pexels-photo-4109992.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Empanadas',
  },
  {
    id: '5',
    name: 'Coca Cola 1.5L',
    description: 'Gaseosa sabor cola 1.5 litros.',
    price: 3500,
    imageUrl:
      'https://images.pexels.com/photos/8674159/pexels-photo-8674159.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
  },
  {
    id: '6',
    name: 'Agua Mineral 500ml',
    description: 'Agua mineral sin gas, 500ml.',
    price: 1600,
    imageUrl:
      'https://images.pexels.com/photos/670762/pexels-photo-670762.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
    tags: ['Sin azúcar'],
  },
];
