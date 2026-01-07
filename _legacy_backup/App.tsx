import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { DashboardCharts } from './components/DashboardCharts';
import ProductForm from './components/ProductForm';
import { Product, ProductFormData, DashboardStats } from './types';
import * as db from './services/dbService';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  PackageCheck, 
  AlertCircle, 
  DollarSign,
  Menu,
  Settings
} from './components/ui/Icons';

// --- Components defined locally to keep file count low while maintaining structure ---

const StatsCard: React.FC<{ title: string; value: string; icon: React.FC<any>; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-slate-500 text-sm">Fetching server-side data...</p>
  </div>
);

const AdminOnboarding = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setEmail('');
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-2xl">
      <h3 className="text-lg font-bold text-slate-800 mb-2">Admin Onboarding</h3>
      <p className="text-slate-500 text-sm mb-6">
        Securely onboard new administrators. They will receive an email with a magic link to set up their account.
      </p>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center">
          <PackageCheck size={16} className="mr-2" />
          Invitation sent successfully!
        </div>
      )}

      <form onSubmit={handleInvite} className="flex gap-4">
        <input 
          type="email" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@nexus.com"
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          type="submit"
          className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          Send Invite
        </button>
      </form>
    </div>
  );
};

// --- Auth Component ---
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded mock auth
    if ((email === 'admin@nexus.com' || email === 'manager@nexus.com') && password === 'admin') {
      onLogin();
    } else {
      setError('Invalid credentials. Try admin@nexus.com / admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">NexusAdmin</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your inventory</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="admin@nexus.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="admin"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Sign In
          </button>
          <div className="text-center text-xs text-slate-400">
             Protected by NextAuth.js
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.getProducts();
      setProducts(data);
      calculateStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const calculateStats = (data: Product[]) => {
    const totalStock = data.reduce((acc, curr) => acc + curr.stock, 0);
    const totalValue = data.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
    const lowStockCount = data.filter(p => p.stock < 10).length;

    setStats({
      totalProducts: data.length,
      totalStock,
      totalValue,
      lowStockCount
    });
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    if (editingProduct) {
      await db.updateProduct(editingProduct.id, formData);
    } else {
      await db.createProduct(formData);
    }
    await fetchData();
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await db.deleteProduct(id);
      await fetchData();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={() => setIsAuthenticated(false)}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10">
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <h2 className="text-xl font-bold text-slate-800 ml-2 md:ml-0 capitalize flex items-center gap-2">
            {currentPage === 'settings' && <Settings className="text-slate-400" size={20} />}
            {currentPage}
          </h2>

          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-slate-800">Admin User</p>
               <p className="text-xs text-slate-500">Super Admin</p>
             </div>
             {/* User Avatar Placeholder */}
             <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
               AD
             </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentPage === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  title="Total Products" 
                  value={stats.totalProducts.toString()} 
                  icon={PackageCheck} 
                  color="bg-blue-500" 
                />
                <StatsCard 
                  title="Total Inventory" 
                  value={stats.totalStock.toLocaleString()} 
                  icon={TrendingUp} 
                  color="bg-emerald-500" 
                />
                <StatsCard 
                  title="Inventory Value" 
                  value={`$${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                  icon={DollarSign} 
                  color="bg-violet-500" 
                />
                <StatsCard 
                  title="Low Stock Items" 
                  value={stats.lowStockCount.toString()} 
                  icon={AlertCircle} 
                  color="bg-amber-500" 
                />
              </div>

              {/* Charts */}
              <DashboardCharts products={products} />
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-slate-800">Recent Products</h3>
                   <button onClick={() => setCurrentPage('products')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="border-b border-slate-100 text-slate-400 text-sm">
                         <th className="pb-3 font-medium pl-2">Name</th>
                         <th className="pb-3 font-medium">Price</th>
                         <th className="pb-3 font-medium">Category</th>
                         <th className="pb-3 font-medium">Status</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {products.slice(0, 5).map(p => (
                         <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                           <td className="py-3 pl-2 text-slate-800 font-medium">{p.name}</td>
                           <td className="py-3 text-slate-500">${p.price}</td>
                           <td className="py-3 text-slate-500">{p.category}</td>
                           <td className="py-3">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                               {p.stock > 10 ? 'In Stock' : 'Low Stock'}
                             </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'products' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              {/* Actions Toolbar */}
              <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button 
                  onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  Add Product
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Stock</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                               No products found matching your search.
                             </td>
                           </tr>
                        ) : (
                          filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-100">
                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">{product.name}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{product.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                ${product.price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                  <span className={`text-sm ${product.stock < 10 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                    {product.stock} units
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === 'settings' && (
             <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
               
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                 <h3 className="text-lg font-bold text-slate-800 mb-4">General Settings</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b border-slate-50">
                     <div>
                       <p className="font-medium text-slate-800">Store Name</p>
                       <p className="text-sm text-slate-400">The name displayed on your storefront</p>
                     </div>
                     <span className="text-slate-600 font-medium">Nexus Store</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-slate-50">
                     <div>
                       <p className="font-medium text-slate-800">Currency</p>
                       <p className="text-sm text-slate-400">Default currency for products</p>
                     </div>
                     <span className="text-slate-600 font-medium">USD ($)</span>
                   </div>
                 </div>
               </div>

               {/* Admin Onboarding Section */}
               <AdminOnboarding />

               <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                 <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
                 <p className="text-red-600 text-sm mb-4">Irreversible actions for system administrators.</p>
                 <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
                   Reset Database
                 </button>
               </div>
             </div>
          )}
        </main>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm 
          initialData={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => { setIsFormOpen(false); setEditingProduct(undefined); }} 
        />
      )}
    </div>
  );
}