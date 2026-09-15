import React, { useState, useEffect } from 'react';

interface GmailVerificationModalProps {
  email: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export const GmailVerificationModal: React.FC<GmailVerificationModalProps> = ({
  email,
  onVerified,
  onCancel,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = (codeToVerify?: string) => {
    setErrorMsg('');
    const fullCode = codeToVerify || otp.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setRedirecting(true);
      setTimeout(() => {
        onVerified();
      }, 1800);
    }, 1000);
  };

  const handleSimulateGmailClick = () => {
    setOtp(['5', '8', '9', '2', '1', '4']);
    handleVerify('589214');
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(30);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#14161b] border border-[#262a32] rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Decorative Background Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {isSuccess ? (
          <div className="py-8 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
              ✓
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Gmail Verified!</h2>
            <p className="text-xs text-[#8f9198]">
              Your email <span className="text-gold font-mono">{email}</span> has been confirmed.
            </p>
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-gold-bright font-bold">
              <span className="inline-block w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              Redirecting to System &amp; Shop Setup...
            </div>
          </div>
        ) : (
          <>
            {/* Header Icon */}
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>

            <h2 className="font-display text-xl font-bold text-gold-bright mb-1">Verify Gmail Address</h2>
            <p className="text-xs text-[#8f9198] mb-6">
              We sent a 6-digit confirmation code to <br />
              <strong className="text-[#eae7df] font-mono">{email}</strong>
            </p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4 text-left">
                {errorMsg}
              </div>
            )}

            {/* 6-Digit OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 bg-[#1b1e24] border border-[#262a32] focus:border-gold rounded-xl text-center text-lg font-bold text-gold-bright outline-none transition-all focus:ring-1 focus:ring-gold"
                />
              ))}
            </div>

            {/* Verification Actions */}
            <button
              onClick={() => handleVerify()}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-[#171410] font-bold text-sm py-3 rounded-xl shadow-lg hover:brightness-110 transition-all mb-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Verifying Code...
                </>
              ) : (
                'Confirm Verification Code'
              )}
            </button>

            {/* Quick Demo Simulator Button */}
            <button
              onClick={handleSimulateGmailClick}
              className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs py-2.5 rounded-xl transition-all mb-4 flex items-center justify-center gap-2"
            >
              ✉️ Simulate Clicking Gmail Verification Link (1-Click)
            </button>

            <div className="flex justify-between items-center text-xs text-[#8f9198] pt-2 border-t border-[#1e2128]">
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className={`hover:text-gold ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : 'text-gold-bright font-bold'}`}
              >
                {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
              </button>

              {onCancel && (
                <button onClick={onCancel} className="hover:text-white">
                  Back to Register
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
