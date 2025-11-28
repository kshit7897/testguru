import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Invoice from '../../../../lib/models/Invoice';
import Payment from '../../../../lib/models/Payment';
import Party from '../../../../lib/models/Party';

export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const partyId = searchParams.get('partyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!partyId) return NextResponse.json([], { status: 400 });

  const party = await Party.findById(partyId);
  if (!party) return NextResponse.json([], { status: 404 });

  // Fetch Invoices
  let invoiceQuery: any = { partyId };
  if (startDate && endDate) invoiceQuery.date = { $gte: startDate, $lte: endDate };
  const invoices = await Invoice.find(invoiceQuery).lean();

  // Fetch Payments
  let paymentQuery: any = { partyId };
  if (startDate && endDate) paymentQuery.date = { $gte: startDate, $lte: endDate };
  const payments = await Payment.find(paymentQuery).lean();

  // Normalize Data
  const invTrans = invoices.map((inv: any) => ({
    id: inv._id,
    date: inv.date,
    ref: inv.invoiceNo,
    type: inv.type === 'SALES' ? 'SALE' : 'PURCHASE',
    debit: inv.type === 'SALES' ? inv.grandTotal : 0,
    credit: inv.type === 'PURCHASE' ? inv.grandTotal : 0,
    desc: `${inv.type === 'SALES' ? 'Sale' : 'Purchase'} Invoice`
  }));

  const payTrans = payments.map((pay: any) => ({
    id: pay._id,
    date: pay.date,
    ref: pay.reference || 'PAY',
    type: 'PAYMENT',
    // Logic: If Party is Customer -> Payment Rcvd = Credit
    // If Party is Supplier -> Payment Made = Debit
    debit: party.type === 'Supplier' ? pay.amount : 0, 
    credit: party.type === 'Customer' ? pay.amount : 0,
    desc: `Payment (${pay.mode})`
  }));

  // Merge and Sort
  const allTrans = [...invTrans, ...payTrans].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate Running Balance
  let balance = party.openingBalance || 0;
  const ledger = allTrans.map(t => {
    if (party.type === 'Customer') {
      balance = balance + t.debit - t.credit;
    } else {
      balance = balance + t.credit - t.debit;
    }
    return { ...t, balance };
  });

  return NextResponse.json(ledger);
}