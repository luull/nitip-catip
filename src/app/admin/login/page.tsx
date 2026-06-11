"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import NbButton from "@/components/ui/NbButton";
import NbInput from "@/components/ui/NbInput";
import NbCard from "@/components/ui/NbCard";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF8FB] flex items-center justify-center"><div className="w-16 h-16 border-8 border-black border-t-pink animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/login");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            window.location.href = "/admin";
          }
        }
      } catch {}
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = "/admin";
      } else {
        setError(data.error || "Login gagal");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8FB] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green border-4 border-black shadow-nb mb-2">
            <ShieldCheck className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider">
            Admin Panel
          </h1>
          <p className="font-bold text-black/60 text-sm">
            Masuk untuk mengelola Nitip Catip
          </p>
        </div>

        {/* Session expired notice */}
        {isExpired && (
          <NbCard variant="pink-light" className="p-4 border-4 border-black text-center">
            <p className="font-black text-sm">⏰ Sesi telah berakhir. Silakan login kembali.</p>
          </NbCard>
        )}

        {/* Login Form */}
        <NbCard variant="white" className="p-8 border-4 border-black shadow-nb">
          <form onSubmit={handleLogin} className="space-y-5">
            <NbInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              requiredMark
            />

            <div className="relative">
              <NbInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                requiredMark
                error={error}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-black/50 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-500 p-3 text-sm font-bold text-red-700">
                ❌ {error}
              </div>
            )}

            <NbButton
              variant="pink"
              className="w-full text-base"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
                  LOGIN...
                </span>
              ) : (
                "LOGIN"
              )}
            </NbButton>
          </form>
        </NbCard>

        <p className="text-center text-xs font-bold text-black/40">
          🔒 Hanya admin yang dapat mengakses panel ini
        </p>
      </div>
    </div>
  );
}
