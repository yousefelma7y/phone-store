import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        await connectDB();
        const { userName, password } = await request.json()

        if (!userName || !password) {
            return NextResponse.json(
                { success: false, message: "Username and password are required" },
                { status: 400 }
            );
        }
        const user = await User.findOne({ userName: userName });

        if (!user) {
            return NextResponse.json(
                { message: "هناك خطأ في إسم المستخدم او كلمة السر" },
                { status: 404 }
            );
        }

        // For first time setup, you might want to hash the password
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return NextResponse.json(
                { message: "كلمة السر غير صحيحة" },
                { status: 400 }
            );
        }

        const safeUser = {
            _id: user._id,
            userName: user.userName,
            brandName: user.brandName,
            location: user.location,
            phone: user.phone,
            logo: user.logo,
        };

        const response = NextResponse.json(
            { message: "Logged in successfully", user: safeUser },
            { status: 200 }
        );
        return response
    } catch (error) {
        // Changed this line - return NextResponse instead of Error
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}