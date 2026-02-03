import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';

// GET all categories
export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find().sort({ name: 1 });

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST create new category
export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const category = await Category.create(body);

        return NextResponse.json({
            success: true,
            data: category
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}