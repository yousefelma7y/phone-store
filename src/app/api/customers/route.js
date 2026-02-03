import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Customer from '../../../models/Customer';

// GET all customers
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search');
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const customers = await Customer.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Customer.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST create new customer
export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        // Check if phone number already exists
        if (body.phone) {
            const existingCustomer = await Customer.findOne({ phone: body.phone });

            if (existingCustomer) {
                return NextResponse.json({
                    success: false,
                    error: 'هذا العميل موجود بالفعل',
                    existingCustomer: {
                        id: existingCustomer._id,
                        name: existingCustomer.name,
                        phone: existingCustomer.phone
                    }
                }, { status: 409 }); // 409 Conflict status
            }
        }

        const customer = await Customer.create(body);

        return NextResponse.json({
            success: true,
            data: customer
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}