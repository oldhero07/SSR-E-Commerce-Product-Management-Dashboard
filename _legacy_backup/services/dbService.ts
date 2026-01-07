import { Product, ProductFormData } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const STORAGE_KEY = 'dashboard_products_v1';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProducts = async (): Promise<Product[]> => {
  await delay(500); // Fake SSR/Network latency
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const createProduct = async (data: ProductFormData): Promise<Product> => {
  await delay(600);
  const products = await getProducts();
  const newProduct: Product = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  const updatedProducts = [newProduct, ...products];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  return newProduct;
};

export const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
  await delay(400);
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Product not found");
  
  const updatedProduct = { ...products[index], ...data };
  products[index] = updatedProduct;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await delay(400);
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};