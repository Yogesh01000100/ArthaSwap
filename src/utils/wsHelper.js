const streams = [
    'linkusdt@trade',  // Chainlink/USDT
    'usdcusdt@trade',  // USDC/USDT
    'ethusdt@trade'    // Ethereum/USDT
  ];
  
  const url = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
  
  let priceCallbacks = {};
  
  const ws = new WebSocket(url);
  
  ws.onopen = () => {
    console.log(`Connected to ${url}`);
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const streamName = message.stream;
    const tradePrice = parseFloat(message.data.p);
  
    if (priceCallbacks[streamName]) {
      priceCallbacks[streamName](tradePrice);
    }
  };
  
  ws.onclose = () => {
    console.log('Disconnected from WebSocket');
  };
  
  ws.onerror = (err) => {
    console.error(`WebSocket error: ${err.message}`);
  };
  
  ws.onping = () => {
    ws.pong();
  };
  
  export const subscribeToPrice = (streamName, callback) => {
    priceCallbacks[streamName] = callback;
  };
  
  export const unsubscribeFromPrice = (streamName) => {
    delete priceCallbacks[streamName];
  };
  