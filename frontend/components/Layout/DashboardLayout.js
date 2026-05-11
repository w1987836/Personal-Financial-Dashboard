// Main dashboard layout: sidebar + top bar + content area.

import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, user, onLogout }) {
  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/60 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-xs text-slate-400">
              Overview of your personal finances
            </p>
          </div>
          <div className="text-sm text-slate-300">
            Signed in as <span className="font-medium">{user?.name}</span>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40">
          {children}
        </div>
      </main>
    </div>
  );
}


