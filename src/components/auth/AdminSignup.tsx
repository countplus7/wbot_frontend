import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserPlus, Mail, User, Lock } from "lucide-react";
import { authService, type SignupCredentials } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/api-client";

interface AdminSignupProps {
  onSignupSuccess: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
}

export const AdminSignup: React.FC<AdminSignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<SignupCredentials & { confirmPassword: string }>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await authService.checkAdminExists();
      if (response.success) {
        const adminExists = response.data?.adminExists;
        setAdminExists(adminExists);
      } else {
        setAdminExists(false);
      }
    } catch (err) {
      console.error("Error checking admin existence:", err);
      setAdminExists(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await authService.signup(signupData);

      if (response.success && response.data) {
        onSignupSuccess(response.data.user, response.data.token);
      } else {
        setError(response.error || "Signup failed");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (adminExists) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Admin Already Exists
          </CardTitle>
          <CardDescription>An admin account already exists. Please use the login form.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onSwitchToLogin} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <UserPlus className="h-6 w-6" />
          Create Admin Account
        </CardTitle>
        <CardDescription>Set up the first admin account for your WhatsApp Bot</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-start space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              disabled={loading}
            />
          </div>

          <div className="text-start space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="text-start space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password (min 6 characters)"
              disabled={loading}
            />
          </div>

          <div className="text-start space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Admin Account"}
          </Button>

          <div className="text-center">
            <Button type="button" variant="link" onClick={onSwitchToLogin} disabled={loading}>
              Already have an account?
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
