import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import connectDB from '../../../../lib/mongodb';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await User.findById(params.id);
    if (!user) return Response.json({ success: false, message: "User not found" }, { status: 404 });
    return Response.json({ success: true, data: user });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    // If password is provided, hash it
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const user = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!user) return Response.json({ success: false, message: "User not found" }, { status: 404 });
    return Response.json({ success: true, data: user });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await User.findByIdAndDelete(params.id);
    if (!user) return Response.json({ success: false, message: "User not found" }, { status: 404 });
    return Response.json({ success: true, message: "User deleted" });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
