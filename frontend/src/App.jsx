import React, { useState } from 'react';

function App() {
  const [symbol, setSymbol] = useState('');
  const [stockInfo, setStockInfo] = useState(null);
  const [forecastDays, setForecastDays] = useState(7);
  const [currentPrice, setCurrentPrice] = useState('');
  const [forecastLSTM, setForecastLSTM] = useState([]);
  const [forecastXGBoost, setForecastXGBoost] = useState([]);
  const [forecastCombined, setForecastCombined] = useState([]);
  const [graphsLSTM, setGraphsLSTM] = useState({});
  const [graphsXGBoost, setGraphsXGBoost] = useState({});
  const [graphsCombined, setGraphsCombined] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  document.title = 'Stock Price Prediction';

  const fetchStockInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/stock-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await response.json();
  
      if (data.error) {
        setError(data.error);
        setStockInfo(null);
      } else {
        setStockInfo(data);
        setError('');
      }
    } catch (error) {
      setError(`Error fetching stock info: ${error.message}`);
      setStockInfo(null);
    }
  };

  function AboutCompanyText({ text }) {
    const [isExpanded, setIsExpanded] = useState(false);
  
    return (
      <div>
        <p className="text-gray-200 leading-relaxed text-justify">
          {isExpanded ? text : `${text.slice(0, 300)}...`}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 font-medium mt-2 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    );
  }
  
  const handlePredict = async () => {
    setLoading(true);
    setStockInfo(null); 
    setError('');
    await fetchStockInfo(); 
    setError('');
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, forecast_days: forecastDays }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setCurrentPrice('');
        setForecastLSTM([]);
        setForecastXGBoost([]);
        setGraphsLSTM({});
        setGraphsXGBoost({});
        setGraphsCombined({});
      } else {
        setCurrentPrice(data.current_price);
        setForecastLSTM(data.lstm.forecast);
        setForecastXGBoost(data.xgboost.forecast);
        setForecastCombined(data.hybrid.forecast);
        const timestamp = new Date().getTime();
        setGraphsLSTM({
          actual_vs_predicted: `${data.lstm.graphs.actual_vs_predicted_lstm}?t=${timestamp}`,
          forecasted_prices: `${data.lstm.graphs.forecasted_prices_lstm}?t=${timestamp}`,
          training_vs_validation_loss: `${data.lstm.graphs.training_vs_validation_loss_lstm}?t=${timestamp}`,
          residuals_histogram: `${data.lstm.graphs.residuals_histogram_lstm}?t=${timestamp}`,
        });
        setGraphsXGBoost({
          actual_vs_predicted: `${data.xgboost.graphs.actual_vs_predicted_xgboost}?t=${timestamp}`,
          forecasted_prices: `${data.xgboost.graphs.forecasted_prices_xgboost}?t=${timestamp}`,
          residuals_histogram: `${data.xgboost.graphs.residuals_histogram_xgboost}?t=${timestamp}`,
        });
        setGraphsCombined({
          actual_vs_predicted: `${data.hybrid.graphs.actual_vs_predicted_weighted}?t=${timestamp}`,
          forecasted_prices: `${data.hybrid.graphs.forecasted_prices_weighted}?t=${timestamp}`,
          residuals_histogram: `${data.hybrid.graphs.residuals_histogram_weighted}?t=${timestamp}`,
          comparison_predictions: `${data.hybrid.graphs.comparison_predictions}?t=${timestamp}`,
        });
      }
    } catch (error) {
      setError(`Error fetching data: ${error.message}`);
      setCurrentPrice('');
      setForecastLSTM([]);
      setForecastXGBoost([]);
      setGraphsLSTM({});
      setGraphsXGBoost({});
      setGraphsCombined({});
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 shadow-2xl">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold text-gray-100 font-orbitron drop-shadow-lg">
              STOCK PRICE FORECAST
            </h1>
            <p className="text-lg text-cyan-400 font-semibold tracking-wide">
              Powered by Neural Networks and Machine Learning
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Input Section */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-12 border border-cyan-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <label className="block text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  placeholder="AAPL · TSLA · GOOG · NVDA"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-700 border-2 border-cyan-500/30 rounded-xl text-gray-100 
                    focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 text-lg font-medium
                    transition-all duration-300"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Forecast Days
                </label>
                <input
                  type="number"
                  placeholder="Days to predict ahead"
                  value={forecastDays}
                  onChange={(e) => setForecastDays(Number(e.target.value))}
                  className="w-full px-6 py-4 bg-gray-700 border-2 border-purple-500/30 rounded-xl text-gray-100 
                    focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg font-medium
                    transition-all duration-300"
                />
              </div>
            </div>
            <button
              onClick={handlePredict}
              className={`w-full py-5 px-8 rounded-xl font-bold text-lg 
                ${loading ? 'bg-gray-600 cursor-not-allowed' : 
                'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'}
                transition-all duration-500 shadow-lg hover:shadow-2xl relative overflow-hidden`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-3">
                  <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-100">INITIATING PREDICTION...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275z" />
                  </svg>
                  <span className="text-gray-100 uppercase tracking-wider">Run Predictive Analysis</span>
                </span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 p-6 mb-12 rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-red-100">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Price */}
          {!error && currentPrice && (
            <div className="bg-gradient-to-br from-green-300 to-green-700 rounded-2xl shadow-2xl p-8 mb-12 
              transform hover:scale-[1.02] transition-transform duration-500">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-gray-200 uppercase tracking-widest">Real-Time Valuation</p>
                <div className="text-6xl font-bold text-gray-100 font-digital">
                  {currentPrice}
                </div>
                <p className="text-lg text-gray-100">
                  {stockInfo?.name} <span className="text-gray-100">({stockInfo?.symbol})</span>
                </p>
              </div>
            </div>
          )}

          {/* Forecast Table */}
          {forecastLSTM.length > 0 && forecastXGBoost.length > 0 && forecastCombined.length > 0  && !error && (
            <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-12 border border-cyan-500/20">
              <div className="p-8 border-b border-cyan-500/20">
                <h3 className="text-2xl font-bold text-cyan-400">Predictive Analytics Engine Output</h3>
                <p className="mt-2 text-gray-400">Temporal Forecast Projections ({forecastDays} Day Horizon)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-cyan-500/20">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-cyan-400 uppercase tracking-wider">Date</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-purple-400 uppercase tracking-wider">LSTM Network</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-cyan-400 uppercase tracking-wider">XGBoost Model</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-green-400 uppercase tracking-wider">Weighted Average</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-cyan-500/20">
                    {forecastLSTM.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-700/20 transition-colors duration-300">
                        <td className="px-8 py-6 whitespace-nowrap text-lg font-medium text-gray-200">{item.date.split(' ')[0]}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-lg text-purple-400">{item.value}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-lg text-cyan-400">{forecastXGBoost[index]?.value}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-lg font-bold text-green-400">{forecastCombined[index]?.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stock Information Cards */}
          {stockInfo && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-cyan-500/20">
                <h3 className="text-2xl font-bold text-cyan-400 mb-6">Corporate Intelligence</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <div className="bg-gray-700/30 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-cyan-400 mb-2">Entity Identification</p>
                      <p className="text-lg text-gray-200">{stockInfo.name}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-cyan-400 mb-1">Market Symbol</p>
                      <p className="text-gray-200">{stockInfo.symbol}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-cyan-400 mb-1">Sector</p>
                      <p className="text-gray-200">{stockInfo.sector}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-cyan-400 mb-1">Market Cap</p>
                      <p className="text-gray-200">{stockInfo.marketCap}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-cyan-400 mb-1">PE Ratio</p>
                      <p className="text-gray-200">{stockInfo.peRatio}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-cyan-500/20">
                <h3 className="text-2xl font-bold text-cyan-400 mb-6">Corporate Profile</h3>
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <AboutCompanyText text={stockInfo.about} />
                </div>
              </div>
            </div>
          )}

         {/* Full Visualization Section with All Graphs */}
         {forecastLSTM.length > 0 && forecastXGBoost.length > 0 && forecastCombined.length > 0  && !error && (
            <div className="space-y-12">
              {/* LSTM Visualizations */}
              <section className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-cyan-500/20">
                <h3 className="text-2xl font-bold text-cyan-400 mb-8">LSTM Neural Network Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-900 rounded-xl p-4 border border-cyan-500/20">
                    <img src={`http://localhost:5000/graph/${graphsLSTM.actual_vs_predicted}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Actual vs Predicted Values</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/20">
                    <img src={`http://localhost:5000/graph/${graphsLSTM.forecasted_prices}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Forecasted Price Trajectory</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-green-500/20">
                    <img src={`http://localhost:5000/graph/${graphsLSTM.training_vs_validation_loss}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Training Validation Metrics</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <img src={`http://localhost:5000/graph/${graphsLSTM.residuals_histogram}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Error Distribution Analysis</p>
                  </div>
                </div>
              </section>

              {/* XGBoost Visualizations */}
              <section className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-purple-400 mb-8">XGBoost Ensemble Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/20">
                    <img src={`http://localhost:5000/graph/${graphsXGBoost.actual_vs_predicted}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Actual vs Predicted Values</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-green-500/20">
                    <img src={`http://localhost:5000/graph/${graphsXGBoost.forecasted_prices}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Forecasted Price Trajectory</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-cyan-500/20">
                    <img src={`http://localhost:5000/graph/${graphsXGBoost.residuals_histogram}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Error Distribution Analysis</p>
                  </div>
                </div>
              </section>

              {/* Combined Model Visualizations */}
              <section className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-green-500/20">
                <h3 className="text-2xl font-bold text-green-400 mb-8">Hybrid Model Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-900 rounded-xl p-4 border border-cyan-500/20">
                    <img src={`http://localhost:5000/graph/${graphsCombined.actual_vs_predicted}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Actual vs Predicted Values</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/20">
                    <img src={`http://localhost:5000/graph/${graphsCombined.forecasted_prices}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Forecasted Price Trajectory</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-green-500/20">
                    <img src={`http://localhost:5000/graph/${graphsCombined.residuals_histogram}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Error Distribution Analysis</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20">
                    <img src={`http://localhost:5000/graph/${graphsCombined.comparison_predictions}`} 
                         className="rounded-lg w-full" />
                    <p className="mt-4 text-center text-gray-400 font-medium">Model Performance Comparison</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-cyan-500/20 mt-24">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-cyan-500 font-semibold">
              Stock Price Prediction and Forecasting
            </p>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Machine Learning Platform | Developed by Vipul Singh and Vishal Singhal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;