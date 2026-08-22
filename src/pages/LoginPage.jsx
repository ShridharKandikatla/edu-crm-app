import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { APP_NAME } from '../constants/app';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../utils/seo';

function todayOtp() {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0');
}

function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(localStorage.getItem('otpVerified') === todayKey() ? 'otp' : 'login');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const { login } = useAuth();
  const navigate = useNavigate();

  useSeo({ title: 'Staff Login', noindex: true });

  useEffect(() => {
    if (step === 'otp') otpRefs[0].current?.focus();
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (localStorage.getItem('otpVerified') === todayKey()) {
          navigate('/dashboard');
        } else {
          setStep('otp');
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    setOtpError('');
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
    if (newDigits.every(d => d)) {
      setTimeout(() => {
        if (newDigits.join('') === todayOtp()) {
          localStorage.setItem('otpVerified', todayKey());
          navigate('/dashboard');
        } else {
          setOtpError('Invalid OTP. Please try again.');
          setOtpDigits(['', '', '', '']);
          otpRefs[0].current?.focus();
        }
      }, 100);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!text) return;
    setOtpError('');
    const newDigits = ['...', '', '', ''];
    for (let i = 0; i < text.length && i < 4; i++) newDigits[i] = text[i];
    setOtpDigits(newDigits);
    const focusIdx = Math.min(text.length, 3);
    otpRefs[focusIdx].current?.focus();
    if (text.length === 4) {
      setTimeout(() => {
        if (text === todayOtp()) {
          localStorage.setItem('otpVerified', todayKey());
          navigate('/dashboard');
        } else {
          setOtpError('Invalid OTP. Please try again.');
          setOtpDigits(['', '', '', '']);
          otpRefs[0].current?.focus();
        }
      }, 100);
    }
  };

  const inputClass = (field) => {
    const base = 'w-full rounded-xl border-[1.5px] bg-gray-50/80 px-4 py-3 pl-11 text-[0.9375rem] text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400';
    if (error) return `${base} border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100`;
    if (focusedField === field) return `${base} border-indigo-400 bg-white dark:bg-[#1f2530] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/40`;
    return `${base} border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/40`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f0b2e] px-4 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md" style={{ animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-xl shadow-indigo-500/30">
            U
          </div>
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-indigo-200/50 dark:text-white/50">Education Admission Management</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] shadow-2xl backdrop-blur-xl">
          <div className="px-10 py-7">
            {step === 'login' ? (
              <>
                <h2 className="mb-1 text-lg font-bold text-white">Welcome back</h2>
                <p className="mb-6 text-sm text-indigo-200/50 dark:text-white/50">Sign in to your account</p>

                {error && (
                  <div id="login-error" className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-indigo-100/80 dark:text-white/70">Email Address</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </span>
                      <input
                        id="login-email" type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')}
                        placeholder="admin@crm.com"
                        className={inputClass('email')}
                        aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-indigo-100/80 dark:text-white/70">Password</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </span>
                      <input
                        id="login-password" type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')}
                        placeholder="Enter your password"
                        className={`${inputClass('password')} pr-10`}
                        aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                        {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-[0.9375rem] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-busy={loading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Signing in...
                        </>
                      ) : 'Sign In'}
                    </span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="mb-1 text-lg font-bold text-white">Verification</h2>
                <p className="mb-6 text-sm text-indigo-200/50">Enter OTP to continue</p>

                {otpError && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    {otpError}
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className={`h-16 w-14 rounded-xl border-[1.5px] bg-white/[0.05] text-center text-2xl font-bold text-white outline-none transition-all duration-200 placeholder:text-white/20 ${otpError ? 'border-red-400/60 bg-red-500/10 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-white/10 focus:border-indigo-500 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/20'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => { setOtpDigits(['', '', '', '']); setOtpError(''); otpRefs[0].current?.focus(); }}
                  className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white/80"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-indigo-300/30">
          {APP_NAME} &copy; {new Date().getFullYear()} &mdash; All rights reserved
        </p>
      </div>
    </div>
  );
}
