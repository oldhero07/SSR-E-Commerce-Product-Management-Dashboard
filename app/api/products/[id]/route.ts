import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Params = {
    params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Params) {
    await dbConnect();
    try {
        const { id } = await params;
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: product });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const product = await Product.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message || 'Failed to update product' }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const { id } = await params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
    }
}
