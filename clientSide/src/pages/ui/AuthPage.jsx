import { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Login Flow
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        
        if (res.ok) {
          setMessage({ type: 'success', text: 'Login successful. Redirecting...' });
          // Save the user data returned from the backend login
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          setTimeout(() => navigate('/'), 1500);
        } else {
          setMessage({ type: 'error', text: data.error || 'Invalid credentials' });
        }
      } else {
        // Signup Request Flow
        const res = await fetch('/api/auth/request-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: formData.name, 
            email: formData.email, 
            phone: formData.phone,
            origin: window.location.origin
          })
        });
        const data = await res.json();
        
        if (res.ok) {
          setMessage({ type: 'success', text: 'Request sent to head admin successfully! Check your email shortly for your assigned password.' });
          setFormData({ name: '', email: '', phone: '', password: '' });
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to send request' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-800 bg-[#f8fafc] font-sans selection:bg-blue-200">
      
      {/* Left side: Premium Image / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-mainBlack overflow-hidden items-center justify-center">
        <img 
          src="/banner1.jpg" 
          alt="College Campus" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        {/* Subtle decorative background patterns */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/60 via-mainBlack/40 to-black/80" />
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/30 blur-3xl mix-blend-screen" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/40 blur-3xl mix-blend-screen" />
        
        <div className="z-10 text-center px-16 text-white max-w-lg">
          <h1 className="text-4xl font-tight font-medium tracking-tight mb-4">
            College IVR Dashboard
          </h1>
          <p className="font-light leading-relaxed text-lg">
            A centralized hub to monitor telephonic interactions, manage realtime routing, and overview college affairs with absolute elegance.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative bg-white">
        
        <div className="w-full max-w-md space-y-10">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-gray-900">
              {isLogin ? 'Welcome back' : 'Request Access'}
            </h2>
            <p className="mt-3 text-sm text-gray-500 font-medium">
              {isLogin 
                ? 'Please enter your assigned credentials to access the panel.' 
                : 'Submit your details. Admins will verify and mail you a secure password.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {!isLogin && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-tight mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-xl transition-all text-sm focus:outline-none"
                      placeholder="full Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-tight mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-lg transition-all text-sm focus:outline-none"
                      placeholder="phone number"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-tight mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-sm transition-all text-sm focus:outline-none"
                  placeholder="gmail"
                />
              </div>
            </div>

            {isLogin && (
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-tight mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-sm transition-all text-sm focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Status Message */}
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-mainBlack hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block animate-pulse">Processing...</span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Request as Admin'}
                  {!isLogin ? <ArrowRight size={16} /> : <Lock size={16} />}
                </>
              )}
            </button>
          </form>

          {/* Toggle Flow */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage({ type: '', text: '' });
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              {isLogin ? (
                <>No account yet? <span className="text-mainBlack">Request Access</span> <ArrowRight size={14} /></>
              ) : (
                <><ArrowLeft size={14} /> Back to <span className="text-mainBlack">Sign In</span></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
