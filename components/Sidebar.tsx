"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Package, LayoutDashboard, LogOut, PlusCircle, Shield, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col w-64 bg-slate-900 text-white border-r">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">NexusAdmin</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                <Link href="/dashboard" className={cn("flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-800 transition text-sm font-medium", pathname === '/dashboard' ? 'bg-slate-800 text-blue-400' : 'text-slate-400')}>
                    <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link href="/dashboard/products" className={cn("flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-800 transition text-sm font-medium", pathname === '/dashboard/products' ? 'bg-slate-800 text-blue-400' : 'text-slate-400')}>
                    <Package size={20} /> Products
                </Link>
                <Link href="/dashboard/orders" className={cn("flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-800 transition text-sm font-medium", pathname === '/dashboard/orders' ? 'bg-slate-800 text-blue-400' : 'text-slate-400')}>
                    <ShoppingCart size={20} /> Orders
                </Link>
                <Link href="/dashboard/customers" className={cn("flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-800 transition text-sm font-medium", pathname === '/dashboard/customers' ? 'bg-slate-800 text-blue-400' : 'text-slate-400')}>
                    <Users size={20} /> Customers
                </Link>
                <Link href="/dashboard/products/add" className={cn("flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-800 transition text-sm font-medium", pathname === '/dashboard/products/add' ? 'bg-slate-800 text-blue-400' : 'text-slate-400')}>
                    <PlusCircle size={20} /> Add Product
                </Link>
                <Link href="/dashboard/admins" className={cn("flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-800 transition text-sm font-medium", pathname === '/dashboard/admins' ? 'bg-slate-800 text-blue-400' : 'text-slate-400')}>
                    <Shield size={20} /> Admins
                </Link>
            </nav>
            <div className="p-4 border-t border-slate-800">
                <Button variant="destructive" className="w-full gap-2" onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut size={16} /> Logout
                </Button>
            </div>
        </div>
    );
}
