import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Category from '../../../../models/Category';

// GET single category
export async function GET(request, { params }) {
    try {
        await connectDB();

        const category = await Category.findById(params.id);

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'هذة الفئة غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT update category
export async function PUT(request, { params }) {
    try {
        await connectDB();

        const body = await request.json();
        const category = await Category.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'هذه الفئة غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// DELETE category
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const category = await Category.findByIdAndDelete(params.id);

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'هذة الفئة غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف الفئة بنجاح'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}