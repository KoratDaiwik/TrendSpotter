
import React, { useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import PostList from "../components/PostList";
import DOMPurify from "dompurify";
import PropTypes from "prop-types";

Chart.register(ArcElement, Tooltip, Legend);

const sanitizeHTML = (text) => DOMPurify.sanitize(text);

const exportToCSV = (results) => {
  console.log("Exporting to CSV:", results);
  alert("CSV export functionality coming soon!");
};

const exportToPDF = (results) => {
  console.log("Exporting to PDF:", results);
  alert("PDF export functionality coming soon!");
};

const SentimentAnalysis = () => {
  const [subreddit, setSubreddit] = useState("technology");
  const [limit, setLimit] = useState(5);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSentiment = async () => {
    if (!subreddit.trim()) {
      setError("Subreddit name required");
      return;
    }
    if (limit < 1 || limit > 100) {
      setError("Number of posts must be between 1-100");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/analyze_sentiment",
        {
          subreddit: subreddit.trim().toLowerCase(),
          limit: parseInt(limit),
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (!response.data?.posts)
        throw new Error("Invalid data format from server");

      setResults(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        (err.request ? "Network Error" : err.message) ||
        "Analysis failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const chartData = results && {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: Object.values(results.sentiment_distribution),
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-md mb-6">
        <div className="p-6 rounded-lg shadow-md mb-6 bg-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subreddit
              </label>
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                placeholder="Enter subreddit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Post Limit (1-100)
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) =>
                  setLimit(Math.min(100, Math.max(1, e.target.value)))
                }
                min="1"
                max="100"
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
              />
            </div>
          </div>
          <button
            onClick={analyzeSentiment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Analyze Sentiment"}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-800/20 text-red-300 rounded-lg">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-white">
            r/{results.subreddit} Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-700/20 p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                Sentiment Distribution
              </h3>
              <div className="h-64">
                {chartData && (
                  <Doughnut
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: "#fff",
                            font: { size: 14 },
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-gray-700/20 p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <StatItem label="Total Posts" value={results.total_posts} />
                <StatItem
                  label="Positive"
                  value={results.sentiment_distribution?.positive || 0}
                  color="text-green-400"
                />
                <StatItem
                  label="Neutral"
                  value={results.sentiment_distribution?.neutral || 0}
                  color="text-yellow-400"
                />
                <StatItem
                  label="Negative"
                  value={results.sentiment_distribution?.negative || 0}
                  color="text-red-400"
                />
              </div>
            </div>
          </div>

          <PostList posts={results.posts} />

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => exportToCSV(results)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportToPDF(results)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400">{label}:</span>
    <span className={`font-medium ${color}`}>{value}</span>
  </div>
);

StatItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
};

export default SentimentAnalysis;
