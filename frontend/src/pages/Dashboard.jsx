import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AuthContext } from '../App';
import { API_BASE_URL } from '../config/api';
import { 
  LogOut, Plus, Download, UserCheck, Search, Phone, MapPin, 
  History, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, X, Building2, Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('borrowers'); // 'borrowers' | 'suppliers'

  // Data state
  const [borrowers, setBorrowers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddBorrower, setShowAddBorrower] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPaidModal, setShowPaidModal] = useState(null); // { type: 'borrower'|'supplier', target: object }
  const [paidAmountInput, setPaidAmountInput] = useState('');
  const [paidNotesInput, setPaidNotesInput] = useState('');

  // Add credit / invoice modals
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(null); // { type: 'credit'|'invoice', target: object }
  const [transAmount, setTransAmount] = useState('');
  const [transNotes, setTransNotes] = useState('');

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState('all'); // 'borrowers' | 'suppliers' | 'all'

  // Form states
  const [newBorrowerForm, setNewBorrowerForm] = useState({ fullName: '', phone: '', address: '', initialBorrowed: '' });
  const [newSupplierForm, setNewSupplierForm] = useState({ companyName: '', category: '', initialInvoiceNumber: '', initialAmount: '' });

  const apiBase = API_BASE_URL;

  const getAuthHeaders = () => {
    const freshToken = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': freshToken ? `Bearer ${freshToken}` : ''
    };
  };

  // Fetch Borrowers
  const fetchBorrowers = async () => {
    try {
      const res = await fetch(`${apiBase}/api/borrowers`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBorrowers(data);
        if (selectedBorrower) {
          const updated = data.find(b => b._id === selectedBorrower._id);
          if (updated) setSelectedBorrower(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching borrowers:', err);
    }
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${apiBase}/api/suppliers`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
        if (selectedSupplier) {
          const updated = data.find(s => s._id === selectedSupplier._id);
          if (updated) setSelectedSupplier(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      Promise.all([fetchBorrowers(), fetchSuppliers()]).finally(() => setLoading(false));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helper calculations for Borrower
  const getBorrowerFinancials = (borrower) => {
    if (!borrower) return { totalBorrowed: 0, totalReturned: 0, status: 'Completed', remaining: 0, extra: 0 };
    
    let totalBorrowed = 0;
    let totalReturned = 0;

    (borrower.transactions || []).forEach(tx => {
      if (tx.type === 'CREDIT') totalBorrowed += Number(tx.amount || 0);
      if (tx.type === 'PAYMENT') totalReturned += Number(tx.amount || 0);
    });

    if (totalReturned === totalBorrowed) {
      return { totalBorrowed, totalReturned, status: 'Completed', remaining: 0, extra: 0 };
    } else if (totalReturned < totalBorrowed) {
      return { totalBorrowed, totalReturned, status: 'Pending', remaining: totalBorrowed - totalReturned, extra: 0 };
    } else {
      return { totalBorrowed, totalReturned, status: 'Extra', remaining: 0, extra: totalReturned - totalBorrowed };
    }
  };

  // Helper calculations for Supplier
  const getSupplierFinancials = (supplier) => {
    if (!supplier) return { totalBilled: 0, totalPaid: 0, status: 'Completed', remaining: 0, extra: 0 };

    let totalBilled = 0;
    (supplier.invoices || []).forEach(inv => {
      totalBilled += Number(inv.amount || 0);
    });

    let totalPaid = 0;
    (supplier.payments || []).forEach(p => {
      totalPaid += Number(p.amount || 0);
    });

    if (totalPaid === totalBilled) {
      return { totalBilled, totalPaid, status: 'Completed', remaining: 0, extra: 0 };
    } else if (totalPaid < totalBilled) {
      return { totalBilled, totalPaid, status: 'Pending', remaining: totalBilled - totalPaid, extra: 0 };
    } else {
      return { totalBilled, totalPaid, status: 'Extra', remaining: 0, extra: totalPaid - totalBilled };
    }
  };

  // Filtered lists
  const filteredBorrowers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return borrowers;
    return borrowers.filter(b => 
      b.fullName?.toLowerCase().includes(q) || 
      b.phone?.includes(q) ||
      b.address?.toLowerCase().includes(q)
    );
  }, [borrowers, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return suppliers;
    return suppliers.filter(s => 
      s.companyName?.toLowerCase().includes(q) || 
      s.category?.toLowerCase().includes(q)
    );
  }, [suppliers, searchQuery]);

  // Handle Create Borrower
  const handleCreateBorrower = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/api/borrowers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newBorrowerForm)
      });
      if (res.ok) {
        setNewBorrowerForm({ fullName: '', phone: '', address: '', initialBorrowed: '' });
        setShowAddBorrower(false);
        fetchBorrowers();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create borrower');
      }
    } catch {
      alert('Error creating borrower');
    }
  };

  // Handle Create Supplier
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/api/suppliers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSupplierForm)
      });
      if (res.ok) {
        setNewSupplierForm({ companyName: '', category: '', initialInvoiceNumber: '', initialAmount: '' });
        setShowAddSupplier(false);
        fetchSuppliers();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create supplier');
      }
    } catch {
      alert('Error creating supplier');
    }
  };

  // Handle Paid Submission
  const handlePaidSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(paidAmountInput);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      if (showPaidModal.type === 'borrower') {
        const res = await fetch(`${apiBase}/api/borrowers/${showPaidModal.target._id}/payment`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ amount, notes: paidNotesInput })
        });
        if (res.ok) {
          const updated = await res.json();
          setBorrowers(prev => prev.map(b => b._id === updated._id ? updated : b));
          if (selectedBorrower?._id === updated._id) setSelectedBorrower(updated);
          setShowPaidModal(null);
          setPaidAmountInput('');
          setPaidNotesInput('');
        }
      } else {
        const res = await fetch(`${apiBase}/api/suppliers/${showPaidModal.target._id}/payment`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ amount, notes: paidNotesInput })
        });
        if (res.ok) {
          const updated = await res.json();
          setSuppliers(prev => prev.map(s => s._id === updated._id ? updated : s));
          if (selectedSupplier?._id === updated._id) setSelectedSupplier(updated);
          setShowPaidModal(null);
          setPaidAmountInput('');
          setPaidNotesInput('');
        }
      }
    } catch {
      alert('Payment submission failed');
    }
  };

  // Handle Credit / Invoice Addition
  const handleAddTransactionSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(transAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      if (showAddTransactionModal.type === 'credit') {
        const res = await fetch(`${apiBase}/api/borrowers/${showAddTransactionModal.target._id}/credit`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ amount, notes: transNotes })
        });
        if (res.ok) {
          const updated = await res.json();
          setBorrowers(prev => prev.map(b => b._id === updated._id ? updated : b));
          if (selectedBorrower?._id === updated._id) setSelectedBorrower(updated);
          setShowAddTransactionModal(null);
          setTransAmount('');
          setTransNotes('');
        }
      } else {
        const res = await fetch(`${apiBase}/api/suppliers/${showAddTransactionModal.target._id}/invoices`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ amount, invoiceNumber: transNotes })
        });
        if (res.ok) {
          const updated = await res.json();
          setSuppliers(prev => prev.map(s => s._id === updated._id ? updated : s));
          if (selectedSupplier?._id === updated._id) setSelectedSupplier(updated);
          setShowAddTransactionModal(null);
          setTransAmount('');
          setTransNotes('');
        }
      }
    } catch {
      alert('Transaction failed');
    }
  };

  // Professional Export feature (CSV Excel download with selectable scope)
  const triggerExport = () => {
    const rows = [];
    const dateStr = new Date().toLocaleDateString('en-GB');

    if (exportScope === 'borrowers' || exportScope === 'all') {
      rows.push(['--- BORROWER KHAATA LEDGER REPORT ---']);
      rows.push(['Report Date', dateStr]);
      rows.push(['Shop Name', user?.shopName || 'Shop']);
      rows.push([]);
      rows.push([
        'Borrower Name',
        'Phone Number',
        'Address',
        'Total Borrowed (Rs.)',
        'Total Returned (Rs.)',
        'Financial Status',
        'Remaining Balance (Rs.)',
        'Eligible Extra Shopping (Rs.)',
        'Preserved Transactions Count'
      ]);

      borrowers.forEach(b => {
        const fin = getBorrowerFinancials(b);
        let statusText = 'Completed';
        if (fin.status === 'Pending') statusText = `Pending: Rs. ${fin.remaining}`;
        if (fin.status === 'Extra') statusText = `Extra Advance: Rs. ${fin.extra}`;

        rows.push([
          `"${(b.fullName || '').replace(/"/g, '""')}"`,
          `"${(b.phone || '').replace(/"/g, '""')}"`,
          `"${(b.address || '').replace(/"/g, '""')}"`,
          fin.totalBorrowed,
          fin.totalReturned,
          `"${statusText}"`,
          fin.remaining,
          fin.extra,
          (b.transactions || []).length
        ]);
      });
      rows.push([]);
      rows.push([]);
    }

    if (exportScope === 'suppliers' || exportScope === 'all') {
      rows.push(['--- SUPPLIER PROCUREMENT & PAYMENT REPORT ---']);
      rows.push(['Report Date', dateStr]);
      rows.push(['Shop Name', user?.shopName || 'Shop']);
      rows.push([]);
      rows.push([
        'Supplier / Company Name',
        'Category / Product Line',
        'Total Invoiced (Rs.)',
        'Total Paid (Rs.)',
        'Payment Status',
        'Remaining Payable (Rs.)',
        'Advance / Extra Paid (Rs.)',
        'Preserved Invoices Count',
        'Preserved Payments Count'
      ]);

      suppliers.forEach(s => {
        const fin = getSupplierFinancials(s);
        let statusText = 'Completed';
        if (fin.status === 'Pending') statusText = `Pending Due: Rs. ${fin.remaining}`;
        if (fin.status === 'Extra') statusText = `Advance Paid: Rs. ${fin.extra}`;

        rows.push([
          `"${(s.companyName || '').replace(/"/g, '""')}"`,
          `"${(s.category || '').replace(/"/g, '""')}"`,
          fin.totalBilled,
          fin.totalPaid,
          `"${statusText}"`,
          fin.remaining,
          fin.extra,
          (s.invoices || []).length,
          (s.payments || []).length
        ]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `Shop_Ledger_Export_${exportScope}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#121214] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-light/10 border border-accent-light/30 flex items-center justify-center text-accent-light font-bold text-xl">
            {user?.shopName?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-accent-light leading-tight">{user?.shopName}</h1>
            <p className="text-xs text-text-muted">Owner: {user?.ownerFullName} ({user?.phoneNumber})</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={() => setShowAddBorrower(true)} 
            className="flex items-center gap-2 px-3.5 py-2 bg-accent-light text-black hover:bg-accent-dark font-semibold rounded-lg transition-colors text-sm shadow"
          >
            <Plus size={16} /> Add Borrower
          </button>
          <button 
            onClick={() => setShowAddSupplier(true)} 
            className="flex items-center gap-2 px-3.5 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg transition-colors text-sm"
          >
            <Plus size={16} /> Add Supplier
          </button>
          <button 
            onClick={() => setShowExportModal(true)} 
            className="flex items-center gap-2 px-3.5 py-2 border border-accent-light/40 text-accent-light hover:bg-accent-light/10 rounded-lg transition-colors text-sm"
          >
            <Download size={16} /> Export Data
          </button>
          <button 
            onClick={handleLogout} 
            title="Logout" 
            className="flex items-center justify-center p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm border border-red-500/20"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Navigation Tabs and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#27272a]">
          <div className="flex gap-2 bg-[#121214] p-1.5 rounded-xl border border-[#27272a] self-start">
            <button
              onClick={() => { setActiveTab('borrowers'); setSelectedBorrower(null); }}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'borrowers' 
                  ? 'bg-accent-light text-black shadow' 
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Borrower Khaata ({borrowers.length})
            </button>
            <button
              onClick={() => { setActiveTab('suppliers'); setSelectedSupplier(null); }}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'suppliers' 
                  ? 'bg-accent-light text-black shadow' 
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Supplier Ledgers ({suppliers.length})
            </button>
          </div>

          {/* Dynamic Search Bar */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={activeTab === 'borrowers' ? "Search borrowers by name, phone..." : "Search suppliers by company, category..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#121214] border border-[#27272a] rounded-xl focus:outline-none focus:border-accent-light text-sm text-white placeholder-text-muted transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* BORROWER TAB CONTENT */}
        {activeTab === 'borrowers' && (
          <div>
            {filteredBorrowers.length === 0 ? (
              <div className="border border-dashed border-[#27272a] rounded-2xl p-12 flex flex-col items-center justify-center text-center text-text-muted bg-[#121214]/50">
                <UserCheck size={48} className="mb-4 text-accent-light opacity-60" />
                <h3 className="text-lg font-bold text-white mb-1">No Borrowers Found</h3>
                <p className="text-sm text-text-muted mb-6">
                  {searchQuery ? 'No borrower matches your search query.' : 'Add your first borrower profile to start tracking credit and repayments.'}
                </p>
                <button
                  onClick={() => setShowAddBorrower(true)}
                  className="px-4 py-2.5 bg-accent-light text-black font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm flex items-center gap-2"
                >
                  <Plus size={16} /> Add Borrower Profile
                </button>
              </div>
            ) : (
              /* Display borrower profiles in square cards/boxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBorrowers.map((borrower) => {
                  const fin = getBorrowerFinancials(borrower);
                  return (
                    <div
                      key={borrower._id}
                      className="bg-[#121214] border border-[#27272a] hover:border-accent-light/50 transition-all rounded-2xl p-5 flex flex-col justify-between aspect-square shadow-lg group relative overflow-hidden"
                    >
                      {/* Top Bar of Square Box */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-white truncate" title={borrower.fullName}>
                                {borrower.fullName}
                              </h3>
                              {/* If returned == borrowed, display 'Completed' after their name */}
                              {fin.status === 'Completed' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 size={12} /> Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                              <Phone size={12} /> {borrower.phone}
                            </p>
                            {borrower.address && (
                              <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5 truncate">
                                <MapPin size={12} /> {borrower.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Financial summary calculations */}
                        <div className="mt-4 p-3 bg-black/60 rounded-xl border border-[#27272a] space-y-1.5 text-xs">
                          <div className="flex justify-between text-text-muted">
                            <span>Borrowed:</span>
                            <span className="font-medium text-white">₹{fin.totalBorrowed.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-text-muted">
                            <span>Returned:</span>
                            <span className="font-medium text-emerald-400">₹{fin.totalReturned.toLocaleString('en-IN')}</span>
                          </div>
                          
                          {/* If returned < borrowed, calculate Remaining = Borrowed - Returned */}
                          {fin.status === 'Pending' && (
                            <div className="pt-1.5 border-t border-[#27272a] flex justify-between font-semibold text-amber-400">
                              <span>Remaining:</span>
                              <span>₹{fin.remaining.toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {/* If returned == borrowed, display Completed */}
                          {fin.status === 'Completed' && (
                            <div className="pt-1.5 border-t border-[#27272a] flex justify-between font-semibold text-emerald-400">
                              <span>Balance:</span>
                              <span>₹0 (Completed)</span>
                            </div>
                          )}
                        </div>

                        {/* If returned > borrowed: 'He can borrow ₹X amount of product in your shop.' */}
                        {fin.status === 'Extra' && (
                          <div className="mt-2.5 p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-1.5">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span>
                              He can borrow <strong>₹{fin.extra.toLocaleString('en-IN')}</strong> amount of product in your shop.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons inside square card */}
                      <div className="mt-3 pt-3 border-t border-[#27272a] flex items-center gap-2">
                        {/* 'Paid' button inside borrower profile */}
                        <button
                          onClick={() => {
                            setShowPaidModal({ type: 'borrower', target: borrower });
                            setPaidAmountInput('');
                            setPaidNotesInput('');
                          }}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow"
                        >
                          <ArrowDownLeft size={14} /> Paid
                        </button>

                        <button
                          onClick={() => {
                            setShowAddTransactionModal({ type: 'credit', target: borrower });
                            setTransAmount('');
                            setTransNotes('');
                          }}
                          className="py-2 px-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                          title="Give More Credit"
                        >
                          <ArrowUpRight size={14} /> +Credit
                        </button>

                        <button
                          onClick={() => setSelectedBorrower(borrower)}
                          className="py-2 px-2.5 bg-[#27272a] hover:bg-accent-light hover:text-black text-text-muted rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                          title="View Full Profile & Preserved History"
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUPPLIER TAB CONTENT */}
        {activeTab === 'suppliers' && (
          <div>
            {filteredSuppliers.length === 0 ? (
              <div className="border border-dashed border-[#27272a] rounded-2xl p-12 flex flex-col items-center justify-center text-center text-text-muted bg-[#121214]/50">
                <Building2 size={48} className="mb-4 text-accent-light opacity-60" />
                <h3 className="text-lg font-bold text-white mb-1">No Suppliers Found</h3>
                <p className="text-sm text-text-muted mb-6">
                  {searchQuery ? 'No supplier matches your search query.' : 'Add your first supplier ledger to track purchase invoices and payments.'}
                </p>
                <button
                  onClick={() => setShowAddSupplier(true)}
                  className="px-4 py-2.5 bg-accent-light text-black font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm flex items-center gap-2"
                >
                  <Plus size={16} /> Add Supplier Profile
                </button>
              </div>
            ) : (
              /* Display supplier profiles in square cards/boxes */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredSuppliers.map((supplier) => {
                  const fin = getSupplierFinancials(supplier);
                  return (
                    <div
                      key={supplier._id}
                      className="bg-[#121214] border border-[#27272a] hover:border-accent-light/50 transition-all rounded-2xl p-5 flex flex-col justify-between aspect-square shadow-lg group relative overflow-hidden"
                    >
                      {/* Top section of square box */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-white truncate" title={supplier.companyName}>
                                {supplier.companyName}
                              </h3>
                              {/* If paid == billed, display 'Completed' after supplier name */}
                              {fin.status === 'Completed' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 size={12} /> Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                              <Building2 size={12} /> {supplier.category || 'General Wholesale'}
                            </p>
                          </div>
                        </div>

                        {/* Financial summary calculations */}
                        <div className="mt-4 p-3 bg-black/60 rounded-xl border border-[#27272a] space-y-1.5 text-xs">
                          <div className="flex justify-between text-text-muted">
                            <span>Total Invoices:</span>
                            <span className="font-medium text-white">₹{fin.totalBilled.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-text-muted">
                            <span>Total Paid:</span>
                            <span className="font-medium text-emerald-400">₹{fin.totalPaid.toLocaleString('en-IN')}</span>
                          </div>
                          
                          {/* If paid < billed, calculate Remaining = Billed - Paid */}
                          {fin.status === 'Pending' && (
                            <div className="pt-1.5 border-t border-[#27272a] flex justify-between font-semibold text-amber-400">
                              <span>Remaining Due:</span>
                              <span>₹{fin.remaining.toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {/* If paid == billed, Completed */}
                          {fin.status === 'Completed' && (
                            <div className="pt-1.5 border-t border-[#27272a] flex justify-between font-semibold text-emerald-400">
                              <span>Balance:</span>
                              <span>₹0 (Completed)</span>
                            </div>
                          )}
                        </div>

                        {/* If paid > billed: Extra advance paid */}
                        {fin.status === 'Extra' && (
                          <div className="mt-2.5 p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-1.5">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span>
                              Advance paid: You have <strong>₹{fin.extra.toLocaleString('en-IN')}</strong> credit with this supplier.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons inside square card */}
                      <div className="mt-3 pt-3 border-t border-[#27272a] flex items-center gap-2">
                        {/* 'Paid' button inside supplier profile view */}
                        <button
                          onClick={() => {
                            setShowPaidModal({ type: 'supplier', target: supplier });
                            setPaidAmountInput('');
                            setPaidNotesInput('');
                          }}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow"
                        >
                          <ArrowDownLeft size={14} /> Paid
                        </button>

                        <button
                          onClick={() => {
                            setShowAddTransactionModal({ type: 'invoice', target: supplier });
                            setTransAmount('');
                            setTransNotes('');
                          }}
                          className="py-2 px-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                          title="Add New Bill/Invoice"
                        >
                          <ArrowUpRight size={14} /> +Bill
                        </button>

                        <button
                          onClick={() => setSelectedSupplier(supplier)}
                          className="py-2 px-2.5 bg-[#27272a] hover:bg-accent-light hover:text-black text-text-muted rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                          title="View Ledger & Invoices"
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: 'PAID' PROMPT ("How much money did he return?") */}
      {showPaidModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPaidModal(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ArrowDownLeft size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Record Payment</h3>
                <p className="text-xs text-text-muted">
                  {showPaidModal.type === 'borrower' 
                    ? `Borrower: ${showPaidModal.target.fullName}` 
                    : `Supplier: ${showPaidModal.target.companyName}`}
                </p>
              </div>
            </div>

            <form onSubmit={handlePaidSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                  {showPaidModal.type === 'borrower'
                    ? "How much money did he return? (₹)"
                    : "How much money did you pay to supplier? (₹)"}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  autoFocus
                  placeholder="e.g. 500"
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-xl text-white font-semibold text-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Payment Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cash, UPI, Google Pay"
                  value={paidNotesInput}
                  onChange={(e) => setPaidNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaidModal(null)}
                  className="flex-1 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CREDIT / BILL */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddTransactionModal(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-accent-light/10 border border-accent-light/20 text-accent-light">
                <ArrowUpRight size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {showAddTransactionModal.type === 'credit' ? 'Add Borrowed Amount' : 'Add Supplier Bill / Invoice'}
                </h3>
                <p className="text-xs text-text-muted">
                  {showAddTransactionModal.type === 'credit'
                    ? `Borrower: ${showAddTransactionModal.target.fullName}`
                    : `Supplier: ${showAddTransactionModal.target.companyName}`}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                  {showAddTransactionModal.type === 'credit' ? 'Items Taken / Credit Amount (₹)' : 'Invoice Bill Amount (₹)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  autoFocus
                  placeholder="e.g. 1200"
                  value={transAmount}
                  onChange={(e) => setTransAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-xl text-white font-semibold text-lg focus:outline-none focus:border-accent-light"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  {showAddTransactionModal.type === 'credit' ? 'Item list or Remarks (Optional)' : 'Invoice / Bill Reference # (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={showAddTransactionModal.type === 'credit' ? 'e.g. Rice 5kg, Oil 2L' : 'e.g. INV-90482'}
                  value={transNotes}
                  onChange={(e) => setTransNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTransactionModal(null)}
                  className="flex-1 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-accent-light text-black font-bold rounded-xl text-sm hover:bg-accent-dark transition-colors shadow"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW BORROWER */}
      {showAddBorrower && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddBorrower(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Add New Borrower</h3>
            <p className="text-xs text-text-muted mb-6">Create a borrower profile to record their credit and payments.</p>

            <form onSubmit={handleCreateBorrower} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Borrower Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={newBorrowerForm.fullName}
                  onChange={(e) => setNewBorrowerForm({ ...newBorrowerForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newBorrowerForm.phone}
                  onChange={(e) => setNewBorrowerForm({ ...newBorrowerForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Address / Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Main Market Temple"
                  value={newBorrowerForm.address}
                  onChange={(e) => setNewBorrowerForm({ ...newBorrowerForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Initial Borrowed Amount (₹, Optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newBorrowerForm.initialBorrowed}
                  onChange={(e) => setNewBorrowerForm({ ...newBorrowerForm, initialBorrowed: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBorrower(false)}
                  className="flex-1 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-accent-light text-black font-bold rounded-xl text-sm hover:bg-accent-dark transition-colors shadow"
                >
                  Create Borrower Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SUPPLIER */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddSupplier(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Add New Supplier</h3>
            <p className="text-xs text-text-muted mb-6">Create a supplier profile to track goods procured and payments made.</p>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Supplier / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahaveer FMCG Distributors"
                  value={newSupplierForm.companyName}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Category / Product Line</label>
                <input
                  type="text"
                  placeholder="e.g. Grains, Dairy, Beverages"
                  value={newSupplierForm.category}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Initial Bill # (Optional)</label>
                  <input
                    type="text"
                    placeholder="INV-001"
                    value={newSupplierForm.initialInvoiceNumber}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, initialInvoiceNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Bill Amount (₹, Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newSupplierForm.initialAmount}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, initialAmount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-accent-light"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-accent-light text-black font-bold rounded-xl text-sm hover:bg-accent-dark transition-colors shadow"
                >
                  Create Supplier Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW BORROWER PROFILE & FULL PRESERVED TRANSACTION HISTORY */}
      {selectedBorrower && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#27272a] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">{selectedBorrower.fullName}</h3>
                  {getBorrowerFinancials(selectedBorrower).status === 'Completed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted mt-1.5">
                  <span className="flex items-center gap-1"><Phone size={12} /> {selectedBorrower.phone}</span>
                  {selectedBorrower.address && (
                    <span className="flex items-center gap-1"><MapPin size={12} /> {selectedBorrower.address}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedBorrower(null)}
                className="text-text-muted hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* Financial Status Banner */}
            {(() => {
              const fin = getBorrowerFinancials(selectedBorrower);
              return (
                <div className="px-6 py-4 bg-black/40 border-b border-[#27272a]">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[#121214] rounded-xl border border-[#27272a]">
                      <div className="text-xs text-text-muted mb-1">Total Borrowed</div>
                      <div className="text-lg font-bold text-white">₹{fin.totalBorrowed.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-3 bg-[#121214] rounded-xl border border-[#27272a]">
                      <div className="text-xs text-text-muted mb-1">Total Returned</div>
                      <div className="text-lg font-bold text-emerald-400">₹{fin.totalReturned.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-3 bg-[#121214] rounded-xl border border-[#27272a]">
                      <div className="text-xs text-text-muted mb-1">Net Balance</div>
                      <div className={`text-lg font-bold ${fin.status === 'Pending' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {fin.status === 'Pending' ? `₹${fin.remaining.toLocaleString('en-IN')}` : '₹0'}
                      </div>
                    </div>
                  </div>

                  {fin.status === 'Extra' && (
                    <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>He can borrow <strong>₹{fin.extra.toLocaleString('en-IN')}</strong> amount of product in your shop.</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Preserved Transaction History List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                  <History size={16} /> Preserved Transaction History ({selectedBorrower.transactions?.length || 0})
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPaidModal({ type: 'borrower', target: selectedBorrower });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <ArrowDownLeft size={13} /> Paid
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTransactionModal({ type: 'credit', target: selectedBorrower });
                    }}
                    className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg font-medium text-xs flex items-center gap-1"
                  >
                    <ArrowUpRight size={13} /> +Credit
                  </button>
                </div>
              </div>

              {(!selectedBorrower.transactions || selectedBorrower.transactions.length === 0) ? (
                <p className="text-sm text-text-muted text-center py-8">No transaction records found.</p>
              ) : (
                <div className="space-y-2.5">
                  {[...selectedBorrower.transactions].reverse().map((tx, idx) => {
                    const isCredit = tx.type === 'CREDIT';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-black/50 border border-[#27272a] rounded-xl flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isCredit ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {isCredit ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {isCredit ? 'Credit / Borrowed' : 'Payment Returned'}
                            </div>
                            <div className="text-xs text-text-muted flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {new Date(tx.date).toLocaleDateString()}
                              </span>
                              {tx.notes && <span>• {tx.notes}</span>}
                            </div>
                          </div>
                        </div>

                        <div className={`font-bold text-base ${isCredit ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {isCredit ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW SUPPLIER PROFILE & FULL PRESERVED INVOICES/PAYMENTS */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#27272a] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">{selectedSupplier.companyName}</h3>
                  {getSupplierFinancials(selectedSupplier).status === 'Completed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                  <Building2 size={12} /> {selectedSupplier.category || 'General Procurement'}
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-text-muted hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* Financial Status Banner */}
            {(() => {
              const fin = getSupplierFinancials(selectedSupplier);
              return (
                <div className="px-6 py-4 bg-black/40 border-b border-[#27272a]">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[#121214] rounded-xl border border-[#27272a]">
                      <div className="text-xs text-text-muted mb-1">Total Invoiced</div>
                      <div className="text-lg font-bold text-white">₹{fin.totalBilled.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-3 bg-[#121214] rounded-xl border border-[#27272a]">
                      <div className="text-xs text-text-muted mb-1">Total Paid</div>
                      <div className="text-lg font-bold text-emerald-400">₹{fin.totalPaid.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-3 bg-[#121214] rounded-xl border border-[#27272a]">
                      <div className="text-xs text-text-muted mb-1">Remaining Due</div>
                      <div className={`text-lg font-bold ${fin.status === 'Pending' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {fin.status === 'Pending' ? `₹${fin.remaining.toLocaleString('en-IN')}` : '₹0'}
                      </div>
                    </div>
                  </div>

                  {fin.status === 'Extra' && (
                    <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>Advance credit of <strong>₹{fin.extra.toLocaleString('en-IN')}</strong> recorded with supplier.</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Invoices & Payment Logs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                    Invoices & Bills ({selectedSupplier.invoices?.length || 0})
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddTransactionModal({ type: 'invoice', target: selectedSupplier });
                    }}
                    className="px-3 py-1 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg font-medium text-xs flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Invoice
                  </button>
                </div>

                <div className="space-y-2">
                  {[...(selectedSupplier.invoices || [])].reverse().map((inv, idx) => (
                    <div key={idx} className="p-3 bg-black/50 border border-[#27272a] rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">Bill #: {inv.invoiceNumber}</div>
                        <div className="text-text-muted flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> {new Date(inv.invoiceDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-bold text-sm text-white">₹{inv.amount.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                    Payment History ({selectedSupplier.payments?.length || 0})
                  </h4>
                  <button
                    onClick={() => {
                      setShowPaidModal({ type: 'supplier', target: selectedSupplier });
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <ArrowDownLeft size={13} /> Paid
                  </button>
                </div>

                <div className="space-y-2">
                  {[...(selectedSupplier.payments || [])].reverse().map((p, idx) => (
                    <div key={idx} className="p-3 bg-black/50 border border-[#27272a] rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-emerald-400">Payment Paid</div>
                        <div className="text-text-muted flex items-center gap-2 mt-0.5">
                          <span>{new Date(p.date).toLocaleDateString()}</span>
                          {p.notes && <span>• {p.notes}</span>}
                        </div>
                      </div>
                      <div className="font-bold text-sm text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT DATA TO EXCEL / CSV (Select Specific Data) */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-accent-light/10 border border-accent-light/20 text-accent-light">
                <Download size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Export to Excel (CSV)</h3>
                <p className="text-xs text-text-muted">Select specific dataset to download with structured headings.</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-text-muted uppercase">Select Data to Export:</label>
              
              <div 
                onClick={() => setExportScope('borrowers')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  exportScope === 'borrowers' ? 'bg-accent-light/10 border-accent-light text-white' : 'bg-black/50 border-[#27272a] text-text-muted hover:border-[#3f3f46]'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-white">Borrower Khaata Only</div>
                  <div className="text-xs text-text-muted">Customer/Borrower profiles, balances, extra credits, returned amounts ({borrowers.length} records)</div>
                </div>
                <input type="radio" checked={exportScope === 'borrowers'} readOnly className="accent-yellow-400" />
              </div>

              <div 
                onClick={() => setExportScope('suppliers')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  exportScope === 'suppliers' ? 'bg-accent-light/10 border-accent-light text-white' : 'bg-black/50 border-[#27272a] text-text-muted hover:border-[#3f3f46]'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-white">Supplier Ledgers Only</div>
                  <div className="text-xs text-text-muted">Vendor procurement invoices, total payments, due balances ({suppliers.length} records)</div>
                </div>
                <input type="radio" checked={exportScope === 'suppliers'} readOnly className="accent-yellow-400" />
              </div>

              <div 
                onClick={() => setExportScope('all')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  exportScope === 'all' ? 'bg-accent-light/10 border-accent-light text-white' : 'bg-black/50 border-[#27272a] text-text-muted hover:border-[#3f3f46]'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-white">Complete Shop Ledger (All Data)</div>
                  <div className="text-xs text-text-muted">Consolidated reports for both Borrowers and Suppliers</div>
                </div>
                <input type="radio" checked={exportScope === 'all'} readOnly className="accent-yellow-400" />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={triggerExport}
                className="flex-1 py-3 bg-accent-light text-black font-bold rounded-xl text-sm hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 shadow"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
