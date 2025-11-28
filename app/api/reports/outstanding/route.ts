import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Party from '../../../../lib/models/Party';
import Invoice from '../../../../lib/models/Invoice';
import Payment from '../../../../lib/models/Payment';

export async function GET() {
  await dbConnect();
  
  const parties = await Party.find({}).lean();
  const invoices = await Invoice.find({ paymentMode: 'credit' }).lean();
  const payments = await Payment.find({}).lean();

  const report = parties.map((party: any) => {
    const partyId = party._id.toString();
    
    const totalCreditSales = invoices
      .filter((i: any) => i.partyId.toString() === partyId && i.type === 'SALES')
      .reduce((sum, i: any) => sum + (i.grandTotal || 0), 0);
      
    const totalPurchase = invoices
      .filter((i: any) => i.partyId.toString() === partyId && i.type === 'PURCHASE')
      .reduce((sum, i: any) => sum + (i.grandTotal || 0), 0);

    const totalPaidOrReceived = payments
      .filter((p: any) => p.partyId.toString() === partyId)
      .reduce((sum, p: any) => sum + (p.amount || 0), 0);

    let currentBalance = 0;
    if (party.type === 'Customer') {
      currentBalance = (party.openingBalance || 0) + totalCreditSales - totalPaidOrReceived;
    } else {
      // Supplier
      currentBalance = (party.openingBalance || 0) + totalPurchase - totalPaidOrReceived;
    }

    return {
      id: party._id,
      name: party.name,
      mobile: party.mobile,
      type: party.type,
      openingBalance: party.openingBalance,
      totalCreditSales: party.type === 'Customer' ? totalCreditSales : totalPurchase,
      totalReceived: totalPaidOrReceived,
      currentBalance
    };
  });

  return NextResponse.json(report);
}