import { NextResponse } from 'next/server';
import User from '../../../models/User';
import bcrypt from "bcryptjs";
import connectDB from '../../../lib/mongodb';


export async function GET() {
    try {
        await connectDB();
        const users = await User.find().sort({ createdAt: -1 });
        return Response.json({ success: true, data: users });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { userName, password, brandName, location, phone, logo } = body;

        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return Response.json({ success: false, message: "Username already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            userName,
            password: hashedPassword,
            brandName,
            location,
            phone,
            logo,
        });

        return Response.json({ success: true, data: user });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
