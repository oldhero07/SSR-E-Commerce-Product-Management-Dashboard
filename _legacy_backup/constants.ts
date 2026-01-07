import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ergonomic Office Chair',
    description: 'A comfortable chair designed for long hours of work with lumbar support.',
    price: 199.99,
    stock: 45,
    category: 'Furniture',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    createdAt: new Date('2023-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Wireless Mechanical Keyboard',
    description: 'High-performance mechanical keyboard with RGB backlighting and blue switches.',
    price: 89.99,
    stock: 120,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    createdAt: new Date('2023-02-10').toISOString(),
  },
  {
    id: '3',
    name: 'Noise Cancelling Headphones',
    description: 'Immersive sound experience with active noise cancellation technology.',
    price: 249.50,
    stock: 15,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    createdAt: new Date('2023-03-05').toISOString(),
  },
  {
    id: '4',
    name: 'Minimalist Desk Lamp',
    description: 'Sleek LED desk lamp with adjustable brightness and color temperature.',
    price: 45.00,
    stock: 8,
    category: 'Furniture',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    createdAt: new Date('2023-03-20').toISOString(),
  },
  {
    id: '5',
    name: 'Smart Fitness Watch',
    description: 'Track your health metrics, steps, and sleep patterns with precision.',
    price: 129.99,
    stock: 60,
    category: 'Wearables',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    createdAt: new Date('2023-04-01').toISOString(),
  },
];

export const CATEGORIES = ['Electronics', 'Furniture', 'Wearables', 'Accessories', 'Home & Garden'];