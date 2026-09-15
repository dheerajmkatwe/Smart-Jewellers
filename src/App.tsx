import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { AppLayout } from './components/layout/AppLayout';
import { DeveloperPanel } from './components/developer/DeveloperPanel';

export const App: React.FC = () => {
  // Developer Backdoor Access Check
  if (window.location.pathname === '/developerhubhai') {
    return <DeveloperPanel />;
  }

  return (
    <AuthProvider>
      <TenantProvider>
        <AppLayout />
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
