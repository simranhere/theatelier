import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "./api";

interface LoginFormState {
  emailid: string;
  pwd: string;
}

interface TouchedState {
  emailid: boolean;
  pwd: boolean;
}

type FormErrors = Partial<Record<keyof LoginFormState, string>>;

const INITIAL_STATE: LoginFormState = { emailid: "", pwd: "" };
const INITIAL_TOUCHED: TouchedState = { emailid: false, pwd: false };

export default function Login() {
  const navigate = useNavigate(); //  Called at TOP LEVEL — was incorrectly inside useEffect before

  const [form, setForm] = useState<LoginFormState>(INITIAL_STATE);
  const [touched, setTouched] = useState<TouchedState>(INITIAL_TOUCHED);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── AUTO-LOGIN: if token + user already in localStorage, redirect immediately ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (token && userRaw) {
      try {
        const parsedUser = JSON.parse(userRaw);
        redirectByRole(parsedUser?.utype);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  function redirectByRole(utype: string) {
    if (utype === "Admin") navigate("/admin-dashboard");
    else if (utype === "Customer") navigate("/customer-dashboard");
    else if (utype === "Tailor") navigate("/tailor-dashboard");
  }

  const validateField = (name: keyof LoginFormState, value: string): string => {
    switch (name) {
      case "emailid":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Enter a valid email address";
        return "";
      case "pwd":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters required";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    (Object.keys(form) as (keyof LoginFormState)[]).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) nextErrors[key] = err;
    });
    return nextErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof LoginFormState, value) }));
    setServerMessage("");
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof LoginFormState;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const doLogin = async () => {
    setServerMessage("");
    const nextErrors = validateForm();
    setErrors(nextErrors);
    setTouched({ emailid: true, pwd: true });
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const resp = await axios.post(
        "https://the-atelier-phi.vercel.app/user/login",
        { emailid: form.emailid.trim(), pwd: form.pwd },
        { headers: { "Content-Type": "application/json" } }
      );

      if (resp.data.status) {
        const user = resp.data.doc;
        const token = resp.data.token;

        if (!user?.utype) {
          setServerMessage("User role missing in response.");
          return;
        }

        localStorage.setItem("user", JSON.stringify(user));
        if (token) localStorage.setItem("token", token);

        // Optional auth verification call
        try {
          await api.post("/user/finduser", { emailid: user.emailid });
        } catch {
          console.log("Auth verify call failed (non-critical)");
        }

        setUserType(user.utype);
        setServerMessage("Login successful. Redirecting...");

       
        setTimeout(() => redirectByRole(user.utype), 1200);
      } else {
        setServerMessage(resp.data.msg || "Invalid credentials");
      }
    } catch (err: any) {
      setServerMessage(err?.response?.data?.msg || "Login failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof LoginFormState) =>
    `w-full px-4 py-3 rounded-lg bg-[#F8F3E8] border ${touched[field] && errors[field] ? "border-red-500" : "border-[#D6C7A8]"
    } outline-none focus:ring-2 focus:ring-[#C6A75E]`;

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #F5EDD8 0%, #E8D5B0 100%)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@300;400;600&display=swap');`}</style>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-[420px] p-10 rounded-2xl shadow-2xl"
        style={{
          background: "rgba(255,252,245,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(198,167,94,0.3)",
        }}
      >
        <h2
          className="text-5xl text-center text-[#2A2A2A] mb-2"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Welcome Back
        </h2>
        <p className="text-center text-[#6B5B3E] mb-8 text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Sign in to continue your bespoke journey
        </p>

        {serverMessage && (
          <div
            className={`text-sm text-center mb-4 px-4 py-2 rounded-lg ${serverMessage.includes("successful") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
          >
            {serverMessage}
          </div>
        )}

        {/* EMAIL */}
        <div className="mb-5">
          <label className="block text-sm mb-2 text-[#2A2A2A] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Email Address
          </label>
          <input
            type="email"
            name="emailid"
            value={form.emailid}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            className={inputClass("emailid")}
          />
          {touched.emailid && errors.emailid && (
            <p className="text-red-500 text-xs mt-1">{errors.emailid}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="mb-6 relative">
          <label className="block text-sm mb-2 text-[#2A2A2A] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="pwd"
            value={form.pwd}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="••••••••"
            className={`${inputClass("pwd")} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[62%] -translate-y-1/2 text-[#7A5C2E]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {touched.pwd && errors.pwd && (
            <p className="text-red-500 text-xs mt-1">{errors.pwd}</p>
          )}
        </div>

        <button
          onClick={doLogin}
          disabled={isSubmitting}
          className="w-full py-3 rounded-full text-white font-semibold hover:scale-105 transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #C6A75E, #A8843C)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", letterSpacing: "0.06em" }}
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-center mt-5 text-sm text-[#6B5B3E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          New here?{" "}
          <a href="/signup" className="text-[#A8843C] font-semibold hover:underline">
            Create an account
          </a>
        </p>

        {userType && (
          <p className="text-center mt-3 text-[#6B5B3E] text-sm">
            Logged in as: <b>{userType}</b>
          </p>
        )}
      </motion.div>
    </div>
  );
}