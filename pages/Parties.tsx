
import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Modal, Select } from '../components/ui/Common';
import { Plus, Search, Edit2, Trash2, Loader2, AlertTriangle, AlertCircle, X, Phone, MapPin, IndianRupee, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Party, PartyType, Payment } from '../types';
import { api } from '../lib/api';

export const Parties = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Party>>({
    name: '', mobile: '', type: PartyType.CUSTOMER, email: '', gstNo: '', address: '', openingBalance: 0
  });

  // Payment State
  const [selectedPartyForPayment, setSelectedPartyForPayment] = useState<Party | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '', date: new Date().toISOString().split('T')[0], mode: 'cash', reference: '', notes: ''
  });

  const loadParties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.parties.list();
      setParties(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load parties.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParties();
  }, []);

  const handleEdit = (party: Party) => {
    setEditingId(party.id);
    setFormData({ ...party });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', mobile: '', type: PartyType.CUSTOMER, email: '', gstNo: '', address: '', openingBalance: 0 });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if(!formData.name || !formData.mobile) return;
    setIsLoading(true);
    setError(null);
    try {
      if (editingId) {
        await api.parties.update({ ...formData, id: editingId } as Party);
      } else {
        await api.parties.add(formData as Party);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', mobile: '', type: PartyType.CUSTOMER, email: '', gstNo: '', address: '', openingBalance: 0 });
      await loadParties();
    } catch (err: any) {
      setError(err.message || "Failed to save party.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Delete Confirmation
  const promptDelete = (id: string) => { setDeleteId(id); };

  // Execute Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setDeleteId(null);
    setIsLoading(true);
    setError(null);
    try {
      await api.parties.delete(idToDelete);
      await loadParties();
    } catch (err: any) {
      setError(err.message || "Failed to delete party.");
      setIsLoading(false);
    }
  };

  // Open Payment Modal
  const openPaymentModal = (party: Party) => {
    setSelectedPartyForPayment(party);
    setPaymentData({ amount: '', date: new Date().toISOString().split('T')[0], mode: 'cash', reference: '', notes: '' });
    setIsPaymentModalOpen(true);
  };

  // Save Payment
  const handleSavePayment = async () => {
    if(!selectedPartyForPayment || !paymentData.amount) return;
    
    setIsLoading(true);
    try {
      await api.payments.add({
        partyId: selectedPartyForPayment.id,
        amount: parseFloat(paymentData.amount),
        date: paymentData.date,
        mode: paymentData.mode,
        reference: paymentData.reference,
        notes: paymentData.notes
      });
      setIsPaymentModalOpen(false);
      // Optionally reload data
      alert("Transaction recorded successfully!");
    } catch (err: any) {
      alert("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering Logic
  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          party.mobile.includes(searchQuery);
    const matchesType = filterType === 'all' || party.type === filterType;
    return matchesSearch && matchesType;
  });

  const isSupplier = (p: Party) => p.type === PartyType.SUPPLIER;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Parties</h1>
        <Button onClick={openNewModal} icon={Plus}>Add Party</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" /><div className="flex-1"><h4 className="font-bold text-sm">Error</h4><p className="text-sm">{error}</p></div><button onClick={() => setError(null)} className="text-red-400 hover:text-red-700"><X className="h-5 w-5" /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input placeholder="Search by Name or Mobile..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <Select options={[{label: 'All Types', value: 'all'}, {label: 'Customer (Receivables)', value: PartyType.CUSTOMER}, {label: 'Supplier (Payables)', value: PartyType.SUPPLIER}]} className="w-full sm:w-48" value={filterType} onChange={(e) => setFilterType(e.target.value)} />
      </div>

      {isLoading && parties.length === 0 ? (
         <div className="text-center py-12 text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading Parties...</div>
      ) : filteredParties.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">{parties.length === 0 ? "No parties found. Add your first party." : "No matching parties found."}</div>
      ) : (
        <>
          {/* DESKTOP VIEW: TABLE */}
          <div className="hidden md:block">
            <Table headers={['Name', 'Type', 'Mobile', 'GSTIN', 'Balance', 'Action']}>
              {filteredParties.map(party => (
                <tr key={party.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{party.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${party.type === PartyType.CUSTOMER ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{party.type}</span></td>
                  <td className="px-4 py-3 text-slate-600">{party.mobile}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{party.gstNo || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-right">₹ {party.openingBalance}</td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    {isSupplier(party) ? (
                      <button onClick={() => openPaymentModal(party)} className="text-orange-600 hover:text-orange-800 p-1.5 hover:bg-orange-50 rounded-lg flex items-center gap-1 text-xs font-bold border border-orange-200">
                        <ArrowUpRight className="h-3 w-3" /> Pay
                      </button>
                    ) : (
                      <button onClick={() => openPaymentModal(party)} className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded-lg flex items-center gap-1 text-xs font-bold border border-green-200">
                        <ArrowDownLeft className="h-3 w-3" /> Collect
                      </button>
                    )}
                    <button onClick={() => handleEdit(party)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => promptDelete(party.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          {/* MOBILE VIEW: CARDS */}
          <div className="md:hidden space-y-3">
            {filteredParties.map(party => (
              <div key={party.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <div><h3 className="font-bold text-slate-900 text-lg">{party.name}</h3><div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5"><Phone className="h-3 w-3" /> {party.mobile}</div></div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${party.type === PartyType.CUSTOMER ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{party.type}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-t border-slate-50 mt-2">
                  <div className="text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {party.address || 'No Addr'}</div>
                  <div className="font-bold text-slate-800 flex items-center">Bal: <span className="text-blue-600 ml-1">₹ {party.openingBalance}</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                   {isSupplier(party) ? (
                      <Button variant="outline" size="sm" onClick={() => openPaymentModal(party)} className="text-orange-600 border-orange-200 hover:bg-orange-50 font-bold">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> Pay
                      </Button>
                   ) : (
                      <Button variant="outline" size="sm" onClick={() => openPaymentModal(party)} className="text-green-600 border-green-200 hover:bg-green-50 font-bold">
                        <ArrowDownLeft className="h-3 w-3 mr-1" /> Collect
                      </Button>
                   )}
                   <Button variant="secondary" size="sm" onClick={() => handleEdit(party)}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button>
                   <Button variant="danger" size="sm" onClick={() => promptDelete(party.id)}><Trash2 className="h-3 w-3 mr-1" /> Del</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Party" : "Add New Party"} footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Party'}</Button></>}>
        <div className="space-y-4">
          <Input label="Party Name" placeholder="Enter name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4"><Input label="Mobile Number" placeholder="10 digit mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /><Select label="Party Type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as PartyType})} options={[{label: 'Customer', value: PartyType.CUSTOMER}, {label: 'Supplier', value: PartyType.SUPPLIER}]} /></div>
          <Input label="Email Address" type="email" placeholder="Optional" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="GSTIN" placeholder="GST Number (Optional)" value={formData.gstNo} onChange={e => setFormData({...formData, gstNo: e.target.value})} />
          <Input label="Billing Address" placeholder="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <Input label="Opening Balance" type="number" placeholder="0.00" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: parseFloat(e.target.value)})} />
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" footer={<><Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="danger" onClick={confirmDelete}>Delete Party</Button></>}><div className="flex items-start gap-4"><div className="bg-red-100 p-2 rounded-full"><AlertTriangle className="h-6 w-6 text-red-600" /></div><div><h3 className="font-semibold text-slate-900">Delete this party?</h3><p className="text-sm text-slate-500 mt-1">Are you sure you want to delete this party? This action cannot be undone.</p></div></div></Modal>
      
      {/* PAYMENT MODAL */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title={selectedPartyForPayment?.type === PartyType.SUPPLIER ? "Record Payment Out" : "Receive Payment In"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePayment} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Transaction'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={`p-3 rounded-lg border ${selectedPartyForPayment?.type === PartyType.SUPPLIER ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
             <p className={`text-xs font-bold uppercase ${selectedPartyForPayment?.type === PartyType.SUPPLIER ? 'text-orange-600' : 'text-green-600'}`}>
               {selectedPartyForPayment?.type === PartyType.SUPPLIER ? 'Paying To (Supplier)' : 'Received From (Customer)'}
             </p>
             <p className="text-lg font-bold text-slate-800">{selectedPartyForPayment?.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={paymentData.date} onChange={e => setPaymentData({...paymentData, date: e.target.value})} />
            <Input label="Amount (₹)" type="number" placeholder="0.00" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
          </div>
          <Select label="Payment Mode" value={paymentData.mode} onChange={e => setPaymentData({...paymentData, mode: e.target.value})} options={[{label: 'Cash', value: 'cash'}, {label: 'Online / UPI', value: 'online'}, {label: 'Cheque', value: 'cheque'}]} />
          <Input label="Reference / Cheque No" placeholder="Optional" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
          <Input label="Notes" placeholder="Optional remarks" value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} />
        </div>
      </Modal>
    </div>
  );
};
