import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <Index />
        </div>
        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
