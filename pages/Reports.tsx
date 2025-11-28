
import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Select, Input } from '../components/ui/Common';
import { Download, Loader2, ArrowRight, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { Party, Item, PartyType } from '../types';

const Tabs = ({ active, setActive, tabs }: any) => (
  <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto mb-6 overflow-x-auto no-scrollbar">
    {tabs.map((tab: string) => (
      <button
        key={tab}
        onClick={() => setActive(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all flex-1 md:flex-none text-center ${
          active === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('Stock');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Data States
  const [stockData, setStockData] = useState<any[]>([]);
  const [outstandingData, setOutstandingData] = useState<any[]>([]);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [parties, setParties] = useState<Party[]>([]);

  // Filters
  const [ledgerFilter, setLedgerFilter] = useState({
    partyId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Load Parties for Dropdown
    api.parties.list().then(setParties);
  }, []);

  useEffect(() => {
    loadTabContent();
  }, [activeTab]);

  const loadTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Stock') {
        const data = await api.reports.getStock();
        setStockData(data);
      } else if (activeTab === 'Outstanding') {
        const data = await api.reports.getOutstanding();
        setOutstandingData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLedger = async () => {
    if (!ledgerFilter.partyId) return;
    setLoading(true);
    try {
      const data = await api.reports.getLedger(ledgerFilter.partyId, ledgerFilter.startDate, ledgerFilter.endDate);
      setLedgerData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    setIsExporting(true);
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
       alert("PDF generator not loaded");
       setIsExporting(false);
       return;
    }
    const opt = {
      margin: 10,
      filename: `${activeTab}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => setIsExporting(false));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Business Reports</h1>
           <p className="text-sm text-slate-500">Track your stock, outstanding payments, and ledger.</p>
        </div>
        <Button 
          variant="outline" 
          icon={isExporting ? Loader2 : Download} 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
      </div>

      <Tabs 
        active={activeTab} 
        setActive={setActiveTab} 
        tabs={['Stock', 'Outstanding', 'Ledger']} 
      />

      <div id="report-content" className="bg-white p-2 rounded-xl">
        {activeTab === 'Stock' && (
          <Card className="border-0 shadow-none">
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Stock Summary</h3>
            {loading ? (
               <div className="p-10 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading Stock...</div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden md:block">
                  <Table headers={['Item Name', 'Unit', 'Purchase Rate', 'Current Stock', 'Stock Value']}>
                    {stockData.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                        <td className="px-4 py-3 text-right">₹ {item.purchaseRate}</td>
                        <td className="px-4 py-3 text-right font-bold">{item.stock}</td>
                        <td className="px-4 py-3 text-right text-blue-600 font-semibold">₹ {item.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </Table>
                </div>
                
                {/* MOBILE CARDS */}
                <div className="md:hidden space-y-3">
                   {stockData.map((item: any) => (
                     <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-slate-800">{item.name}</h4>
                           <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">{item.stock} {item.unit}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                           <div>
                             <p className="text-xs text-slate-500">Purchase Rate</p>
                             <p className="font-medium">₹ {item.purchaseRate}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs text-slate-500">Total Value</p>
                             <p className="font-bold text-slate-900">₹ {item.value.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </>
            )}
          </Card>
        )}

        {activeTab === 'Outstanding' && (
          <Card className="border-0 shadow-none">
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Outstanding Payments</h3>
            {loading ? (
               <div className="p-10 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Calculating Balances...</div>
            ) : outstandingData.length === 0 ? (
               <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed">No outstanding payments. Good job!</div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden md:block">
                  <Table headers={['Party Name', 'Type', 'Mobile', 'Opening', 'Bill Amount', 'Paid', 'Net Pending']}>
                    {outstandingData.map((row: any) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded ${row.type === PartyType.SUPPLIER ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{row.type === PartyType.SUPPLIER ? 'Supplier' : 'Customer'}</span></td>
                        <td className="px-4 py-3 text-slate-500">{row.mobile}</td>
                        <td className="px-4 py-3 text-right text-slate-400">₹ {row.openingBalance}</td>
                        <td className="px-4 py-3 text-right text-slate-600">₹ {row.totalCreditSales}</td>
                        <td className="px-4 py-3 text-right text-slate-500">₹ {row.totalReceived}</td>
                        <td className={`px-4 py-3 text-right font-bold ${row.type === PartyType.SUPPLIER ? 'text-orange-600' : 'text-green-600'}`}>
                           {row.type === PartyType.SUPPLIER ? 'Pay: ' : 'Receive: '}
                           ₹ {row.currentBalance}
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden space-y-3">
                   {outstandingData.map((row: any) => (
                     <div key={row.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start">
                           <div>
                             <h4 className="font-bold text-slate-800 text-lg">{row.name}</h4>
                             <p className="text-xs text-slate-500">{row.mobile}</p>
                           </div>
                           <div className="text-right">
                             <p className={`text-xs uppercase font-bold ${row.type === PartyType.SUPPLIER ? 'text-orange-500' : 'text-green-500'}`}>
                                {row.type === PartyType.SUPPLIER ? 'To Pay' : 'To Receive'}
                             </p>
                             <p className={`text-xl font-bold ${row.type === PartyType.SUPPLIER ? 'text-orange-600' : 'text-green-600'}`}>
                               ₹ {row.currentBalance}
                             </p>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs">
                           <div className="text-center">
                             <p className="text-slate-400">Opening</p>
                             <p className="font-medium">₹ {row.openingBalance}</p>
                           </div>
                           <div className="text-center border-l border-slate-200">
                             <p className="text-slate-400">Billed</p>
                             <p className="font-medium">₹ {row.totalCreditSales}</p>
                           </div>
                           <div className="text-center border-l border-slate-200">
                             <p className="text-slate-400">Paid/Recvd</p>
                             <p className="font-medium text-slate-600">₹ {row.totalReceived}</p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </>
            )}
          </Card>
        )}

        {activeTab === 'Ledger' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
              <Select 
                label="Select Party"
                className="w-full md:w-64" 
                options={[{label: 'Select Party...', value: ''}, ...parties.map(p => ({label: p.name, value: p.id}))]} 
                value={ledgerFilter.partyId}
                onChange={(e) => setLedgerFilter({...ledgerFilter, partyId: e.target.value})}
              />
              <Input 
                label="From Date"
                type="date" 
                className="w-full md:w-40" 
                value={ledgerFilter.startDate}
                onChange={(e) => setLedgerFilter({...ledgerFilter, startDate: e.target.value})}
              />
              <Input 
                label="To Date"
                type="date" 
                className="w-full md:w-40" 
                value={ledgerFilter.endDate}
                onChange={(e) => setLedgerFilter({...ledgerFilter, endDate: e.target.value})}
              />
              <Button onClick={loadLedger} disabled={!ledgerFilter.partyId} className="w-full md:w-auto">
                {loading ? 'Loading...' : 'Get Ledger'}
              </Button>
            </div>

            <Card className="border-0 shadow-none min-h-[300px]">
               <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Detailed Ledger</h3>
               {!ledgerFilter.partyId ? (
                 <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <FileText className="h-12 w-12 opacity-20 mb-2" />
                    <p>Select a party to view their transaction history</p>
                 </div>
               ) : loading ? (
                 <div className="p-10 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Fetching Records...</div>
               ) : ledgerData.length === 0 ? (
                 <div className="p-10 text-center text-slate-500 border-2 border-dashed rounded-xl">No transactions found for this period.</div>
               ) : (
                 <>
                   {/* DESKTOP TABLE */}
                   <div className="hidden md:block">
                     <Table headers={['Date', 'Ref No', 'Description', 'Debit (Out)', 'Credit (In)', 'Balance']}>
                       {ledgerData.map((tx: any, i) => (
                         <tr key={i} className="hover:bg-slate-50">
                           <td className="px-4 py-3 text-slate-600">{tx.date}</td>
                           <td className="px-4 py-3 text-slate-500 text-xs font-mono">{tx.ref}</td>
                           <td className="px-4 py-3 font-medium text-slate-800">
                             <div className="flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${tx.type === 'PAYMENT' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                               {tx.desc}
                             </div>
                           </td>
                           <td className="px-4 py-3 text-right text-slate-600">{tx.debit > 0 ? `₹ ${tx.debit}` : '-'}</td>
                           <td className="px-4 py-3 text-right text-green-600">{tx.credit > 0 ? `₹ ${tx.credit}` : '-'}</td>
                           <td className="px-4 py-3 text-right font-bold text-slate-900">₹ {tx.balance}</td>
                         </tr>
                       ))}
                     </Table>
                   </div>

                   {/* MOBILE TIMELINE */}
                   <div className="md:hidden space-y-4 px-2">
                      {ledgerData.map((tx: any, i) => (
                        <div key={i} className="relative pl-6 border-l-2 border-slate-200 pb-4 last:pb-0 last:border-0">
                           <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${tx.type === 'PAYMENT' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                           <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                 <span className="text-xs font-bold text-slate-400">{tx.date}</span>
                                 <span className="text-xs font-mono text-slate-400">{tx.ref}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm mb-2">{tx.desc}</h4>
                              <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2">
                                 <div>
                                   {tx.debit > 0 && <span className="text-red-500 font-medium">Dr: ₹ {tx.debit}</span>}
                                   {tx.credit > 0 && <span className="text-green-600 font-medium">Cr: ₹ {tx.credit}</span>}
                                 </div>
                                 <div className="font-bold text-slate-900">Bal: ₹ {tx.balance}</div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 </>
               )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
