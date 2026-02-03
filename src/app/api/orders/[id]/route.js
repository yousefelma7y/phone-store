// import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from 'next/server';

import connectDB from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";
import Customer from "../../../../models/Customer";



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

// GET - Get single order by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const order = await Order.findById(id)
      .populate('customer')
      .populate('items.product');

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 200 });

  } catch (error) {
    if (error.kind === 'ObjectId') {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update order
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { customer, items, discount, shipping, status } = body;

    // Check if order exists
    let order = await Order.findById(id).populate('items.product');
    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    // If order is being cancelled, return all stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const productId = item.product._id ? item.product._id : item.product;
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    // If order is being un-cancelled (changed from cancelled to another status), deduct stock again
    if (order.status === 'cancelled' && status && status !== 'cancelled') {
      for (const item of order.items) {
        const productId = item.product._id ? item.product._id : item.product;
        const product = await Product.findById(productId);

        if (!product) {
          return NextResponse.json({
            success: false,
            message: `Product not found: ${productId}`
          }, { status: 404 });
        }

        if (product.stock < item.quantity) {
          return NextResponse.json({
            success: false,
            message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          }, { status: 400 });
        }

        await Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // If customer is being updated, validate it exists
    if (customer && customer !== order.customer.toString()) {
      const customerExists = await Customer.findById(customer);
      if (!customerExists) {
        return NextResponse.json({
          success: false,
          message: 'Customer not found'
        }, { status: 404 });
      }
    }

    // If items are being updated (and order is not cancelled), handle stock changes
    let validatedItems = order.items;
    if (items && status !== 'cancelled') {
      // Create a map of old items for comparison
      const oldItemsMap = new Map();
      order.items.forEach(item => {
        const productId = item.product._id ? item.product._id.toString() : item.product.toString();
        oldItemsMap.set(productId, item.quantity);
      });

      // Create a map of new items
      const newItemsMap = new Map();
      items.forEach(item => {
        const productId = (item.product || item._id).toString();
        newItemsMap.set(productId, item.quantity);
      });

      validatedItems = [];

      // Process new/updated items
      for (const item of items) {
        const productId = (item.product || item._id).toString();
        const product = await Product.findById(productId);

        if (!product) {
          return NextResponse.json({
            success: false,
            message: `Product not found: ${productId}`
          }, { status: 404 });
        }

        const oldQuantity = oldItemsMap.get(productId) || 0;
        const newQuantity = item.quantity;
        const quantityDiff = newQuantity - oldQuantity;

        // If quantity increased, check stock availability
        if (quantityDiff > 0) {
          if (product.stock < quantityDiff) {
            return NextResponse.json({
              success: false,
              message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${quantityDiff}`
            }, { status: 400 });
          }
          // Deduct additional stock
          await Product.findByIdAndUpdate(
            productId,
            { $inc: { stock: -quantityDiff } }
          );
        } else if (quantityDiff < 0) {
          // If quantity decreased, return stock
          await Product.findByIdAndUpdate(
            productId,
            { $inc: { stock: Math.abs(quantityDiff) } }
          );
        }

        validatedItems.push({
          product: productId,
          quantity: newQuantity,
          price: item.price
        });
      }

      // Handle removed items - return their stock
      for (const [productId, quantity] of oldItemsMap) {
        if (!newItemsMap.has(productId)) {
          // Item was removed, return its stock
          await Product.findByIdAndUpdate(
            productId,
            { $inc: { stock: quantity } }
          );
        }
      }
    }

    // Calculate new totals
    const { subtotal, discountAmount, total } = calculateOrderTotals(
      validatedItems,
      discount || order.discount,
      shipping !== undefined ? shipping : order.shipping
    );

    // Update order
    const updateData = {
      subtotal,
      total,
      discount: discount ? {
        amount: discountAmount,
        value: discount.value,
        type: discount.type
      } : order.discount
    };

    if (customer) updateData.customer = customer;
    if (items) updateData.items = validatedItems;
    if (shipping !== undefined) updateData.shipping = shipping;
    if (status) updateData.status = status;

    order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('customer')
      .populate('items.product');

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 200 });

  } catch (error) {
    console.error('PUT Error:', error);

    if (error.kind === 'ObjectId') {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

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
      message: 'Error updating order',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete order
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const order = await Order.findById(id).populate('items.product');

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    // Return stock for all items in the order (only if order is not already cancelled)
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        const productId = item.product._id ? item.product._id : item.product;
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully and stock returned',
      data: {}
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE Error:', error);

    if (error.kind === 'ObjectId') {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    }, { status: 500 });
  }
}