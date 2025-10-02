# Crypto Signals - Sistema de Análise Técnica com Machine Learning

Sistema avançado de análise técnica que combina regressão linear, Bollinger Bands e Estocástico para gerar sinais de trading em criptomoedas.

## Recursos

- ✅ Gráfico de candles interativo (Lightweight Charts)
- ✅ Previsão de preços usando Machine Learning (Gradient Descent)
- ✅ Bollinger Bands (SMA 20) visíveis no gráfico
- ✅ Análise de Estocástico (%K)
- ✅ Sinais de BUY/SELL/HOLD automatizados
- ✅ Stop Loss e Take Profit calculados via ATR
- ✅ Zoom e Pan completos (arrastar com mouse, scroll para zoom)
- ✅ Preços no eixo Y sempre visíveis
- ✅ Crosshair com valores em tempo real
- ✅ Suporte a 500+ criptomoedas via Binance API
- ✅ Múltiplos timeframes (1m a 1M)

## Como Usar

1. Abra o arquivo `index.html` em um navegador moderno
2. Selecione a moeda e o timeframe desejados
3. Ajuste o lookback (features) se necessário
4. Clique em "Carregar & Treinar"
5. Analise o gráfico e os sinais gerados

## Controles do Gráfico

- **Scroll do Mouse**: Zoom In/Out
- **Arrastar**: Pan (mover o gráfico)
- **Reset Zoom**: Volta ao zoom inicial

## Sinais

- 🟢 **BUY (COMPRA)**: Retorno positivo previsto acima do threshold
- 🔴 **SELL (VENDA)**: Retorno negativo previsto abaixo do threshold
- ⏸️ **HOLD (MANTER)**: Retorno previsto dentro da margem de erro

## Tecnologias

- Lightweight Charts (TradingView)
- JavaScript Vanilla
- Machine Learning (Gradient Descent)
- Binance API + CoinGecko API

## Notas

- O sistema usa dados históricos para treinar um modelo de regressão linear
- As previsões incluem análise de volatilidade (ATR) e reversão à média (BB)
- Stop Loss e Take Profit são calculados automaticamente usando múltiplos do ATR
