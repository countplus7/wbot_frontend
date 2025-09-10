import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { AuthPage } from "@/pages/AuthPage";
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
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route
                path="/auth"
                element={
                  <AuthGuard requireAuth={false}>
                    <AuthPage />
                  </AuthGuard>
                }
              />

              {/* Protected routes */}
              <Route
                path="/businesses"
                element={
                  <AuthGuard requireAuth={true}>
                    <div className="h-screen">
                      {/* Main content */}
                      <div className="w-full flex flex-col">
                        <Header />
                        <div className="w-full overflow-auto p-6">
                          <Index />
                        </div>
                      </div>
                    </div>
                  </AuthGuard>
                }
              />

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/businesses" replace />} />

              {/* Catch all - redirect to businesses */}
              <Route path="*" element={<Navigate to="/businesses" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
