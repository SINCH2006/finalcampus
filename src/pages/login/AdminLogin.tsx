// src/pages/login/AdminLogin.tsx
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loginEmail, loginGoogle, signUpEmail, getUserRole, createUserProfile, setUserRole, logout } from "../../firebase";
import { auth } from "../../firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  useEffect(() => {
    const checkAndClear = async () => {
      if (auth.currentUser) {
        console.log("Clearing existing session for fresh admin login");
        await logout().catch(console.error);
      }
    };
    checkAndClear();
  }, []);

  const createAdminProfile = async (user: any) => {
    console.log("Creating admin profile for:", user.uid);
    
    try {
      await createUserProfile(user.uid, {
        email: user.email,
        role: 'ADMIN',
        name: user.displayName || user.email?.split('@')[0] || 'Admin',
      });
      
      await setUserRole(user.uid, 'ADMIN');
      
      console.log("✅ Admin profile created successfully");
      return true;
    } catch (error) {
      console.error("❌ Error creating admin profile:", error);
      throw error;
    }
  };

  const handleSuccess = async (user: any, isNewUser: boolean = false) => {
    if (!user) {
      setErr("Login failed—no user returned.");
      setLoading(false);
      return;
    }

    try {
      console.log("User signed in:", user.uid);
      setSuccess("Verifying admin access...");
      
      await user.getIdToken(true);
      
      if (isNewUser) {
        console.log("New user signup - creating admin profile");
        await createAdminProfile(user);
        setSuccess("Admin profile created! Redirecting to admin dashboard...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("Redirecting to /admin/dashboard");
        window.location.replace("/admin/dashboard");
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let role = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          role = await getUserRole(user.uid);
          if (role) {
            console.log("Found role:", role);
            break;
          }
        } catch (e: any) {
          console.log(`Attempt ${attempts + 1} failed:`, e);
          
          if (attempts === maxAttempts - 1) {
            console.log("No profile found after retries, creating admin profile");
            try {
              await createAdminProfile(user);
              role = 'ADMIN';
              break;
            } catch (createError) {
              console.error("Failed to create profile:", createError);
            }
          }
        }
        
        attempts++;
        if (!role && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      if (!role) {
        setErr("Could not verify admin access. Please contact support.");
        await logout();
        setLoading(false);
        return;
      }
      
      if (role.toUpperCase() === "ADMIN") {
        console.log("✅ Admin access granted - redirecting to admin dashboard");
        setSuccess("Access granted! Redirecting to admin dashboard...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.location.replace("/admin/dashboard");
      } else {
        setErr(`This account has role "${role}". Admin access required. Signing out...`);
        await logout();
        setLoading(false);
      }
    } catch (e: any) {
      console.error("Error during login:", e);
      setErr(e.message || "An error occurred during login.");
      try {
        await logout();
      } catch (signOutError) {
        console.error("Sign out error:", signOutError);
      }
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setErr("Please enter both email and password.");
      return;
    }
    
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    
    setErr(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      setSuccess("Creating admin account...");
      const user = await signUpEmail(email, password);
      console.log("New user created:", user.uid);
      await handleSuccess(user, true);
    } catch (e: any) {
      console.error("Sign up error:", e);
      
      let errorMessage = "Sign up failed.";
      if (e.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try signing in instead.";
        setIsSignUpMode(false);
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (e.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Use at least 6 characters.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setErr(errorMessage);
      setSuccess(null);
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setErr("Please enter both email and password.");
      return;
    }
    
    setErr(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      setSuccess("Signing in...");
      const user = await loginEmail(email, password);
      await handleSuccess(user, false);
    } catch (e: any) {
      console.error("Sign in error:", e);
      
      let errorMessage = "Sign in failed.";
      if (e.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Try signing up instead.";
      } else if (e.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (e.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (e.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setErr(errorMessage);
      setSuccess(null);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErr(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      setSuccess("Opening Google sign-in...");
      const user = await loginGoogle();
      
      const role = await getUserRole(user.uid).catch(() => null);
      const isNewUser = !role;
      
      await handleSuccess(user, isNewUser);
    } catch (e: any) {
      console.error("Google sign in error:", e);
      
      let errorMessage = "Google sign-in failed.";
      if (e.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed.";
      } else if (e.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign-in was cancelled.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setErr(errorMessage);
      setSuccess(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Card className="max-w-md w-full p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">
          {isSignUpMode ? "Create Admin Account" : "Admin Sign In"}
        </h2>
        
        {err && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {err}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
            {success}
          </div>
        )}

        <label className="block text-sm mb-2 font-medium">Email</label>
        <input
          className="w-full p-3 border rounded-lg mb-4"
          placeholder="admin@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <label className="block text-sm mb-2 font-medium">Password</label>
        <input
          className="w-full p-3 border rounded-lg mb-6"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              isSignUpMode ? handleSignUp() : handleSignIn();
            }
          }}
        />

        {isSignUpMode ? (
          <>
            <Button onClick={handleSignUp} disabled={loading} className="w-full mb-3">
              {loading ? "Creating Account..." : "Create Admin Account"}
            </Button>
            <Button
              onClick={() => setIsSignUpMode(false)}
              disabled={loading}
              variant="outline"
              className="w-full mb-3"
            >
              Already have an account? Sign In
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleSignIn} disabled={loading} className="w-full mb-3">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              onClick={() => setIsSignUpMode(true)}
              disabled={loading}
              variant="outline"
              className="w-full mb-3"
            >
              Don't have an account? Sign Up
            </Button>
          </>
        )}

        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <Button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900"
        >
          {loading ? "Please wait..." : "Sign in with Google"}
        </Button>

        <div className="mt-4 p-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">
          <strong>Note:</strong> All accounts created through this page will automatically be assigned admin role.
        </div>
      </Card>
    </div>
  );
}