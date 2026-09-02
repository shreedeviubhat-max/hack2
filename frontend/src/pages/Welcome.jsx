import React from 'react';
import { useNavigate } from 'react-router-dom';
// Using placeholder local path, would typically use the public folder or an import
// import welcomeImg from '../assets/shopkeeper-welcome.jpg';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <h1 className="text-5xl font-bold mb-4 text-accent-light">Your Shop Assistant</h1>
      <p className="text-lg text-text-muted mb-8 max-w-2xl">
        Manage your Customer Khaata, Supplier Ledgers, and automate your workflow with our smart tools.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <span className="px-4 py-2 rounded-full border border-accent-dark text-accent-light bg-black">#SmartKhaata</span>
        <span className="px-4 py-2 rounded-full border border-accent-dark text-accent-light bg-black">#SupplierLedger</span>
        <span className="px-4 py-2 rounded-full border border-accent-dark text-accent-light bg-black">#AIBillScanner</span>
        <span className="px-4 py-2 rounded-full border border-accent-dark text-accent-light bg-black">#ExcelExport</span>
        <span className="px-4 py-2 rounded-full border border-accent-dark text-accent-light bg-black">#SecureMERN</span>
      </div>

      <button 
        onClick={() => navigate('/auth')}
        className="px-8 py-4 bg-accent-light text-background font-bold rounded hover:bg-accent-dark transition-colors text-xl"
      >
        Enter Shopkeeper Portal →
      </button>
    </div>
  );
}
