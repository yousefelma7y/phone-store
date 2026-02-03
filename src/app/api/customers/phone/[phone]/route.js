import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Customer from '../../../../../models/Customer';

// GET customer by phone number
export async function GET(request, { params }) {
    try {
        await connectDB();

        const customer = await Customer.findOne({ phone: params.phone });

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