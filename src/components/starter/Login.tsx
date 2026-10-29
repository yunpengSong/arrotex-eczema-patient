"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import { useAuth } from "@/context/AuthContext";

type LoginBlok = SbBlokData & {
  title?: string;
  buttonText?: string;
  successText?: string;
  backgroundColor?: string;
};

export default function Login({ blok }: { blok: LoginBlok }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("error") || "";
    }
    return "";
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, checkAuth, autoLoginError } = useAuth();
  const router = useRouter();

  const displayError = errorMessage || autoLoginError;

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setShowSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(true);
        await checkAuth();
        setTimeout(() => router.push("/"), 1000);
      } else {
        setErrorMessage(data.message || "Email or Password error.");
      }
    } catch (err) {
      setErrorMessage("Something went wrong.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        {...storyblokEditable(blok)}
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: blok.backgroundColor || "#f3f4f6",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return null; // Already logged in; the useEffect redirects, render nothing
  }

  return (
    <div
      {...storyblokEditable(blok)}
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: blok.backgroundColor || "#f3f4f6",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          {blok.title || "Login"}
        </h1>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "0.25rem",
            border: "1px solid #ccc",
          }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1.5rem",
            borderRadius: "0.25rem",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            background: isSubmitting ? "#93c5fd" : "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {isSubmitting ? "Loading..." : (blok.buttonText || "Login")}
        </button>

        {/* Error message */}
        {displayError && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {displayError}
          </p>
        )}

        {/* Success message */}
        {showSuccess && (
          <p style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>
            {blok.successText || "Login success."}
          </p>
        )}
      </form>
    </div>
  );
}
