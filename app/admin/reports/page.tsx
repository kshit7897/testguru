'use client';
import React, { useState } from 'react';
import { Button, Table, Card, Select, Input } from '../../../components/ui/Common';
import { Download } from 'lucide-react';

const Tabs = ({ active, setActive, tabs }: any) => (
  <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto mb-6 overflow-x-auto">
    {tabs.map((tab: string) => (
      <button key={tab} onClick={() => setActive(tab)} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${active === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{tab}</button>
    ))}
  </div>
);

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Stock');
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <Button variant="outline" icon={Download}>Export PDF</Button>
      </div>
      <Tabs active={activeTab} setActive={setActiveTab} tabs={['Stock', 'Ledger', 'GST Report', 'Sales Analysis']} />
      {activeTab === 'Stock' && (
        <Card title="Stock Summary">
          <Table headers={['Item Name', 'Opening Qty', 'Inwards', 'Outwards', 'Closing Qty']}>
            <tr>
              <td className="px-4 py-3">Sample Product A</td>
              <td className="px-4 py-3">10</td>
              <td className="px-4 py-3 text-green-600">+50</td>
              <td className="px-4 py-3 text-red-600">-30</td>
              <td className="px-4 py-3 font-bold">30</td>
            </tr>
          </Table>
        </Card>
      )}
      {activeTab === 'Ledger' && (
        <div className="space-y-4">
          <div className="flex gap-4"><Select className="md:w-64" options={[{label: 'Select Party', value: ''}]} /><Input type="date" className="md:w-40" /><Input type="date" className="md:w-40" /></div>
          <Card title="Party Ledger"><Table headers={['Date', 'Ref No', 'Type', 'Credit', 'Debit', 'Balance']}><tr><td colSpan={6} className="text-center py-8 text-slate-400">Select a party to view ledger</td></tr></Table></Card>
        </div>
      )}
      {activeTab === 'GST Report' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="GSTR-1 (Sales)">
             <div className="p-4 bg-slate-50 rounded mb-4 text-center"><h3 className="text-xl font-bold text-slate-700">₹ 0.00</h3><p className="text-sm text-slate-500">Total Tax Liability</p></div>
             <Table headers={['Section', 'Taxable', 'IGST', 'CGST', 'SGST']}><tr><td className="px-4 py-2">B2B</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td className="px-4 py-2">B2C</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></Table>
          </Card>
          <Card title="GSTR-3B Summary"><div className="flex items-center justify-center h-40 text-slate-400">No data generated</div></Card>
        </div>
      )}
    </div>
  );
}
