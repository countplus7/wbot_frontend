import React, { useState } from "react";
import { AdminLogin } from "@/components/auth/AdminLogin";
import { AdminSignup } from "@/components/auth/AdminSignup";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup";

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (user: any, token: string) => {
    login(user, token);
    navigate("/businesses");
  };

  const handleSignupSuccess = (user: any, token: string) => {
    login(user, token);
    navigate("/businesses");
  };

  const switchToSignup = () => setMode("signup");
  const switchToLogin = () => setMode("login");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {mode === "login" ? (
          <AdminLogin onLoginSuccess={handleLoginSuccess} onSwitchToSignup={switchToSignup} />
        ) : (
          <AdminSignup onSignupSuccess={handleSignupSuccess} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
};
