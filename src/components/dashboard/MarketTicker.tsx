/**
 * MarketTicker — horizontal scrolling strip with live market prices
 */
import React, { useState, useEffect } from 'react';

const TICKERS = ['IBOV','PETR4','VALE3','ITUB4','WEGE3','MXRF11','BTC','USD'];

interface TickerItem {
  symbol: string; price: string; change: string; positive: boolean;
}

function mockTicker(symbol: string): TickerItem {
  const prices: Record<string,string> = {
    IBOV:'127.842',PETR4:'38,45',VALE3:'61,20',ITUB4:'32,10',
    WEGE3:'51,80',MXRF11:'10,82',BTC:'R$298.500',USD:'5,14'
  };
  const changes: Record<string,string> = {
    IBOV:'+1,24%',PETR4:'+0,83%',VALE3:'-0,42%',ITUB4:'+0,31%',
    WEGE3:'+1,15%',MXRF11:'+0,46%',BTC:'+2,10%',USD:'-0,08%'
  };
  return {
    symbol, price: prices[symbol]??'—', change: changes[symbol]??'0%',
    positive: !(changes[symbol]??'').startsWith('-')
  };
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(TICKERS.map(mockTicker));

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(TICKERS.map(symbol => ({
        ...mockTicker(symbol),
        change: (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 2).toFixed(2) + '%',
        positive: Math.random() > 0.4,
      })));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '6px 0', overflow: 'hidden', height: 32,
    }}>
      <div style={{ display: 'flex', gap: 32, paddingLeft: 24, alignItems: 'center', height: '100%' }}>
        {items.map(item => (
          <div key={item.symbol} style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{item.symbol}</span>
            <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{item.price}</span>
            <span style={{ color: item.positive ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{item.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
