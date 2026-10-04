import AItest from "./AItest";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./style.css";
import AddClothing from "./AddClothing";
import MyCloset from "./MyCloset";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <header className="header">
          <div className="logo">
            Kloset.in
          </div>

          <nav className="nav">
            <Link to="/">My Closet</Link>
            <Link to="/add-clothing">Add Clothing</Link>
          </nav>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<MyCloset />} />
            <Route path="/add-clothing" element={<AddClothing />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
  return <AItest />;
}

export default App;