import { useEffect } from 'react';
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/api';

export default function Register() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [fullName, setFullName] = useState(''); 
const [departmentId, setDepartmentId] = useState('');
const [university, setUniversity] = useState('');
const [universityId, setUniversityId] = useState('');
const [error, setError] = useState(null);
const [idDocument, setIdDocument] = useState(null);
const [departments, setDepartments] = useState([]);


///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

useEffect(() => {
  apiFetch('/departments')
    .then(setDepartments)
    .catch((err) => setError(err.message));
}, []);

//////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

async function handleSubmit(e) {
  e.preventDefault();
  setError(null);
  try {
    let session;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError?.message?.includes('already registered')) {
      // Likely an orphaned auth user from a previous failed complete-profile.
      // Try signing in with the same credentials to recover the session.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signUpError; // truly someone else's account — surface the original error
      session = signInData.session;
    } else if (signUpError) {
      throw signUpError;
    } else {
      session = signUpData.session;
    }

    await apiFetch('/auth/complete-profile', {
      method: 'POST',
      body: JSON.stringify({ fullName, role, departmentIds: [departmentId] }),
    });

    window.location.href = '/planner';
  } catch (err) {
    setError(err.message);
  }
}

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">

        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            Create your account
          </h1>

          <p className="text-slate-400 mt-2">
            Join your university's planning system.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">

          <form className="space-y-6" onSubmit={handleSubmit}>

       

            <div>
                <label className="block text-sm text-slate-300 mb-2">
                  full name
                </label>

                <input
                  type="text"
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="full name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                             focus:outline-none focus:border-indigo-500"
                />
              </div>
            

           
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

          
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Account type
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500"
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="admin">Department Admin</option>
              </select>
            </div>

        
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                University
              </label>

              <select onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500"
              >
                <option>Select university</option>
                <option>USTO MB</option>
              </select>
            </div>

           
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Department
              </label>

             <select onChange={(e) => setDepartmentId(e.target.value)}  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500">
  <option value="">Select department</option>
  {departments.map((d) => (
    <option key={d.id} value={d.id}>{d.name}</option>
  ))}
</select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                University ID
              </label>

              <input
                type="text"
                onChange={(e) => setUniversityId(e.target.value)}
                placeholder="Your university ID"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

       
            {role !== "admin" && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Verification document
                </label>
<input
  type="file"
  id="idDocument"
  className="hidden"
  onChange={(e) => setIdDocument(e.target.files[0])}
/>
<label
  htmlFor="idDocument"
  className="mt-3 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm transition inline-block cursor-pointer"
>
  {idDocument ? idDocument.name : "Choose file"}
</label>
              </div>
            )}

          
            {role === "admin" && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Invitation / Admin code
                </label>

                <input
                  type="text"
                  placeholder="Enter the code provided by the superadmin"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700
                             focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                         font-medium transition"
                        //     onClick={() => {
                        //   // Handle login logic here
                        //   // For now, just redirect to the planner page
                        //   window.location.href = "/planner";
                        // }}
            >
              Create account
            </button>

          </form>

          <div className="text-center mt-6 text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

