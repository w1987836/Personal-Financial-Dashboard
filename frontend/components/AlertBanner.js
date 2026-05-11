// Reusable alert banner for budget warnings and errors.

export default function AlertBanner({ type = "info", message }) {
  if (!message) return null;

  const styles = {
    info: "bg-slate-800 border-slate-600 text-slate-100",
    warning: "bg-yellow-900/40 border-yellow-500 text-yellow-100",
    danger: "bg-red-900/40 border-red-500 text-red-100",
    success: "bg-emerald-900/40 border-emerald-500 text-emerald-100"
  }[type];

  return (
    <div className={`border rounded-lg px-4 py-2 text-sm mb-4 ${styles}`}>
      {message}
    </div>
  );
}


