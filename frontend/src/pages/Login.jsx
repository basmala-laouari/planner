
import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";


export default function Login() {


 const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    window.location.href = "/planner";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            UniPlanner
          </h1>
          <p className="text-slate-400 mt-2">
            University collaborative planner
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl" >
          <h2 className="text-2xl font-semibold mb-2">
            Welcome back
          </h2>

          <p className="text-slate-400 mb-8">
            Sign in to access your planner.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

          
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bruh@hello.there"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

           
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="fucking password"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                        font-medium transition"
                        //  onClick={() => {
                        //   // Handle login logic here
                        //   // For now, just redirect to the planner page
                        //   window.location.href = "/planner";
                        // }}
            >
              Login
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Create one
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

