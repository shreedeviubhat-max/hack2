import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API_BASE_URL } from '../config/api';
import shopkeeperEntryImg from '../assets/shopkeeper-entry.jpg';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    shopName: '',
    ownerFullName: '',
    phoneNumber: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = isLogin ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/register`;
    const payload = isLogin
      ? { phoneNumber: formData.phoneNumber, password: formData.password }
      : formData;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const rawText = await res.text();
        console.error('Non-JSON response received:', rawText);
        throw new Error(`Server returned status ${res.status}. Backend endpoint not reached.`);
      }

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Authentication failed');
        setLoading(false);
        return;
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        alert('Shop registered successfully! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('API error:', err);
      setErrorMsg(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-[#121214] rounded-xl overflow-hidden shadow-2xl border border-[#27272a]">
        <div className="w-full md:w-1/2 bg-[#09090b] flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#27272a]">
          <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-lg border border-[#27272a] mb-6 bg-black">
            <img 
              src={shopkeeperEntryImg} 
              alt="Shopkeeper managing store ledger on digital tablet" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-accent-light mb-2">
              {isLogin ? 'Welcome Back!' : 'Join Us Today'}
            </h2>
            <p className="text-text-muted">Smart digital khata & ledger for modern shops.</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <div className="flex mb-8 border-b border-[#27272a]">
            <button
              type="button"
              className={`flex-1 pb-4 text-lg font-medium transition-colors ${isLogin
                ? 'text-accent-light border-b-2 border-accent-light'
                : 'text-text-muted hover:text-white'
                }`}
              onClick={() => {
                setIsLogin(true);
                setErrorMsg('');
              }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`flex-1 pb-4 text-lg font-medium transition-colors ${!isLogin
                ? 'text-accent-light border-b-2 border-accent-light'
                : 'text-text-muted hover:text-white'
                }`}
              onClick={() => {
                setIsLogin(false);
                setErrorMsg('');
              }}
            >
              Register Shop
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500 rounded text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white"
                    placeholder="Sharma Kirana Store"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="ownerFullName"
                    value={formData.ownerFullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white"
                    placeholder="Ramesh Sharma"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white"
                placeholder="9876543210"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-[#27272a] rounded focus:outline-none focus:border-accent-light text-white"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent-light text-background font-bold rounded hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : isLogin
                  ? 'Login to Portal'
                  : 'Register Shop'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}