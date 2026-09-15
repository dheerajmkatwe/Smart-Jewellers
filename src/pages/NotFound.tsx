import React from 'react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#eae7df] flex items-center justify-center p-6 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="font-display text-4xl font-bold text-gold-bright">404</h1>
        <p className="text-sm text-[#8f9198]">Page not found or workspace access restricted.</p>
        <a href="/" className="inline-block bg-gold text-black font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-gold-bright">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
