import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router";
import Layout from "./layout";
import Home from "./home/page";
import NewClientPage from "./clients/page";
import OrdersListPage from "./orders-list/page";
import OrdersPage from "./orders/page";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<OrdersListPage />} />
          <Route path="/orders/new" element={<OrdersPage />} />
          <Route path="/clients/new" element={<NewClientPage />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
