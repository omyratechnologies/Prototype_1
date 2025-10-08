import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdEyeOff, IoMdEye } from "react-icons/io";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();

  // Get redirect path if user was redirected from another page
  const from = location.state?.from?.pathname || "/";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear any existing errors when user starts typing
    if (error) {
      clearError();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      return;
    }

    setIsLoading(true);
    
    const result = await login({
      email: form.email,
      password: form.password,
    });

    setIsLoading(false);

    if (result.success) {
      console.log("✅ Login successful:", result.user);
      console.log("➡️ Redirecting back to:", from);
      navigate(from, { replace: true });
    }
    // Error is handled by the AuthContext and displayed via the error state
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white relative">
      {/* Back Arrow (top-left) */}
      <button
        className="absolute top-6 left-8"
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back"
        title="Back"
      >
        <span className="text-2xl text-black">&#8592;</span>
      </button>

      {/* Login Form */}
      <form
        className="flex flex-col items-center justify-center w-full px-4"
        style={{ maxWidth: 400 }}
        onSubmit={handleSubmit}
      >
        <h1 className="text-black font-bold text-3xl mb-8 text-center">Login</h1>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email address"
          className="w-full h-12 px-4 mb-4 rounded border border-black focus:border-black focus:outline-none transition placeholder:text-gray-400"
          autoComplete="email"
          required
        />

        <div className="relative w-full mb-2">
          <input
            type={showPwd ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full h-12 px-4 pr-10 rounded border border-black focus:border-black focus:outline-none transition placeholder:text-gray-400"
            autoComplete="current-password"
            required
          />
          <span
            className="absolute right-3 top-[14px] cursor-pointer text-xl opacity-60"
            onClick={() => setShowPwd((v) => !v)}
            title="Toggle password visibility"
          >
            {showPwd ? <IoMdEyeOff /> : <IoMdEye />}
          </span>
        </div>

        <div className="w-full flex justify-center mt-0.5 mb-5">
          <span className="text-xs text-gray-400 text-center">
            Forgotten your login details?{" "}
            <a href="#" className="text-black font-semibold hover:underline">
              Get help with logging in.
            </a>
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full max-w-xs h-12 bg-black text-white font-medium rounded transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>

        {error && (
          <div className="text-red-500 text-xs mt-3 text-center max-w-xs">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <a href="#" className="text-black font-semibold hover:underline">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
