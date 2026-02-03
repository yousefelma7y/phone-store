import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Customer from '../../../../models/Customer';

// GET single customer
export async function GET(request, { params }) {
    try {
        await connectDB();

        const customer = await Customer.findById(params.id);

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: customer
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT update customer
export async function PUT(request, { params }) {
    try {
        await connectDB();

        const body = await request.json();
        const customer = await Customer.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: customer
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// DELETE customer
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const customer = await Customer.findByIdAndDelete(params.id);

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تم حذف العميل بنجاح'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}