import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Brand from '../../../../models/Brand';

// GET single brand
export async function GET(request, { params }) {
    try {
        await connectDB();

        const brand = await Brand.findById(params.id);

        if (!brand) {
            return NextResponse.json(
                { success: false, error: 'هذة العلامة التجارية غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: brand
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT update brand
export async function PUT(request, { params }) {
    try {
        await connectDB();

        const body = await request.json();
        const brand = await Brand.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!brand) {
            return NextResponse.json(
                { success: false, error: 'هذة العلامة التجارية غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: brand
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// DELETE brand
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const brand = await Brand.findByIdAndDelete(params.id);

        if (!brand) {
            return NextResponse.json(
                { success: false, error: 'هذة العلامة التجارية غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف العلامة التجارية بنجاح'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}