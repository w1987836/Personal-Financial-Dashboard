// Sidebar navigation component shown on all authenticated pages.

import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar({ onLogout }) {
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reports", label: "Reports" }
  ];

  return (
    <aside className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-white">
          Personal Finance
        </h1>
        <p className="text-xs text-slate-400">
          Budgeting & Expense Tracking
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm ${
                active
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}


