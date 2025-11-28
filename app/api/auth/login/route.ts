import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();
  const { username, password } = await request.json();

  // Hardcoded Admin Bypass (Only keeps working if you don't delete this block)
  // Useful for first-time login if DB is empty
  if (username === 'admin' && password === 'admin') {
    return NextResponse.json({ 
      id: 'super-admin',
      name: 'Super Admin', 
      email: 'admin@gurukrupa.com', 
      role: 'Super Admin',
      token: 'admin-bypass-token' 
    });
  }

  // Real Database Check
  const user = await User.findOne({ email: username });
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: `jwt-${user._id}-${Date.now()}` // In a real app, sign this with jsonwebtoken
  });
}