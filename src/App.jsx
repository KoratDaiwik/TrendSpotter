import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import Trends from "./pages/Trends";
import Report from "./pages/Report"; // ✅ Import it
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import "./styles/leaflet-fix.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sentiment-analysis" element={<SentimentAnalysis />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/report" element={<Report />} /> {/* ✅ Now added */}
            </Routes>
          </ErrorBoundary>
        </div>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
