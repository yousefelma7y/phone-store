import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

// ✅ GET /api/products/:id
export async function GET(req, { params }) {
    try {
        await connectDB();
        const product = await Product.findById(params.id)
            .populate('brand', 'name')
            .populate('category', 'name');

        if (!product) {
            return NextResponse.json({ message: 'هذا المنتج غير موجود' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('GET Product error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// ✅ PUT /api/products/:id
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const data = await req.json();

        const product = await Product.findByIdAndUpdate(params.id, data, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return NextResponse.json({ message: 'هذا المنتج غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ message: 'تم تحديث المنتج', product });
    } catch (error) {
        console.error('UPDATE Product error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// ✅ DELETE /api/products/:id
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const product = await Product.findByIdAndDelete(params.id);

        if (!product) {
            return NextResponse.json({ message: 'هذا المنتج غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ message: 'تم حذف المنتج' });
    } catch (error) {
        console.error('DELETE Product error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
