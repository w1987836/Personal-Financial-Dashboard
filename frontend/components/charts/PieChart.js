// Thin wrapper around react-chartjs-2 Pie chart for category distribution.

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data }) {
  const labels = data.map((d) => d.category);
  const values = data.map((d) => d.value);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#f97316",
          "#a855f7",
          "#ef4444",
          "#14b8a6",
          "#eab308"
        ]
      }
    ]
  };

  return <Pie data={chartData} />;
}


