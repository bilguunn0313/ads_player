import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlayerPage from "./pages/PlayerPage";
import ManagePage from "./pages/ManagePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerPage />} />
        <Route path="/manage" element={<ManagePage />} />
      </Routes>
    </BrowserRouter>
  );
}
