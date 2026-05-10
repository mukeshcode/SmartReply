"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation'; // add this import at top
import {login} from '../apis/api'

interface LoginPayload {
  username: string;
  password: string;
}

interface Errors {
  username?: string;
  password?: string;
}

export default function Login() {
  // inside your component:
  const router = useRouter();
  const [form, setForm] = useState<LoginPayload>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Errors = {};

    if (!form.username.trim())
      e.username = "Username is required";

    if (form.password.length < 8)
      e.password = "Minimum 8 characters required";

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try{
      const data=await login(form);
      localStorage.setItem('smartreply_token', data.token);
      router.push('/dashboard');  // ← add this line
      setSuccess(true);
    }
    catch(e){
      console.log(e)
    }
    finally{
      setLoading(false);
    }

  };

  // if (success) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-gray-50">
  //       <p className="text-green-600 text-sm font-medium animate-fade-in">
  //         ✅ Logged in successfully!
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-gray-200">
        
        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Welcome Back
        </h2>

        <div className="space-y-5">

          {/* Username */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              placeholder="john_doe"
              value={form.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white/80 
              focus:outline-none focus:ring-2 transition-all duration-200
              ${
                errors.username
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-black/20 focus:border-black"
              }`}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1 animate-pulse">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white/80 
              focus:outline-none focus:ring-2 transition-all duration-200
              ${
                errors.password
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-black/20 focus:border-black"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 animate-pulse">
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 py-2 rounded-lg bg-black text-white text-sm font-medium 
          hover:bg-gray-900 active:scale-[0.98] transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login →"}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Don’t have an account?{" "}
          <span className="text-black cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}