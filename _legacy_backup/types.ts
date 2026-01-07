export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt'>;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}