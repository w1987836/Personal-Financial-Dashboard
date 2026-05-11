// Visual progress bar for a category budget with color-coded states.

export default function BudgetProgressBar({ category, spent, limit, percent, status }) {
  const colorMap = {
    ok: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger"
  };

  const barColor = colorMap[status] || colorMap.ok;

  return (
    <div className="card space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{category}</span>
        <span className="text-slate-300">
          {spent.toFixed(2)} / {limit.toFixed(2)}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`${barColor} h-2`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className="text-xs text-slate-400">
        {percent.toFixed(1)}% used
        {status === "warning" && " - approaching budget limit"}
        {status === "danger" && " - budget exceeded!"}
      </div>
    </div>
  );
}


