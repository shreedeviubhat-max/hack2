import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { setUser } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login for now
    setUser({ id: '1', shopName: 'My Kirana', ownerFullName: 'Rahul Kumar' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-[#121214] rounded-xl overflow-hidden shadow-2xl border border-[#27272a]">
        
        {/* Left Media Card Placeholder */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-8 border-r border-[#27272a]">
           <div className="text-center">
             <h2 className="text-2xl font-bold text-accent-light mb-2">Welcome Back!</h2>
             <p className="text-text-muted">Manage your khaata digitally.</p>
           </div>
        </div>

        {/* Right Form Card */}
        <div className="w-full md:w-1/2 p-8">
          <div className="flex mb-8 border-b border-[#27272a]">
            <button 
              className={`flex-1 pb-4 text-lg font-medium transition-colors ${isLogin ? 'text-accent-light border-b-2 border-accent-light' : 'text-text-muted hover:text-white'}`}
              onClick={() => setIsLogin(true)}
            >
              Log In
            </button>
            <button 
              className={`flex-1 pb-4 text-lg font-medium transition-colors ${!isLogin ? 'text-accent-light border-b-2 border-accent-light' : 'text-text-muted hover:text-white'}`}
              onClick={() => setIsLogin(false)}
            >
              Register Shop
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Shop Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white" placeholder="Sharma Kirana Store" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white" placeholder="Ramesh Sharma" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Phone Number</label>
              <input type="tel" className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white" placeholder="9876543210" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
              <input type="password" className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full py-4 bg-accent-light text-background font-bold rounded hover:bg-accent-dark transition-colors">
              {isLogin ? 'Login to Portal' : 'Register Shop'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
