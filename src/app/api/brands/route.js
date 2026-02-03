import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Brand from '../../../models/Brand';

// GET all brands
export async function GET(request) {
    try {
        await connectDB();

        // Get search param from the request URL
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        // Build filter: if search provided, filter by name using case-insensitive regex
        const filter = search
            ? { name: { $regex: search, $options: "i" } }
            : {};

        // Query with sorting
        const brands = await Brand.find(filter).sort({ name: 1 });

        return NextResponse.json({
            success: true,
            data: brands,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST create new brand
export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const brand = await Brand.create(body);

        return NextResponse.json({
            success: true,
            data: brand
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}