async function loadChart(symbol, interval) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`;
  const response = await fetch(url);
  const data = await response.json();

  const ohlcData = data.map(c => ({
    x: new Date(c[0]),
    o: parseFloat(c[1]),
    h: parseFloat(c[2]),
    l: parseFloat(c[3]),
    c: parseFloat(c[4])
  }));

  const ctx = document.getElementById('price-chart').getContext('2d');

  // Destruir gráfico antigo antes de criar novo
  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [
        {
          label: symbol,
          data: ohlcData
        },
        {
          type: 'line',
          label: 'Entry',
          data: ohlcData.map(p => ({ x: p.x, y: ohlcData[ohlcData.length-1].c })),
          borderColor: '#22c55e',
          borderWidth: 1,
          pointRadius: 0
        },
        {
          type: 'line',
          label: 'Stop',
          data: ohlcData.map(p => ({ x: p.x, y: ohlcData[ohlcData.length-1].c * 0.98 })),
          borderColor: '#ef4444',
          borderWidth: 1,
          borderDash: [5,5],
          pointRadius: 0
        },
        {
          type: 'line',
          label: 'Target',
          data: ohlcData.map(p => ({ x: p.x, y: ohlcData[ohlcData.length-1].c * 1.05 })),
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderDash: [5,5],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      scales: {
        x: {
          type: 'time',
          time: { unit: interval.includes('d') ? 'day' : 'hour' },
          ticks: { color: '#e2e8f0' },
          grid: { color: 'rgba(148,163,184,0.1)' }
        },
        y: {
          position: 'right',
          ticks: { color: '#e2e8f0' },
          grid: { color: 'rgba(148,163,184,0.1)' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#e2e8f0' }
        }
      }
    }
  });
}

document.getElementById('load-btn').addEventListener('click', () => {
  const symbol = document.getElementById('symbol-select').value;
  const interval = document.getElementById('timeframe-select').value;
  loadChart(symbol, interval);
});

// Carrega inicial
loadChart('BTCUSDT', '1h');
