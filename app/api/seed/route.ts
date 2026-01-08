import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import bcrypt from 'bcryptjs';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';

export async function GET(req: NextRequest) {
    const SEED_SECRET = process.env.SEED_SECRET;
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== SEED_SECRET) {
        return NextResponse.json({ message: 'Unauthorized: Invalid or missing secret' }, { status: 401 });
    }

    try {
        await dbConnect();

        // 1. Admin seeding (existing logic)
        const existingAdmin = await Admin.findOne();
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await Admin.create({
                email: 'admin@example.com',
                password: hashedPassword,
            });
        }

        // 2. Product seeding (if empty)
        const productCount = await Product.countDocuments();
        let products = [];
        if (productCount === 0) {
            products = await Product.insertMany([
                { name: "Pro Gaming Headset", price: 129.99, stock: 45, category: "Electronics", description: "Immersive sound." },
                { name: "Ergonomic Office Chair", price: 299.99, stock: 12, category: "Furniture", description: "Comfort all day." },
                { name: "Mechanical Keyboard", price: 89.99, stock: 25, category: "Electronics", description: "Clicky keys." },
                { name: "Leather Wallet", price: 49.99, stock: 100, category: "Accessories", description: "Genuine leather." },
                { name: "Running Shoes", price: 79.99, stock: 30, category: "Footwear", description: "Fast and light." },
                { name: "4K Monitor", price: 399.99, stock: 8, category: "Electronics", description: "Crystal clear." },
                { name: "Standing Desk", price: 549.99, stock: 5, category: "Furniture", description: "Healthy work." }
            ]);
        } else {
            products = await Product.find({});
        }

        // 3. Order seeding (if empty)
        const orderCount = await Order.countDocuments();
        if (orderCount === 0 && products.length > 0) {
            await Order.insertMany([
                {
                    customerName: "Alice Johnson",
                    customerEmail: "alice@example.com",
                    total: 219.98,
                    status: "Delivered",
                    items: [{ product: products[0]._id, quantity: 1, price: 129.99 }, { product: products[2]._id, quantity: 1, price: 89.99 }]
                },
                {
                    customerName: "Bob Smith",
                    customerEmail: "bob@test.com",
                    total: 299.99,
                    status: "Processing",
                    items: [{ product: products[1]._id, quantity: 1, price: 299.99 }]
                },
                {
                    customerName: "Charlie Brown",
                    customerEmail: "charlie@gmail.com",
                    total: 49.99,
                    status: "Delivered",
                    items: [{ product: products[3]._id, quantity: 1, price: 49.99 }]
                }
            ]);
        }

        return NextResponse.json({
            message: 'Database seeded successfully with Admin, Products, and Orders',
            admin: { email: 'admin@example.com', password: 'admin123' }
        });

    } catch (error) {
        return NextResponse.json({ message: 'Error seeding database', error }, { status: 500 });
    }
}
