import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#7c5cff', '#FFD93D', '#4D96FF', '#FF4D4D', '#4CD97B', '#FF8A00', '#9B5DE5', '#00C2A8'];

export default function GenreChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
    },
    cutout: '65%',
  };

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400">
        No genre data yet — log a few moods first.
      </div>
    );
  }

  return <Doughnut data={chartData} options={options} />;
}
