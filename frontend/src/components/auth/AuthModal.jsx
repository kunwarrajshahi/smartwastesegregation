import React, { useState } from 'react';
import { Modal } from '../../design-system/Modal';
import Button from '../../design-system/Button';
import Badge from '../../design-system/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../design-system/Toast';
import { LogIn, UserPlus, Mail, Lock, User, Shield, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState(authModalMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('operator');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode when modal opens with a specific mode
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setError(null);
    }
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
        toast.success('Welcome Back', 'You have successfully signed in.');
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          role,
        });
        toast.success('Account Created', 'Your account has been registered and signed in.');
      }
      closeAuthModal();
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={mode === 'login' ? 'Sign in to Smart Waste' : 'Create System Account'}
      subtitle={
        mode === 'login'
          ? 'Enter your credentials to access telemetry, audit logs, and controls.'
          : 'Register a new operator, analyst, or administrator account.'
      }
      size="md"
    >
      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
            mode === 'login'
              ? 'border-forest-600 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LogIn size={16} />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
            mode === 'register'
              ? 'border-forest-600 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserPlus size={16} />
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#F7FAF8] border border-slate-200 rounded-xl focus:bg-white focus:border-forest-600 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@smartwaste.local"
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#F7FAF8] border border-slate-200 rounded-xl focus:bg-white focus:border-forest-600 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#F7FAF8] border border-slate-200 rounded-xl focus:bg-white focus:border-forest-600 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          {mode === 'register' && (
            <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters.</p>
          )}
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role Authorization</label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#F7FAF8] border border-slate-200 rounded-xl focus:bg-white focus:border-forest-600 focus:outline-none transition-all text-slate-800"
              >
                <option value="operator">Operator (Classify & Log Waste)</option>
                <option value="analyst">Analyst (Metrics & Reporting)</option>
                <option value="admin">Administrator (Full Access & Rules)</option>
              </select>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full justify-center py-2.5 text-sm"
          >
            {mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;
