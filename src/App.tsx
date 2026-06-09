import { Routes, Route } from "react-router-dom";
import "./App.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Analyze from "./pages/Analyze";

export default function App() {
  return (
    <div className="site">
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="*" element={<Landing />} />
      </Routes>
      <Footer />
    </div>
  );
}
