"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "@/context/AuthContext";

type RegisterBlok = SbBlokData & {
  title?: string;
  buttonText?: string;
  successText?: string;
  backgroundColor?: string;
};

export default function Register({ blok }: { blok: RegisterBlok }) {
  const [title, setTitle] = useState("Prof");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const isRecaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA === "true";
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const resetRecaptcha = () => {
    if (isRecaptchaEnabled) {
      recaptchaRef.current?.reset();
      setRecaptchaToken("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setShowSuccess(false);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (isRecaptchaEnabled && !recaptchaToken) {
      setErrorMessage("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, firstName, lastName, email, password, recaptchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(true);
        // Auto-login after successful registration
        const loginRes = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (loginRes.ok) {
          await checkAuth();
          setTimeout(() => router.push("/"), 1000);
        }
      } else {
        setErrorMessage(data.message || "Registration failed.");
        resetRecaptcha();
      }
    } catch (err) {
      setErrorMessage("Something went wrong.");
      console.error(err);
      resetRecaptcha();
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
          background: blok?.backgroundColor || "#f3f4f6",
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
        background: blok?.backgroundColor || "#f3f4f6",
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
          {blok?.title || "Register"}
        </h1>

        <label>Title</label>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "0.25rem",
            border: "1px solid #ccc",
          }}
        >
          <option value="Prof">Prof</option>
          <option value="A/Prof">A/Prof</option>
          <option value="Dr">Dr</option>
        </select>

        <label>First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
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

        <label>Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
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
            marginBottom: "1rem",
            borderRadius: "0.25rem",
            border: "1px solid #ccc",
          }}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

        {isRecaptchaEnabled && recaptchaSiteKey && (
          <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={recaptchaSiteKey}
              onChange={(token) => setRecaptchaToken(token || "")}
              onExpired={() => setRecaptchaToken("")}
              onErrored={() => setRecaptchaToken("")}
            />
          </div>
        )}

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
          {isSubmitting ? "Loading..." : (blok?.buttonText || "Register")}
        </button>

        {/* Error message */}
        {errorMessage && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {errorMessage}
          </p>
        )}

        {/* Success message */}
        {showSuccess && (
          <p style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>
            {blok?.successText || "Registration successful!"}
          </p>
        )}
      </form>
    </div>
  );
}
