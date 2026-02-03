// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import connectDB from "../../../lib/mongodb";

import Order from "../../../models/Order";
import Product from "../../../models/Product";
import Customer from "../../../models/Customer";


// Helper function to calculate order totals
const calculateOrderTotals = (items, discount, shipping) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discountAmount = 0;
  if (discount) {
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }
  }

  const total = subtotal - discountAmount + (shipping || 0);

  return {
    subtotal,
    discountAmount,
    total: Math.max(0, total)
  };
};

// GET - Get all orders
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customer = searchParams.get('customer');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const filter = {};

    // Status filter
    if (status) filter.status = status;

    // Customer filter
    if (customer) filter.customer = customer;

    // Search filter - searches in order _id or customer phone (exact match only)
    if (search) {
      // First, try to find customer with exact phone match
      const customers = await Customer.find({
        phone: search
      }).select('_id');

      const customerIds = customers.map(c => c._id);

      // If exact phone match found, search by customer IDs
      // Otherwise, search by order ID
      if (customerIds.length > 0) {
        filter.customer = { $in: customerIds };
      } else {
        filter._id = search;
      }
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        // Add 23:59:59 to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name sku price')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(filter);

    return NextResponse.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { customer, items, discount, shipping, status } = body;

    let customerId;

    // Check if customer has _id (existing customer) or needs to be created
    if (customer._id) {
      // Existing customer - validate it exists
      const customerExists = await Customer.findOne({ _id: customer._id });
      if (!customerExists) {
        return NextResponse.json({
          success: false,
          message: 'Customer not found'
        }, { status: 404 });
      }
      customerId = customer._id;
    } else {
      // New customer - create it
      if (!customer.name || !customer.phone) {
        return NextResponse.json({
          success: false,
          message: 'Customer name and phone are required'
        }, { status: 400 });
      }

      // Check if phone already exists
      const existingCustomer = await Customer.findOne({ phone: customer.phone });
      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        const newCustomer = await Customer.create({
          name: customer.name,
          phone: customer.phone,
          birthdayDate: customer.dateOfBirth || customer.birthdayDate
        });
        customerId = newCustomer._id;
      }
    }

    // Validate products, check stock, and get current prices
    const validatedItems = [];
    for (const item of items) {
      const productId = item._id || item.product;
      const product = await Product.findById(productId);

      if (!product) {
        return NextResponse.json({
          success: false,
          message: `Product not found: ${productId}`
        }, { status: 404 });
      }

      // Check if enough stock is available
      if (product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `كمية المنتج غير كافية: ${product.name}. المتوفر: ${product.stock}, المطلوب: ${item.quantity}`
        }, { status: 400 });
      }

      validatedItems.push({
        product: productId,
        quantity: item.quantity,
        price: item.price || item.salePrice || product.price
      });
    }

    // Calculate totals
    const { subtotal, discountAmount, total } = calculateOrderTotals(
      validatedItems,
      discount,
      shipping
    );

    // START TRANSACTION
    const session = await Order.startSession();
    session.startTransaction();

    try {
      // Create order with session
      const orderData = {
        customer: customerId,
        items: validatedItems,
        discount: discount ? {
          amount: discountAmount,
          value: discount.value || 0,
          type: discount.type || 'percentage'
        } : undefined,
        shipping: shipping || 0,
        subtotal,
        total,
        status: status || 'pending'
      };

      const [order] = await Order.create([orderData], { session });

      // Deduct stock from products with session
      for (const item of validatedItems) {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );

        // Double-check stock didn't go negative (race condition protection)
        if (updatedProduct.stock < 0) {
          throw new Error(`Stock became negative for product: ${updatedProduct.name}`);
        }
      }

      // Commit transaction
      await session.commitTransaction();

      // Populate and return (after transaction is committed)
      const populatedOrder = await Order.findById(order._id)
        .populate('customer')
        .populate('items.product');

      return NextResponse.json({
        success: true,
        data: populatedOrder
      }, { status: 201 });

    } catch (transactionError) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw transactionError;
    } finally {
      // End session
      session.endSession();
    }

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: messages
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error creating order',
      error: error.message
    }, { status: 500 });
  }
}