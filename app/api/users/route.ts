import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 }); // Exclude password from result
    const formatted = users.map(doc => ({ ...doc.toObject(), id: doc._id.toString() }));
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const newUser = await User.create({
      ...body,
      password: hashedPassword
    });

    const { password, ...userWithoutPass } = newUser.toObject();
    
    return NextResponse.json({ ...userWithoutPass, id: newUser._id.toString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}