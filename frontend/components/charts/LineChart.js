// Line chart for monthly spending trend (daily expenses).

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function LineChart({ dailyExpenses }) {
  const labels = dailyExpenses.map((_, idx) => idx + 1);

  const data = {
    labels,
    datasets: [
      {
        label: "Daily Expenses",
        data: dailyExpenses,
        borderColor: "#ef4444",
        backgroundColor: "rgba(248, 113, 113, 0.2)",
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        ticks: { color: "#cbd5f5" },
        grid: { color: "rgba(148, 163, 184, 0.2)" }
      },
      x: {
        ticks: { color: "#cbd5f5" },
        grid: { display: false }
      }
    }
  };

  return <Line data={data} options={options} />;
}


