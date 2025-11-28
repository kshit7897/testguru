import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Invoice from '../../../lib/models/Invoice';
import Item from '../../../lib/models/Item';

export async function GET() {
  await dbConnect();
  
  const totalSales = await Invoice.aggregate([
    { $match: { type: 'SALES' } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);

  const totalPurchase = await Invoice.aggregate([
    { $match: { type: 'PURCHASE' } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);

  const lowStock = await Item.countDocuments({ stock: { $lt: 10 } });

  const recent = await Invoice.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return NextResponse.json({
    totalSales: totalSales[0]?.total || 0,
    totalPurchase: totalPurchase[0]?.total || 0,
    receivables: 0, // Should be calculated from outstanding logic
    lowStock,
    recentTransactions: recent.map((i: any) => ({
      id: i.invoiceNo,
      party: i.partyName,
      amount: i.grandTotal,
      type: i.type === 'SALES' ? 'Sale' : 'Purchase',
      date: i.date
    }))
  });
}