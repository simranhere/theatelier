import { useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Calendar, Camera } from "lucide-react";
import Navbar from "./Navbar";

interface CustomerFormState {
  emailid: string;
  name: string;
  contact: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  profilepic: File | null;
}

type FormErrors = Partial<Record<keyof CustomerFormState, string>>;
type TouchedState = Partial<Record<keyof CustomerFormState, boolean>>;

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const INITIAL_STATE: CustomerFormState = {
  emailid: "",
  name: "",
  contact: "",
  dob: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  profilepic: null,
};

export default function CustomerProfile() {
  const loggedInUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const [form, setForm] = useState<CustomerFormState>({
    ...INITIAL_STATE,
    emailid: loggedInUser?.emailid ?? "",
  });

  const [errors, setErrors]     = useState<FormErrors>({});
  const [touched, setTouched]   = useState<TouchedState>({});
  const [preview, setPreview]   = useState<string | null>(null);
  const [isNew, setIsNew]       = useState(true);
  const [serverMsg, setServerMsg] = useState("");

  /* ── VALIDATION ── */
  const validateField = (name: keyof CustomerFormState, value: any): string => {
    const v = String(value || "").trim();
    switch (name) {
      case "emailid":
        if (!v) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email";
        return "";
      case "name":
        if (!v) return "Name is required";
        if (v.length < 3) return "Minimum 3 characters";
        if (!/^[a-zA-Z\s.'-]+$/.test(v)) return "Invalid characters";
        return "";
      case "contact":
        if (!v) return "Contact required";
        if (!/^\d{10}$/.test(v)) return "Must be 10 digits";
        return "";
      case "dob":
        if (!v) return "Date of birth required";
        return "";
      case "gender":
        if (!v) return "Select gender";
        return "";
      case "address":
        if (!v) return "Address required";
        if (v.length < 10) return "Enter full address";
        return "";
      case "city":
        if (!v) return "City required";
        return "";
      case "state":
        if (!v) return "State required";
        return "";
      case "profilepic":
        if (value) {
          if (!ACCEPTED_IMAGE_TYPES.includes(value.type)) return "Only JPG, PNG, WEBP";
          if (value.size > MAX_FILE_SIZE) return "Under 2MB only";
        }
        return "";
      default: return "";
    }
  };

  const validateForm = (): FormErrors => {
    const errs: FormErrors = {};
    (Object.keys(form) as (keyof CustomerFormState)[]).forEach(k => {
      const e = validateField(k, form[k]);
      if (e) errs[k] = e;
    });
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: validateField(name as keyof CustomerFormState, value) }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched(p => ({ ...p, [e.target.name]: true }));
  };

  const handlePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTouched(p => ({ ...p, profilepic: true }));
    const err = validateField("profilepic", file);
    if (err) { setErrors(p => ({ ...p, profilepic: err })); return; }
    setForm(p => ({ ...p, profilepic: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
    setErrors(p => ({ ...p, profilepic: "" }));
  };

  /* ── SUBMIT — matches backend exactly ── */
  async function doSaveOrUpdate() {
    const errs = validateForm();
    setErrors(errs);
    const allTouched: TouchedState = {};
    (Object.keys(form) as (keyof CustomerFormState)[]).forEach(k => allTouched[k] = true);
    setTouched(allTouched);
    if (Object.keys(errs).length > 0) {
      setServerMsg("Please correct all errors before submitting.");
      return;
    }

    const url = isNew
      ? "http://localhost:2007/customer/save-customer-profile"
      : "http://localhost:2007/customer/update-customer-profile";

    // Backend reads req.body + req.files, so multipart FormData
    const fd = new FormData();
    fd.append("emailid",  form.emailid);
    fd.append("name",     form.name);
    fd.append("contact",  form.contact);
    fd.append("dob",      form.dob);
    fd.append("gender",   form.gender);
    fd.append("address",  form.address);
    fd.append("city",     form.city);
    fd.append("state",    form.state);
    if (form.profilepic) fd.append("profilepic", form.profilepic);

    try {
      const resp = await axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resp.data.status) setIsNew(false);
      setServerMsg(resp.data.msg);
    } catch {
      setServerMsg("Failed to save profile. Try again.");
    }
  }

  /* ── HELPERS ── */
  const ic = (name: keyof CustomerFormState) =>
    `w-full px-4 py-2.5 rounded-lg bg-[#F8F3E8] border transition-all outline-none focus:ring-2 focus:ring-[#C6A75E] ${
      touched[name] && errors[name] ? "border-red-500 bg-red-50" : "border-[#D6C7A8]"
    }`;

  const Err = ({ f }: { f: keyof CustomerFormState }) =>
    touched[f] && errors[f]
      ? <p className="text-red-500 text-xs mt-1">{errors[f]}</p>
      : null;

  return (
    <div className="min-h-screen bg-[#F5EDD8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@300;400;600&family=Playfair+Display:wght@400;700&display=swap');`}</style>
      <Navbar />

      <main className="pt-28 pb-16 px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-[#D6C7A8] overflow-hidden"
        >
          {/* HEADER + AVATAR */}
          <div className="p-8 text-center text-white"
            style={{ background: "linear-gradient(135deg, #2A1F0E, #6B4C2A)" }}>
            <h2 className="text-4xl mb-1" style={{ fontFamily: "'Great Vibes', cursive" }}>
              My Profile
            </h2>
            <p className="text-[#D6C7A8] text-sm">Manage your personal information</p>

            <div className="mt-5 relative inline-block">
              <div className="w-24 h-24 rounded-full border-4 border-[#C6A75E] overflow-hidden mx-auto bg-[#6B4C2A] flex items-center justify-center">
                {preview
                  ? <img src={preview} alt="profile" className="w-full h-full object-cover" />
                  : <User size={40} className="text-white opacity-60" />}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#C6A75E] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#A8843C] transition">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePic} />
              </label>
            </div>
            {touched.profilepic && errors.profilepic &&
              <p className="text-red-300 text-xs mt-2">{errors.profilepic}</p>}
          </div>

          {/* FORM BODY */}
          <div className="p-8 space-y-5">

            {/* EMAIL — pre-filled, read-only */}
            <div>
              <label className="block text-sm font-semibold text-[#2A2A2A] mb-1">Email Address</label>
              <input
                name="emailid" value={form.emailid}
                readOnly
                className={`${ic("emailid")} opacity-60 cursor-not-allowed`}
              />
            </div>

            {/* NAME */}
            <div>
              <label className="block text-sm font-semibold text-[#2A2A2A] mb-1 flex items-center gap-1">
                <User size={13} className="text-[#A8843C]" /> Full Name
              </label>
              <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur}
                placeholder="Your full name" className={ic("name")} />
              <Err f="name" />
            </div>

            {/* CONTACT */}
            <div>
              <label className="block text-sm font-semibold text-[#2A2A2A] mb-1 flex items-center gap-1">
                <Phone size={13} className="text-[#A8843C]" /> Contact Number
              </label>
              <input name="contact" value={form.contact} onChange={handleChange} onBlur={handleBlur}
                placeholder="10-digit number" maxLength={10} className={ic("contact")} />
              <Err f="contact" />
            </div>

            {/* DOB + GENDER */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2A2A2A] mb-1 flex items-center gap-1">
                  <Calendar size={13} className="text-[#A8843C]" /> Date of Birth
                </label>
                <input type="date" name="dob" value={form.dob}
                  onChange={handleChange} onBlur={handleBlur} className={ic("dob")} />
                <Err f="dob" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2A2A2A] mb-1">Gender</label>
                <select name="gender" value={form.gender}
                  onChange={handleChange} onBlur={handleBlur} className={ic("gender")}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <Err f="gender" />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-sm font-semibold text-[#2A2A2A] mb-1">Full Address</label>
              <input name="address" value={form.address} onChange={handleChange} onBlur={handleBlur}
                placeholder="House no, street, area..." className={ic("address")} />
              <Err f="address" />
            </div>

            {/* CITY + STATE */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2A2A2A] mb-1 flex items-center gap-1">
                  <MapPin size={13} className="text-[#A8843C]" /> City
                </label>
                <input name="city" value={form.city} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Your city" className={ic("city")} />
                <Err f="city" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2A2A2A] mb-1">State</label>
                <input name="state" value={form.state} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Your state" className={ic("state")} />
                <Err f="state" />
              </div>
            </div>

            {/* SERVER MESSAGE */}
            {serverMsg && (
              <p className={`text-sm text-center py-2 rounded-lg ${
                serverMsg.toLowerCase().includes("saved") || serverMsg.toLowerCase().includes("updated")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}>
                {serverMsg}
              </p>
            )}

            {/* SUBMIT */}
            <button
              onClick={doSaveOrUpdate}
              className="w-full py-3 rounded-full text-white font-semibold hover:scale-105 transition-all"
              style={{ background: "linear-gradient(135deg, #C6A75E, #A8843C)", fontSize: "1rem", letterSpacing: "0.04em" }}
            >
              {isNew ? "Create Profile" : "Update Profile"}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}