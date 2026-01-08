"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShoppingCart, Search, Download, Filter, Trash2, CheckCircle, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Types
interface OrderItem {
    product: {
        _id: string; // Needed for selection
        name: string;
        price: number;
    };
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
}

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // New Order Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newOrderCustomer, setNewOrderCustomer] = useState("");
    const [newOrderEmail, setNewOrderEmail] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [newOrderQuantity, setNewOrderQuantity] = useState(1);
    const [creatingOrder, setCreatingOrder] = useState(false);

    const showToast = (message: string) => {
        console.log("Toast:", message);
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch products");
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingOrder(true);

        const product = products.find(p => p._id === selectedProductId);
        if (!product) {
            alert("Please select a product");
            setCreatingOrder(false);
            return;
        }

        const newOrder = {
            customerName: newOrderCustomer,
            customerEmail: newOrderEmail,
            total: product.price * newOrderQuantity,
            status: 'Pending',
            items: [{
                product: product._id,
                quantity: newOrderQuantity,
                price: product.price
            }]
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });

            if (res.ok) {
                const data = await res.json();
                setOrders([data.data, ...orders]); // Optimistic-ish update (using returned data)
                setIsDialogOpen(false);
                setNewOrderCustomer("");
                setNewOrderEmail("");
                setSelectedProductId("");
                setNewOrderQuantity(1);
                showToast("Order created successfully");
            } else {
                alert("Failed to create order");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating order");
        } finally {
            setCreatingOrder(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            showToast(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error(error);
            fetchOrders();
            alert("Failed to update status");
        }
    };

    const handleDelete = async (orderId: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;
        setOrders(prev => prev.filter(o => o._id !== orderId));
        try {
            await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
            showToast("Order deleted successfully");
        } catch (error) {
            console.error(error);
            fetchOrders();
            alert("Failed to delete order");
        }
    };

    const exportToCSV = () => {
        const headers = ["Order ID", "Customer Name", "Email", "Status", "Total", "Date"];
        const rows = filteredOrders.map(o => [
            o._id,
            o.customerName,
            o.customerEmail,
            o.status,
            o.total.toFixed(2),
            new Date(o.createdAt).toLocaleDateString()
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order._id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500 hover:bg-emerald-600';
            case 'Delivered': return 'bg-emerald-500 hover:bg-emerald-600';
            case 'Processing': return 'bg-blue-500 hover:bg-blue-600';
            case 'Shipped': return 'bg-purple-500 hover:bg-purple-600';
            case 'Cancelled': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif">Order Management</h2>
                    <p className="text-muted-foreground mt-1">Manage and track your customer orders.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> New Order
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Order</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateOrder} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Customer Name</Label>
                                    <Input
                                        value={newOrderCustomer}
                                        onChange={(e) => setNewOrderCustomer(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Customer Email</Label>
                                    <Input
                                        value={newOrderEmail}
                                        onChange={(e) => setNewOrderEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        type="email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Product</Label>
                                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(product => (
                                                <SelectItem key={product._id} value={product._id}>
                                                    {product.name} (${product.price})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newOrderQuantity}
                                        onChange={(e) => setNewOrderQuantity(parseInt(e.target.value))}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={creatingOrder}>
                                        {creatingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Create Order
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={exportToCSV} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-md bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-8 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-background/50">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Statuses</SelectItem>
                                    {STATUS_OPTIONS.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-background/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                            No orders found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order._id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-xs font-medium">
                                                {order._id.slice(-6).toUpperCase()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{order.customerName}</span>
                                                    <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={order.items.map(i => i.product?.name || "Deleted Product").join(', ')}>
                                                {order.items.map(i => i.product?.name || "Deleted Product").join(', ')}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                ${order.total.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    defaultValue={order.status}
                                                    onValueChange={(val) => handleStatusUpdate(order._id, val)}
                                                >
                                                    <SelectTrigger className={`h-8 w-[130px] text-white border-none ${getStatusColor(order.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map(s => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                                    onClick={() => handleDelete(order._id)}
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
