import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import atelierBg from "../assets/atelier.png";
import customerImg from "../assets/customer.png";
import tailorImg from "../assets/tailor.png";
import adminImg from "../assets/admin.png";

interface SignupFormState {
  emailid: string;
  pwd: string;
  utype: string;
}

const INITIAL_STATE: SignupFormState = { emailid: "", pwd: "", utype: "" };

export default function Signup() {
  const navigate = useNavigate(); //  initialized here

  const [form, setForm] = useState<SignupFormState>(INITIAL_STATE);
  const [serverMessage, setServerMessage] = useState("");
  const [touched, setTouched] = useState({ emailid: false, pwd: false, utype: false });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailid);

  const passwordRules = {
    length: form.pwd.length >= 8,
    upper: /[A-Z]/.test(form.pwd),
    lower: /[a-z]/.test(form.pwd),
    number: /[0-9]/.test(form.pwd),
    special: /[^A-Za-z0-9]/.test(form.pwd),
  };
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const userTypeValid = form.utype !== "";

  function doSignup() {
    setTouched({ emailid: true, pwd: true, utype: true });

    if (!emailValid || !passwordValid || !userTypeValid) {
      setServerMessage("Please fill all fields correctly");
      return;
    }

    axios.post("https://theatelier-wheat.vercel.app/user/signup", form)
      .then((response) => {
        if (response.data.status) {
          setServerMessage("Signup successful. Redirecting to login...");
          setTimeout(() => navigate("/login"), 1500); 
        } else {
          setServerMessage(response.data.msg);
        }
      })
      .catch(() => {
        setServerMessage("Error signing up");
      });
  }

  const leftImage =
    form.utype === "Customer" ? customerImg :
    form.utype === "Tailor" ? tailorImg : adminImg;

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${atelierBg})` }}
    >
      <div className="min-h-screen flex items-center">

        {/* LEFT SECTION */}
        <div className="w-[520px] ml-[26%] flex flex-col justify-center">
          <h1 className="text-6xl text-[#2A2A2A]" style={{ fontFamily: "Playfair Display, serif" }}>
            Join The Atelier
          </h1>
          <p className="mt-6 text-lg text-[#6B5B3E]">
            Tailored just for you. <br /> Begin your bespoke journey today.
          </p>
          <motion.img
            key={form.utype}
            src={leftImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-12 w-64 h-64 object-cover rounded-full border-4 border-[#C6A75E] shadow-lg"
          />
        </div>

        {/* RIGHT SIGNUP CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[420px] bg-white/50 backdrop-blur-md p-10 rounded-xl shadow-xl"
        >
          <h2 className="text-3xl text-center mb-8 text-[#2A2A2A]" style={{ fontFamily: "Playfair Display, serif" }}>
            Signup
          </h2>

          {/* EMAIL */}
          <div className="mb-5">
            <label className="block text-[#2A2A2A] font-medium mb-2 text-sm">Email Id</label>
            <input
              type="email"
              name="emailid"
              value={form.emailid}
              onChange={handleChange}
              onBlur={() => setTouched({ ...touched, emailid: true })}
              className={`w-full px-4 py-3 rounded-lg bg-[#F8F3E8] border ${
                touched.emailid && !emailValid ? "border-red-500" : "border-[#D6C7A8]"
              }`}
            />
            {touched.emailid && !emailValid && (
              <p className="text-red-500 text-sm mt-1">Enter a valid email address.</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-5 relative">
            <label className="block text-[#2A2A2A] font-medium mb-2 text-sm">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="pwd"
              value={form.pwd}
              onChange={handleChange}
              onBlur={() => setTouched({ ...touched, pwd: true })}
              className="w-full px-4 py-3 pr-10 rounded-lg bg-[#F8F3E8] border border-[#D6C7A8]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-[#7A5C2E]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {touched.pwd && !passwordValid && (
              <div className="text-xs text-red-500 mt-2 space-y-1">
                {!passwordRules.length && <p>• At least 8 characters</p>}
                {!passwordRules.upper && <p>• One uppercase letter</p>}
                {!passwordRules.lower && <p>• One lowercase letter</p>}
                {!passwordRules.number && <p>• One number</p>}
                {!passwordRules.special && <p>• One special symbol</p>}
              </div>
            )}
          </div>

          {/* USER TYPE */}
          <div className="mb-6">
            <label className="block text-[#2A2A2A] font-medium mb-2 text-sm">User Type</label>
            <select
              name="utype"
              value={form.utype}
              onChange={handleChange}
              onBlur={() => setTouched({ ...touched, utype: true })}
              className={`w-full px-4 py-3 rounded-lg bg-[#F8F3E8] border ${
                touched.utype && !userTypeValid ? "border-red-500" : "border-[#D6C7A8]"
              }`}
            >
              <option value="">Select User Type</option>
              <option value="Customer">Customer</option>
              <option value="Tailor">Tailor</option>
              <option value="Admin">Admin</option>
            </select>
            {touched.utype && !userTypeValid && (
              <p className="text-red-500 text-sm mt-1">Please select a user type.</p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="button"
            onClick={doSignup}
            disabled={!emailValid || !passwordValid || !userTypeValid}
            className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-[#C6A75E] to-[#A8843C] hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Signup
          </button>

          {serverMessage && (
            <p className={`text-sm text-center mt-4 ${serverMessage.includes("successful") ? "text-green-700" : "text-red-500"}`}>
              {serverMessage}
            </p>
          )}

          <p className="text-center mt-5 text-sm text-[#6B5B3E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Already have an account?{" "}
            <a href="/login" className="text-[#A8843C] font-semibold hover:underline">Sign in</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}