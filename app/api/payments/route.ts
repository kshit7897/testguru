import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Payment from '../../../lib/models/Payment';

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const partyId = searchParams.get('partyId');
  
  const query = partyId ? { partyId } : {};
  const payments = await Payment.find(query).sort({ date: -1 });
  
  return NextResponse.json(payments.map(doc => ({ ...doc.toObject(), id: doc._id.toString() })));
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const payment = await Payment.create(body);
    return NextResponse.json({ ...payment.toObject(), id: payment._id.toString() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}