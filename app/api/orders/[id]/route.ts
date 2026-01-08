import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic to ensure we don't cache stale data
export const dynamic = 'force-dynamic';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // params is a Promise in Next.js 15/16 App Router
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedOrder });
        return NextResponse.json({ success: true, data: updatedOrder });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { id } = await params;

        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
