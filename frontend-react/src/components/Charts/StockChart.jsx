import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ title, labels, datasets }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#B8BFCC', // sp-text-secondary
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          padding: 15,
          usePointStyle: true
        }
      },
      title: {
        display: false // We use external title in card
      },
      tooltip: {
        backgroundColor: 'rgba(37, 41, 50, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: '#B8BFCC',
        borderColor: '#2E5A8F',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#8A92A5',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: '#8A92A5',
          font: { size: 10 },
          callback: (value) => `$${value.toFixed(0)}`
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.1 // Slight curve for smoother lines
      },
      point: {
        radius: 0, // No points by default
        hoverRadius: 5, // Show on hover
        hitRadius: 10 // Easier to hover
      }
    }
  };

  const data = {
    labels,
    datasets: datasets.map(ds => ({
      ...ds,
      borderWidth: 2,
      pointBackgroundColor: ds.borderColor,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBorderWidth: 2
    }))
  };

  return (
    <div className='sp-chart-card'>
      <div className='sp-chart-header'>
        <h3 className='sp-chart-title'>{title}</h3>
      </div>
      <div className='sp-chart-wrapper' style={{ height: '400px' }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default StockChart;
