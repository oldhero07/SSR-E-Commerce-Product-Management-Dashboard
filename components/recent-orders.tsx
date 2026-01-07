import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Order {
    customerName: string;
    customerEmail: string;
    total: number;
}

export function RecentOrders({ orders }: { orders: Order[] }) {
    return (
        <div className="space-y-8">
            {orders.map((order, index) => (
                <div className="flex items-center" key={index}>
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{order.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                            {order.customerEmail}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+${order.total.toFixed(2)}</div>
                </div>
            ))}
        </div>
    );
}
