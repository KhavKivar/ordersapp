import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router";
import Home from "./home/page";
import NewClientPage from "./clients/new/page";
import OrdersPage from "./orders/page";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/clients/new" element={<NewClientPage />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
