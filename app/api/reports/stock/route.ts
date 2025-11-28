import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Item from '../../../../lib/models/Item';

export async function GET() {
  await dbConnect();
  const items = await Item.find({}).sort({ name: 1 });
  
  const report = items.map(item => ({
    id: item._id.toString(),
    name: item.name,
    unit: item.unit,
    purchaseRate: item.purchaseRate,
    stock: item.stock,
    value: item.stock * item.purchaseRate
  }));

  return NextResponse.json(report);
}