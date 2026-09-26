import { useEffect } from "react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";

export default function Register() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [university, setUniversity] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [error, setError] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  //const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
 
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    apiFetch("/departments")
      .then(setDepartments)
      .catch((err) => setError(err.message));
  }, []);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  //adding helpers here,because i am tired to create a new file
  //the domains will be backended later when i add moore universities...now we usto it only
  const UNIVERSITY_DOMAINS = {
    "USTO MB": "etu.univ-usto.dz",
  };
  const domain = UNIVERSITY_DOMAINS[university];
  const emailValid = !!domain && email.toLowerCase().endsWith(`@${domain}`);
  const nameValid = fullName.trim().includes(" ") && !/\d/.test(fullName.trim());

  const errors = getErrors();


  

  function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
  }

  const STRENGTH_LABELS = [
    "Very weak",
    "Weak",
    "Okay",
    "Good",
    "Strong",
    "Very strong",
  ]; //should we customize like glaukopis?
  const STRENGTH_STYLES = [
    "bg-red-500 w-1/5",
    "bg-orange-500 w-2/5",
    "bg-yellow-500 w-3/5",
    "bg-lime-500 w-4/5",
    "bg-green-500 w-full",
    "bg-green-500 w-full",
  ];

  function getErrors() {
    const errs = {};

    const trimmedName = fullName.trim();
    if (!trimmedName) errs.fullName = "Full name is required";
    else if (!trimmedName.includes(" "))
      errs.fullName = "Enter first and last name";
    else if (/\d/.test(trimmedName))
      errs.fullName = "Name can't contain numbers";

    if (!university) {
      errs.university = "Select your university";
    }

    if (!email) {
      errs.email = "Email is required";
    } else if (university) {
      const domain = UNIVERSITY_DOMAINS[university];
      // if (domain && !email.toLowerCase().endsWith(`@${domain}`)) {
      //   errs.email = `Must be a @${domain} email`;
      // }
      if (university && !email.toLowerCase().endsWith(`@${UNIVERSITY_DOMAINS[university]}`)) {
  errs.email = `Must be a @${UNIVERSITY_DOMAINS[university]} email`;
}
    }

    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "At least 8 characters";

    if (!departmentId) errs.departmentId = "Select your department";

    if (role === "student" && !universityId.trim()) {
      errs.universityId = "University ID is required";
    }

    if (role !== "admin" && !idDocument) {
      errs.idDocument = "Upload a verification document";
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
   setSubmitted(true);
  if (Object.keys(errors).length > 0) return;
    try {
      let session;
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({ email, password });

      if (signUpError?.message?.includes("already registered")) {
        // Likely an orphaned auth user from a previous failed complete-profile.
        // Try signing in with the same credentials to recover the session.
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signUpError; // truly someone else's account — surface the original error
        session = signInData.session;
      } else if (signUpError) {
        throw signUpError;
      } else {
        session = signUpData.session;
      }
      if (!session) {
        // Email confirmation required — don't call complete-profile yet.
        // Profile completion has to happen after they confirm + log in.
        setPendingConfirmation(true);
        return;
      }

      await apiFetch("/auth/complete-profile", {
        method: "POST",
        body: JSON.stringify({ fullName, role, departmentIds: [departmentId] }),
      });

      window.location.href = "/planner";
    } catch (err) {
      setError(err.message);
    }
  }


  // const isFormValid =
  // nameValid &&
  // emailValid &&
  // password.length >= 8 &&
  // passwordStrength >= 3 &&
  // !departmentId &&
  // (role !== "student" || universityId.trim().length > 0) &&
  // (role === "admin" || !!idDocument);
  const isFormValid = Object.keys(errors).length === 0 && passwordStrength >= 3;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Create your account</h1>

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
                onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                placeholder="full name"
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                            focus:outline-none focus:border-indigo-500
${(touched.fullName || submitted) && errors.fullName ? "border-red-500" : "border-slate-700"}`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Email</label>

              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                           focus:outline-none focus:border-indigo-500
                           ${(touched.email || submitted) && errors.email ? "border-red-500" : "border-slate-700"}`}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrength(getPasswordStrength(e.target.value));
                }}
                placeholder="Create a password"
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                          focus:outline-none focus:border-indigo-500
                           ${(touched.password || submitted) && errors.password ? "border-red-500" : "border-slate-700"}`}
              />
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${STRENGTH_STYLES[passwordStrength]}`}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {STRENGTH_LABELS[passwordStrength]}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Account type
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, role: true }))}
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                           focus:outline-none focus:border-indigo-500
                           ${(touched.role || submitted) && errors.role ? "border-red-500" : "border-slate-700"}`}
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

              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, university: true }))}
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                           focus:outline-none focus:border-indigo-500
                           ${(touched.university || submitted) && errors.university ? "border-red-500" : "border-slate-700"}`}
              >
                <option>Select university</option>
                <option>USTO MB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Department
              </label>

              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, departmentId: true }))}
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                           focus:outline-none focus:border-indigo-500
                            ${(touched.departmentId || submitted) && errors.departmentId ? "border-red-500" : "border-slate-700"}`}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {(touched.departmentId || submitted) && errors.departmentId && (
 <p className="text-xs text-red-400 mt-1">{errors.departmentId}</p>
)}
            </div>

           {role === "student" && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">University ID</label>
                <input
                  type="text"
                  onChange={(e) => setUniversityId(e.target.value)}
                  placeholder="Your university ID"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                             focus:outline-none focus:border-indigo-500
                             ${(touched.universityId || submitted) && errors.universityId ? "border-red-500" : "border-slate-700"}`}
                />
                {errors.universityId && <p className="text-xs text-red-400 mt-1">{errors.universityId}</p>}
              </div>
            )}

            {role !== "admin" && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Verification document
                </label>
                <input
                  type="file"
                  id="idDocument"
                  className="hidden"
  //                 onChange={(e) => setIdDonChange={(e) => {
  //  setIdDocument(e.target.files[0]);
  //   setTouched((t) => ({ ...t, idDocument: true }));
  // }}}

  onChange={(e) => {
  setIdDocument(e.target.files[0]);
  setTouched((t) => ({ ...t, idDocument: true }));
}}
                />
                <label
                  htmlFor="idDocument"
                 className={`mt-3 px-4 py-2 rounded-lg text-sm transition inline-block cursor-pointer
                             ${(touched.idDocument || submitted) && errors.idDocument ? "bg-slate-800 border border-red-500" : "bg-slate-800 hover:bg-slate-700"}`}
 >
                  {idDocument ? idDocument.name : "Choose file"}
                </label>
                {(touched.idDocument || submitted) && errors.idDocument && (
 <p className="text-xs text-red-400 mt-1">{errors.idDocument}</p>
)}
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
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950 border
                             focus:outline-none focus:border-indigo-500
                             ${(touched.adminCode || submitted) && errors.adminCode ? "border-red-500" : "border-slate-700"}`}
                />
              </div>
            )}

            <button
              type="submit"
              // disabled={!isFormValid}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                          font-medium transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              Create account
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
