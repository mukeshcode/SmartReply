"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../apis/api";
interface SignupPayload {
  username: string;
  emailid: string;
  password: string;
}
interface Errors {
  username?: string;
  emailid?: string;
  password?: string;
}


export default function Signup() {
  const router = useRouter()
  const [form, setForm] = useState<SignupPayload>({
    username: "",
    emailid: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Errors = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailid))
      e.emailid = "Enter a valid email";
    if (form.password.length < 8)
      e.password = "Minimum 8 characters required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try{
      await signup(form);
      router.push("/login");
      setSuccess(true);
    }
    catch(e){
      console.error(e);
    }
    finally{
      setLoading(false);
    }
 
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-green-600 text-sm font-medium animate-fade-in">
          ✅ Account created successfully!
        </p>
      </div>
    );
  }

  const fields = [
    { name: "username", type: "text", placeholder: "John Doe" },
    { name: "emailid", type: "email", placeholder: "john@example.com" },
    { name: "password", type: "password", placeholder: "••••••••" },
  ] as const;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-gray-200">
        
        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Create Account
        </h2>

        <div className="space-y-5">
            
          {fields.map(({ name, type, placeholder }) => (
            <div key={name} className="relative">
              <label className="block text-xs text-gray-500 mb-1 capitalize">
                {name}
              </label>

              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white/80 
                focus:outline-none focus:ring-2 transition-all duration-200
                ${
                  errors[name]
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-black/20 focus:border-black"
                }`}
              />

              {errors[name] && (
                <p className="text-xs text-red-500 mt-1 animate-pulse">
                  {errors[name]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 py-2 rounded-lg bg-black text-white text-sm font-medium 
          hover:bg-gray-900 active:scale-[0.98] transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Account →"}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Already have an account?{" "}
          <span className="text-black cursor-pointer hover:underline">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}