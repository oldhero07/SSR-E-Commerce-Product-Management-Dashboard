import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    try {
        // Populate product details in items
        const orders = await Order.find({})
            .populate('items.product')
            .sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: orders });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Orders can be public (created by customers) so we might not check session here
    // But for this ADMIN dashboard demo, let's assume it's external or seeded.
    // For manual creation inside dashboard:
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const body = await request.json();
        const order = await Order.create(body);
        return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
