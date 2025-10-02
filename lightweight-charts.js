// LW Chart loader
// Este arquivo carrega a biblioteca Lightweight Charts via CDN

export async function loadLightweightCharts() {
  if (window.LightweightCharts) return window.LightweightCharts;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js';
    script.onload = () => {
      resolve(window.LightweightCharts);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
