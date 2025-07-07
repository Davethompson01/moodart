
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/providers/Web3Provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <Web3Provider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </Web3Provider>
);

export default App;
