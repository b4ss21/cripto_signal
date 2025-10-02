// REGISTRO DE PLUGINS CHART.JS
if (typeof Chart !== 'undefined') {
  if (Chart.register) {
    if (window['ChartFinancialController']) {
      Chart.register(window['ChartFinancialController']);
    }
    if (window['CandlestickController']) {
      Chart.register(window['CandlestickController']);
    }
    if (window['OhlcController']) {
      Chart.register(window['OhlcController']);
    }
    if (window['chartjsPluginZoom']) {
      Chart.register(window['chartjsPluginZoom']);
    }
    // Plugin custom crosshair/barra de preço
    Chart.register({
      id: 'crosshairPriceBar',
      afterEvent(chart, args) {
        const {event} = args;
        if (!event || !chart.scales || !chart.scales.y) return;
        const ctx = chart.ctx;
        if (event.type === 'mousemove' || event.type === 'mouseout' || event.type === 'touchmove') {
          chart._mouse = event.type === 'mouseout' ? null : {x: event.x, y: event.y};
          chart.draw();
        }
      },
      afterDraw(chart) {
        if (!chart._mouse) return;
        const mouseY = chart._mouse.y;
        const mouseX = chart._mouse.x;
        if (mouseX == null || mouseY == null) return;
        const yScale = chart.scales.y;
        const price = yScale.getValueForPixel(mouseY);
        const ctx = chart.ctx;
        ctx.save();
        // Linha horizontal
        ctx.beginPath();
        ctx.moveTo(0, mouseY);
        ctx.lineTo(chart.width, mouseY);
        ctx.strokeStyle = '#66d9ff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        // Barra de preço
        const priceText = price ? price.toFixed(2) : '';
        ctx.font = 'bold 13px Inter, Arial';
        const textWidth = ctx.measureText(priceText).width + 16;
        const textHeight = 22;
        const boxX = chart.width - textWidth - 2;
        const boxY = mouseY - textHeight/2;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#66d9ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(boxX, boxY, textWidth, textHeight, 6);
        else ctx.rect(boxX, boxY, textWidth, textHeight);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#66d9ff';
        ctx.textBaseline = 'middle';
        ctx.fillText(priceText, boxX + 8, mouseY);
        ctx.restore();
      }
    });
  }
}
// --- Zoom/esticar/encolher com botão direito ---
let isRightDragging = false;
let dragStart = null;
let dragAxis = null;

function setupRightButtonZoom(chart) {
  const canvas = chart.canvas;
  canvas.addEventListener('contextmenu', e => e.preventDefault()); // Desativa menu padrão
  canvas.addEventListener('mousedown', e => {
    if (e.button === 2) { // Botão direito
      isRightDragging = true;
      dragStart = { x: e.offsetX, y: e.offsetY };
      // Decide eixo: se arrastar mais na horizontal, X; vertical, Y
      dragAxis = null;
    }
  });
  canvas.addEventListener('mousemove', e => {
    if (isRightDragging && dragStart) {
      const dx = e.offsetX - dragStart.x;
      const dy = e.offsetY - dragStart.y;
      if (!dragAxis) {
        dragAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      const scale = chart.scales[dragAxis];
      if (scale) {
        // Quanto mais arrasta, mais zoom
        const factor = dragAxis === 'x' ? dx : -dy;
        const zoom = 1 + factor / 200;
        const min = scale.min;
        const max = scale.max;
        const center = (min + max) / 2;
        const range = (max - min) / zoom;
        scale.options.min = center - range / 2;
        scale.options.max = center + range / 2;
        chart.update('none');
      }
      dragStart = { x: e.offsetX, y: e.offsetY };
    }
  });
  window.addEventListener('mouseup', e => {
    if (isRightDragging) {
      isRightDragging = false;
      dragStart = null;
      dragAxis = null;
    }
  });
}
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
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              if (context.dataset.type === 'candlestick') {
                const o = context.raw.o.toFixed(2);
                const h = context.raw.h.toFixed(2);
                const l = context.raw.l.toFixed(2);
                const c = context.raw.c.toFixed(2);
                return `O: ${o}  H: ${h}  L: ${l}  C: ${c}`;
              } else {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
              }
            }
          },
          backgroundColor: '#1e293b',
          borderColor: '#66d9ff',
          borderWidth: 1,
          titleColor: '#66d9ff',
          bodyColor: '#fff',
          displayColors: false
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'xy',
            modifierKey: 'ctrl', // Arrastar com Ctrl
            threshold: 2
          },
          zoom: {
            wheel: {
              enabled: true,
              modifierKey: null // Zoom com scroll
            },
            pinch: {
              enabled: true // Pinch mobile
            },
            mode: 'xy', // Zoom X e Y
          },
          limits: {
            x: { minRange: 5 },
            y: { minRange: 0.5 }
          }
        },
        crosshair: false // Placeholder para crosshair custom
      },
      hover: {
        mode: 'index',
        intersect: false
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      animation: false,
      events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
      // Crosshair e barra de preço via plugin customizado
      plugins: {
        ...(
          typeof Chart !== 'undefined' && Chart.registry ? {
            crosshairPriceBar: {
              afterEvent(chart, args) {
                const {event} = args;
                if (!event || !chart.scales || !chart.scales.y) return;
                const ctx = chart.ctx;
                if (event.type === 'mousemove' || event.type === 'mouseout' || event.type === 'touchmove') {
                  chart._mouse = event.type === 'mouseout' ? null : {x: event.x, y: event.y};
                  chart.draw();
                }
              },
              afterDraw(chart) {
                if (!chart._mouse) return;
                const mouseY = chart._mouse.y;
                const mouseX = chart._mouse.x;
                if (mouseX == null || mouseY == null) return;
                const yScale = chart.scales.y;
                const price = yScale.getValueForPixel(mouseY);
                const ctx = chart.ctx;
                ctx.save();
                // Linha horizontal
                ctx.beginPath();
                ctx.moveTo(0, mouseY);
                ctx.lineTo(chart.width, mouseY);
                ctx.strokeStyle = '#66d9ff';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
                // Barra de preço
                const priceText = price ? price.toFixed(2) : '';
                ctx.font = 'bold 13px Inter, Arial';
                const textWidth = ctx.measureText(priceText).width + 16;
                const textHeight = 22;
                const boxX = chart.width - textWidth - 2;
                const boxY = mouseY - textHeight/2;
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#66d9ff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(boxX, boxY, textWidth, textHeight, 6);
                else ctx.rect(boxX, boxY, textWidth, textHeight);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#66d9ff';
                ctx.textBaseline = 'middle';
                ctx.fillText(priceText, boxX + 8, mouseY);
                ctx.restore();
              }
            }
          } : {})
      }
    }
  });
  // Ativa zoom/esticar/encolher com botão direito
  setupRightButtonZoom(window.myChart);
}


document.getElementById('load-btn').addEventListener('click', () => {
  const symbol = document.getElementById('symbol-select').value;
  const interval = document.getElementById('timeframe-select').value;
  loadChart(symbol, interval);
});

// Botão de reset do zoom
document.getElementById('reset-zoom-btn').addEventListener('click', () => {
  if (window.myChart) {
    window.myChart.resetZoom();
  }
});

// Carrega inicial
loadChart('BTCUSDT', '1h');
