import { Routes, Route, Link } from "react-router-dom";
import Fixture from "./pages/Fixture";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="app-container">
      <nav className="top-nav">
        <Link to="/">Fixture</Link>
        <Link to="/admin">Admin Panel</Link>
      </nav>

      <main className="content-view">
        <Routes>
          <Route path="/" element={<Fixture />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}
