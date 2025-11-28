import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Invoice from '../../../lib/models/Invoice';
import Item from '../../../lib/models/Item';
import StockLog from '../../../lib/models/StockLog';

export async function GET() {
  await dbConnect();
  const invoices = await Invoice.find({}).sort({ createdAt: -1 });
  return NextResponse.json(invoices.map(doc => ({ ...doc.toObject(), id: doc._id.toString() })));
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    
    // 1. Create Invoice
    const invoice = await Invoice.create(body);

    // 2. Update Stock Levels
    const isSales = body.type === 'SALES';

    for (const lineItem of body.items) {
      if (!lineItem.itemId) continue;

      const qtyChange = isSales ? -lineItem.qty : lineItem.qty;

      // Update Item Stock
      await Item.findByIdAndUpdate(lineItem.itemId, { 
        $inc: { stock: qtyChange } 
      });

      // Log Stock Movement
      await StockLog.create({
        itemId: lineItem.itemId,
        itemName: lineItem.name,
        qty: qtyChange,
        type: isSales ? 'OUT' : 'IN',
        referenceId: invoice.invoiceNo,
        date: new Date()
      });
    }

    return NextResponse.json({ ...invoice.toObject(), id: invoice._id.toString() });
  } catch (error) {
    console.error("Invoice Create Error:", error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}