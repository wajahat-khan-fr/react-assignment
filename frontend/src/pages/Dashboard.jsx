import React, { useEffect, useState } from 'react'
import { getDashboard } from '../services/api'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await getDashboard()
        console.log('Full API Response:', response)
        
        if (response.data?.success) {
          setData(response.data.data)
        } 
        
        setError(null)
      } catch (error) {
        console.error('Error fetching dashboard:', error)
        setError(error.message || 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // I used this for debugging i was having a small issue I didn't notice at first that data.data is nested Thought I just leavee this here... but in real life I would remove it
  useEffect(() => {
    console.log('Current data state:', data)
  }, [data])

  // This function is AI generated to format dates ... didn't want to waste time on it
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // just Getting color based on value
  const getValueColor = (value) => {
    if (value === undefined || value === null) return 'text-gray-600'
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  // same here just getting color 
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  // same here but its getting redundant here lol can probably make a util for these colors
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'crypto': return 'bg-purple-100 text-purple-800'
      case 'technology': return 'bg-blue-100 text-blue-800'
      case 'market': return 'bg-green-100 text-green-800'
      case 'macro': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // basic loading nothing special
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl font-medium text-gray-600">Loading dashboard data...</div>
    </div>
  )

  // error handling with retry button - would want a better way to handle this in real life but for demo purposes this will do
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="text-red-500 text-xl font-medium mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  )

  if (!data) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="text-gray-500 text-xl font-medium mb-4">No dashboard data available</div>
      </div>
    </div>
  )

  //our main dashboard layout
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Investment Dashboard</h1>
        
        {/* THE summary card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Portfolio Summary</h2>
          {data?.portfolio ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${data.portfolio.totalValue?.toLocaleString() || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Change</p>
                <p className={`text-2xl font-bold ${getValueColor(data.portfolio.totalChange)}`}>
                  ${data.portfolio.totalChange?.toLocaleString() || '0.00'} 
                  ({data.portfolio.totalChangePercent?.toFixed(2) || '0.00'}%)
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No portfolio data available</p>
          )}
        </div>

        {/* gainer looser section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Movers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                Top Gainers
              </h3>
              <div className="space-y-3">
                {data?.topGainers?.length > 0 ? (
                  data.topGainers.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.symbol || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{item.name || 'Unnamed Asset'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${item.currentPrice?.toFixed(2) || '0.00'}
                        </p>
                        <p className={`text-sm font-medium ${getValueColor(item.changePercent)}`}>
                          {item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2) || '0.00'}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No gainers data</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                Top Losers
              </h3>
              <div className="space-y-3">
                {data?.topLosers?.length > 0 ? (
                  data.topLosers.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.symbol || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{item.name || 'Unnamed Asset'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${item.currentPrice?.toFixed(2) || '0.00'}
                        </p>
                        <p className={`text-sm font-medium ${getValueColor(item.changePercent)}`}>
                          {item.changePercent?.toFixed(2) || '0.00'}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No losers data</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NEWS FEED */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent News</h2>
          <div className="space-y-4">
            {data?.recentNews?.length > 0 ? (
              data.recentNews.slice(0, 5).map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {item.title || 'No title available'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span>{item.source || 'Unknown source'}</span>
                    <span>-</span>
                    <span>{formatDate(item.timestamp)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category || 'general'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent news</p>
            )}
          </div>
        </div>

        {/* alerts summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {data?.activeAlerts?.length > 0 ? (
              data.activeAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900">{alert.message || 'No message'}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getSeverityColor(alert.severity)}`}>
                      {alert.severity || 'unknown'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard