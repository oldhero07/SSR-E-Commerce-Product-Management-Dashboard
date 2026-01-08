"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Search, Mail } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface Order {
    _id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    createdAt: string;
}

interface Customer {
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (data.success) {
                    processCustomers(data.data);
                }
            } catch (e) {
                console.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const processCustomers = (orders: Order[]) => {
        const customerMap = new Map<string, Customer>();

        orders.forEach(order => {
            const email = order.customerEmail.toLowerCase();
            const existing = customerMap.get(email);

            if (existing) {
                existing.totalOrders += 1;
                existing.totalSpent += order.total;
                if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
                    existing.lastOrderDate = order.createdAt;
                }
            } else {
                customerMap.set(email, {
                    name: order.customerName,
                    email: order.customerEmail,
                    totalOrders: 1,
                    totalSpent: order.total,
                    lastOrderDate: order.createdAt
                });
            }
        });

        setCustomers(Array.from(customerMap.values()));
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-serif">Customers</h2>
                <p className="text-muted-foreground mt-1">View and manage your client base.</p>
            </div>

            <Card className="border-none shadow-md bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers..."
                            className="pl-8 bg-background/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-background/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Properties</TableHead>
                                    <TableHead>Total Orders</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Last Active</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.email} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {customer.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    {customer.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>{customer.totalOrders}</TableCell>
                                            <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                ${customer.totalSpent.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(customer.lastOrderDate).toLocaleDateString()}
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
