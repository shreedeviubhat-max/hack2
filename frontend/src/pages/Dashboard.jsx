import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { LogOut, Plus, Download, UserPlus } from 'lucide-react';

export default function Dashboard() {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('borrowers');

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#121214] p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-accent-light">{user?.shopName}</h1>
          <p className="text-sm text-text-muted">{user?.ownerFullName}</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors text-sm">
            <Plus size={16} /> Borrower
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors text-sm">
            <Plus size={16} /> Supplier
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#27272a] text-accent-light hover:bg-[#27272a] rounded transition-colors text-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded transition-colors text-sm ml-2">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12">
        <div className="flex gap-4 mb-8 border-b border-[#27272a]">
          <button
            onClick={() => setActiveTab('borrowers')}
            className={`pb-4 text-lg font-medium transition-colors ${activeTab === 'borrowers' ? 'text-accent-light border-b-2 border-accent-light' : 'text-text-muted hover:text-white'}`}
          >
            Customer Khaata
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-4 text-lg font-medium transition-colors ${activeTab === 'suppliers' ? 'text-accent-light border-b-2 border-accent-light' : 'text-text-muted hover:text-white'}`}
          >
            Supplier Ledgers
          </button>
        </div>

        {activeTab === 'borrowers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Empty State Mock */}
            <div className="border border-dashed border-[#27272a] rounded-xl p-8 flex flex-col items-center justify-center text-center text-text-muted">
              <UserPlus size={48} className="mb-4 opacity-50" />
              <p>No customers added yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Empty State Mock */}
            <div className="border border-dashed border-[#27272a] rounded-xl p-8 flex flex-col items-center justify-center text-center text-text-muted">
              <Plus size={48} className="mb-4 opacity-50" />
              <p>No suppliers added yet.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
