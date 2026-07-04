import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklyChart({ data = [] }) {
  const counts = new Array(7).fill(0);
  data.forEach((d) => {
    const idx = (d._id - 1 + 7) % 7;
    counts[idx] = d.count;
  });

  const chartData = {
    labels: DAY_LABELS,
    datasets: [
      {
        label: 'Check-ins',
        data: counts,
        backgroundColor: '#7c5cff',
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(128,128,128,0.1)' } },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={chartData} options={options} />;
}
