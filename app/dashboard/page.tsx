import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/charts/OverviewChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import { RecentOrders } from "@/components/recent-orders";
import { DollarSign, Package, Users, Activity, AlertTriangle } from "lucide-react";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";

export const dynamic = "force-dynamic";

async function getStats() {
    await dbConnect();

    const productCount = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ stock: { $lt: 5 } });

    // Sales aggregation
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const salesCount = orders.length;

    // Category data for Pie Chart
    const categoryStats = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count" } }
    ]);

    // Recent Orders
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);

    return {
        totalRevenue,
        productCount,
        salesCount,
        lowStock,
        categoryStats,
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        // Mock Sales Data for Bar Chart if no real data is aggregated by date yet
        salesData: [
            { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
            { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
        ]
    };
}

export default async function DashboardPage() {
    const stats = await getStats();

    return (
        <div className="flex-1 space-y-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.salesCount}</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.productCount}</div>
                        <p className="text-xs text-muted-foreground">{stats.lowStock} low stock items</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.categoryStats.length}</div>
                        <p className="text-xs text-muted-foreground">Active categories</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryPieChart data={stats.categoryStats} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentOrders orders={stats.recentOrders} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
