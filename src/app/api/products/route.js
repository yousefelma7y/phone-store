import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');

    // Build query object
    const query = {};
    // Search filter (name or id)
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } } // Case-insensitive search by name
      ];

      // Check if search string is a valid number
      const numericId = Number(search);
      if (!isNaN(numericId)) {
        searchConditions.push({ _id: numericId });
      }

      query.$or = searchConditions;
    }

    // Category filter
    if (categoryId) {
      query.category = categoryId;
    }

    // Brand filter
    if (brandId) {
      query.brand = brandId;
    }

    const products = await Product.find(query)
      .populate('brand')
      .populate('category')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const product = await Product.create(body);

    const populatedProduct = await Product.findById(product._id)
      .populate('brand')
      .populate('category');

    return NextResponse.json(
      { success: true, data: populatedProduct },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
