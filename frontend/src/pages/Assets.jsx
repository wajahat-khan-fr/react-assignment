// Assets Page - TO BE IMPLEMENTED BY CANDIDATE
// This is a basic placeholder structure

//PS I have taken a different appoach here by making the elements more modular to reduce code repetition for cards and buttons
import React, { useState, useEffect } from 'react';
import { getStocks, getCrypto } from '../services/api';


// these components are pretty self explanatory by there names so not adding comments here
const FilterButton = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      active 
        ? 'bg-blue-500 text-white' 
        : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
  >
    {children} {count !== undefined && `(${count})`}
  </button>
);

const AssetTypeBadge = ({ type }) => {
  const isCrypto = type === 'crypto';
  const bgColor = isCrypto ? 'bg-purple-100' : 'bg-blue-100';
  const textColor = isCrypto ? 'text-purple-800' : 'text-blue-800';
  const label = isCrypto ? 'Crypto' : 'Stock';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

const ChangeIndicator = ({ value }) => {
  const isPositive = value >= 0;
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const newValue = `${isPositive ? '+' : ''}${value?.toFixed(2) || '0.00'}%`;
  
  return (
    <div className={`flex items-center ${color}`}>
      <span className="font-medium">{newValue}</span>
    </div>
  );
};

const AssetRow = ({ asset }) => (
  <tr key={`${asset.type}-${asset.id || asset.symbol}`} className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
          asset.type === 'crypto' ? 'bg-purple-100' : 'bg-blue-100'
        }`}>
          <span className={`text-sm font-bold ${
            asset.type === 'crypto' ? 'text-purple-600' : 'text-blue-600'
          }`}>
            {asset.symbol?.substring(0, 2)}
          </span>
        </div>
        <span className="font-mono font-bold text-gray-900">{asset.symbol}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="text-sm text-gray-900">{asset.name}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <AssetTypeBadge type={asset.type} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="font-medium text-gray-900">
        ${asset.currentPrice?.toFixed(2) || '0.00'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <ChangeIndicator value={asset.changePercent} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-sm text-gray-900">
        ${asset.volume?.toLocaleString() || '0'}
      </span>
    </td>
  </tr>
);

const StatCard = ({ label, value, color = 'text-gray-900' }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="text-sm text-gray-500 mb-1">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

const Assets = () => {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        
        const [stocksRes, cryptoRes] = await Promise.all([
          getStocks(),
          getCrypto()
        ]);

        const stocksData = stocksRes.data?.data || stocksRes.data || [];
        const cryptoData = cryptoRes.data?.data || cryptoRes.data || [];

        setStocks(stocksData);
        setCrypto(cryptoData);
        setError(null);
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError('Failed to load assets data');
        setStocks([]);
        setCrypto([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  //merging stocks and crypto into one array for easier filtering and display
  const allAssets = [
    ...stocks.map(item => ({ ...item, type: 'stock' })),
    ...crypto.map(item => ({ ...item, type: 'crypto' }))
  ];

  const filteredAssets = allAssets.filter(asset => {
    if (filter === 'stocks') return asset.type === 'stock';
    if (filter === 'crypto') return asset.type === 'crypto';
    return true;
  });

  const stockCount = allAssets.filter(a => a.type === 'stock').length;
  const cryptoCount = allAssets.filter(a => a.type === 'crypto').length;
  const totalCount = allAssets.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-medium text-gray-600">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets</h1>
          <p className="text-gray-600">Track all your stocks and cryptocurrencies in one place</p>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <FilterButton 
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              count={filteredAssets.length}
            >
              All Assets
            </FilterButton>
            <FilterButton 
              active={filter === 'stocks'}
              onClick={() => setFilter('stocks')}
            >
              Stocks Only
            </FilterButton>
            <FilterButton 
              active={filter === 'crypto'}
              onClick={() => setFilter('crypto')}
            >
              Crypto Only
            </FilterButton>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No assets found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <AssetRow key={`${asset.type}-${asset.id || asset.symbol}`} asset={asset} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Total Assets" 
            value={totalCount}
          />
          <StatCard 
            label="Stocks" 
            value={stockCount}
            color="text-blue-600"
          />
          <StatCard 
            label="Cryptocurrencies" 
            value={cryptoCount}
            color="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default Assets;