import React, { useState } from "react";
import axios from "axios";

// ───────────────── TYPES ─────────────────

interface TailorFormState {
  emailid: string;
  name: string;
  dob: string;
  gender: string;
  contact: string;
  address: string;
  city: string;
  aadharno: string;
  category: string;
  specialty: string;
  social: string;
  since: string;
  worktype: string;
  shopAddress: string;
  shopCity: string;
  otherInfo: string;
  profilepic: File | string | null;
  aadharcard: File | string | null;
}

type FormErrors = Partial<Record<keyof TailorFormState, string>>;
type TouchedState = Partial<Record<keyof TailorFormState, boolean>>;
type TabType = "personal" | "professional" | "contact";

// ───────────────── CONSTANTS ─────────────────

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const INITIAL_STATE: TailorFormState = {
  emailid: "",
  name: "",
  dob: "",
  gender: "",
  contact: "",
  address: "",
  city: "",
  aadharno: "",
  category: "Men",
  specialty: "",
  social: "",
  since: "",
  worktype: "Home",
  shopAddress: "",
  shopCity: "",
  otherInfo: "",
  profilepic: null,
  aadharcard: null,
};

export default function ProfileTailor() {
  
  // ───────────────── STATE ─────────────────
  
  const [form, setForm] = useState<TailorFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedState>({});
  
  const [profilePicPrev, setProfilePicPrev] = useState<string | null>("nopic.jpg");
  const [aadhaarPrev, setAadhaarPrev] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // ───────────────── VALIDATION ─────────────────

  const validateField = (name: keyof TailorFormState, value: any, currentForm: TailorFormState): string => {
    const v = typeof value === "string" ? value.trim() : "";

    switch (name) {
      case "emailid":
        if (!v) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email format";
        return "";

      case "name":
        if (!v) return "Name is required";
        if (v.length < 3) return "Minimum 3 characters required";
        if (!/^[a-zA-Z\s.'-]+$/.test(v)) return "Invalid characters in name";
        return "";

      case "contact":
        if (!v) return "Contact required";
        if (!/^\d{10}$/.test(v)) return "Must be exactly 10 digits";
        return "";

      case "dob":
        if (!v) return "Date of birth required";
        return "";

      case "gender":
        if (!v) return "Select gender";
        return "";

      case "aadharno":
        if (v && !/^\d{12}$/.test(v)) return "Aadhaar must be 12 digits";
        return "";

      case "category":
        if (!v) return "Category required";
        return "";

      case "specialty":
        if (!v) return "Specialty required";
        return "";

      case "social":
        if (v && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v)) {
          return "Enter a valid URL";
        }
        return "";

      case "since":
        if (!v) return "Experience year required";
        if (!/^\d{4}$/.test(v)) return "Enter valid year (YYYY)";
        if (parseInt(v) > new Date().getFullYear()) return "Year cannot be in the future";
        return "";

      case "worktype":
        if (!v) return "Select work type";
        return "";

      case "shopAddress":
        if ((currentForm.worktype === "Shop" || currentForm.worktype === "Both") && !v) {
          return "Shop address required";
        }
        return "";

      case "shopCity":
        if ((currentForm.worktype === "Shop" || currentForm.worktype === "Both") && !v) {
          return "Shop city required";
        }
        return "";

      case "city":
        if (!v) return "City required";
        return "";

      case "address":
        if (!v) return "Address required";
        if (v.length < 10) return "Enter full address";
        return "";

      case "profilepic":
      case "aadharcard":
        // Only validate if it's a new File object (not a URL string from DB)
        if (value instanceof File) {
          if (!ACCEPTED_IMAGE_TYPES.includes(value.type)) return "Only JPG, PNG, WEBP allowed";
          if (value.size > MAX_FILE_SIZE) return "File must be under 2MB";
        }
        // If it's profilepic and we are creating a new profile, make it mandatory
        if (name === "profilepic" && !isEditing && !value) {
          return "Profile picture required";
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    (Object.keys(form) as (keyof TailorFormState)[]).forEach((key) => {
      const err = validateField(key, form[key], form);
      if (err) nextErrors[key] = err;
    });
    return nextErrors;
  };

  // ───────────────── HANDLERS ─────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-clear shop fields if switching back to Home
    let updatedForm = { ...form, [name]: value };
    if (name === "worktype" && value === "Home") {
      updatedForm.shopAddress = "";
      updatedForm.shopCity = "";
      setErrors((p) => ({ ...p, shopAddress: "", shopCity: "" }));
    }

    setForm(updatedForm);
    setErrors((p) => ({ ...p, [name]: validateField(name as keyof TailorFormState, value, updatedForm) }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name as keyof TailorFormState, value, form) }));
  };

  async function updatePicAndSetPreview(e: React.ChangeEvent<HTMLInputElement>) {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    
    setTouched((p) => ({ ...p, [name]: true }));

    const err = validateField(name as keyof TailorFormState, file, form);
    if (err) {
      setErrors((p) => ({ ...p, [name]: err }));
      return;
    }

    if (file) {
      setForm((p) => ({ ...p, [name]: file }));
      const prevObj = URL.createObjectURL(file);
      
      if (name === "profilepic") setProfilePicPrev(prevObj);
      if (name === "aadharcard") {
        setAadhaarPrev(prevObj);
        await doExtractAadhaar(file);
      }
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  }

  // ───────────────── API ACTIONS ─────────────────

  const doSaveOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate all fields
    const nextErrors = validateForm();
    setErrors(nextErrors);

    // 2. Mark all as touched so errors display
    const allTouched: TouchedState = {};
    (Object.keys(form) as (keyof TailorFormState)[]).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    if (Object.keys(nextErrors).length > 0) {
      alert("Please correct all errors before submitting.");
      return;
    }

    let url = isEditing
      ? "https://the-atelier-phi.vercel.app/tailor/update-tailor-profile"
      : "https://the-atelier-phi.vercel.app/tailor/save-tailor-profile";

    let fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, v as any);
    });

    try {
      let resp = await axios.post(url, fd, { headers: { "Content-Type": "multipart/form-data" } });
      alert(JSON.stringify(resp.data));
      if (resp.data.status) {
        setIsEditing(true);
        if (resp.data.doc) setForm(resp.data.doc);
      }
    } catch (err) {
      console.error(err);
      alert("Submission Failed.");
    }
  };

  async function doFind() {
    if (!form.emailid) {
      setTouched((p) => ({ ...p, emailid: true }));
      setErrors((p) => ({ ...p, emailid: "Email is required to fetch profile" }));
      return;
    }

    try {
      let resp = await axios.post("https://the-atelier-phi.vercel.app/tailor/find-tailor", { emailid: form.emailid });
      if (resp.data.status) {
        const doc = resp.data.doc;
        if (doc.dob && doc.dob.includes("T")) doc.dob = doc.dob.split("T")[0];

        setForm(doc);
        setIsEditing(true);
        setErrors({});
        setTouched({});

        setProfilePicPrev(doc.profilepic || "nopic.jpg");
        setAadhaarPrev(doc.aadharcard || null);

        alert("Record Found!");
      } else {
        alert("No Record Found. You can create a new profile.");
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error finding record.");
    }
  }

  async function doExtractAadhaar(file: File) {
    setIsExtracting(true);
    let fd = new FormData();
    fd.append("aadharcard", file);

    try {
      let resp = await axios.post("https://the-atelier-phi.vercel.app/tailor/extract-aadhaar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (resp.data.status) {
        setForm((p) => ({
          ...p,
          aadharno: resp.data.aadhaarno || p.aadharno,
          dob: resp.data.dob || p.dob,
          gender: resp.data.gender || p.gender,
        }));
        
        // Clear errors for auto-filled fields
        setErrors((p) => ({ ...p, aadharno: "", dob: "", gender: "" }));
        // Mark them as touched so they don't error out later
        setTouched((p) => ({ ...p, aadharno: true, dob: true, gender: true }));
        
        alert("Aadhaar Data Extracted Automatically!");
      } else {
        alert(resp.data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Error during OCR extraction.");
    } finally {
      setIsExtracting(false);
    }
  }

  // ───────────────── UI HELPERS ─────────────────

  const inputClass = (name: keyof TailorFormState) => {
    const baseClass = "w-full px-4 py-3 rounded-lg border transition-all outline-none text-[#3E2723] bg-white";
    if (touched[name] && errors[name]) {
      return `${baseClass} border-red-600 bg-red-50 focus:ring-2 focus:ring-red-500`;
    }
    return `${baseClass} border-[#D2B48C] focus:ring-2 focus:ring-[#DAA520]`;
  };

  const showError = (name: keyof TailorFormState) => {
    return touched[name] && errors[name] ? (
      <p className="text-red-600 text-xs mt-1 font-bold">{errors[name]}</p>
    ) : null;
  };

  // ───────────────── RENDER ─────────────────

  return (
    <main className="min-h-screen bg-[#F5F5DC] p-4 md:p-8 font-sans text-[#3E2723]">
      <div className="max-w-4xl mx-auto bg-[#FFF8DC] p-6 md:p-10 rounded-2xl shadow-[0_10px_25px_rgba(139,69,19,0.2)] border-2 border-[#D2B48C]">
        
        <h1 className="mb-8 text-center text-3xl font-serif font-bold text-[#8B4513] border-b-4 border-[#DAA520] inline-block pb-2 w-full md:w-auto">
          Tailor Profile
        </h1>

        {/* TOP SEARCH BAR */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-start border-b-2 border-dashed border-[#D2B48C] pb-6">
          <div className="flex-1 w-full">
            <label className="block mb-1 font-bold text-[#8B4513] text-sm">Email ID (For Search & Save) *</label>
            <input 
              name="emailid" value={form.emailid} 
              onChange={handleChange} onBlur={handleBlur} 
              className={inputClass("emailid")} placeholder="tailor@example.com"
            />
            {showError("emailid")}
          </div>
          <button type="button" onClick={doFind} className="w-full md:w-auto mt-6 px-6 py-3 bg-[#8B4513] hover:bg-[#6D360F] text-white rounded-lg font-bold transition shadow-sm">
            Find Record
          </button>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap border-b-2 border-[#D2B48C] mb-8">
          {(["personal", "professional", "contact"] as TabType[]).map((tab) => (
            <button
              key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-4 md:px-6 py-3 text-lg font-semibold transition-all duration-300 border-b-4 focus:outline-none capitalize ${
                activeTab === tab 
                  ? "text-[#DAA520] border-[#DAA520]" 
                  : "text-[#8B4513] border-transparent hover:text-[#DAA520] hover:bg-[#DAA520]/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form>
          
          {/* ── 1. PERSONAL TAB ── */}
          <div className={`${activeTab === "personal" ? "block" : "hidden"} animate-[fadeIn_0.5s_ease-in-out]`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              <div className="flex flex-col items-center md:col-span-1">
                <img src={profilePicPrev || "nopic.jpg"} alt="Profile" className="w-48 h-48 object-cover rounded-full border-4 border-[#DAA520] shadow-md" />
                <label htmlFor="profilepic" className="mt-4 px-6 py-2 bg-[#DAA520] hover:bg-[#C59217] text-white rounded-md font-semibold cursor-pointer w-full text-center shadow-sm">
                  Browse Photo
                </label>
                <input type="file" id="profilepic" name="profilepic" onChange={updatePicAndSetPreview} hidden accept="image/*" />
                {showError("profilepic")}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block mb-1 font-bold text-[#8B4513] text-sm">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} className={inputClass("name")} placeholder="John Doe" />
                  {showError("name")}
                </div>
                
                {/* AADHAAR UPLOAD & OCR */}
                <div className="sm:col-span-2 border-2 border-dashed border-[#DAA520] p-4 rounded-xl bg-[#FFF8DC]">
                  <label className="block mb-2 font-bold text-[#8B4513] text-lg">Aadhaar Verification</label>
                  <p className="text-xs text-[#8B4513] mb-4">Uploading will auto-fill DOB, Gender, and Aadhaar No.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <label htmlFor="aadharcard" className="px-6 py-2 bg-[#8B4513] hover:bg-[#6D360F] text-white rounded-md font-semibold cursor-pointer text-center shadow-sm transition">
                      {isExtracting ? "Extracting Details..." : "Upload Aadhaar Image"}
                    </label>
                    <input type="file" id="aadharcard" name="aadharcard" onChange={updatePicAndSetPreview} hidden accept="image/*" />
                  </div>
                  {showError("aadharcard")}
                  
                  {aadhaarPrev && (
                    <img src={aadhaarPrev} alt="" className="h-24 rounded-lg border-2 border-[#D2B48C] shadow-sm object-contain mb-4" />
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-bold text-[#8B4513] text-sm">Aadhaar Number</label>
                      <input name="aadharno" value={form.aadharno} onChange={handleChange} onBlur={handleBlur} maxLength={12} placeholder="1234 5678 9012" className={inputClass("aadharno")} />
                      {showError("aadharno")}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-[#8B4513] text-sm">Date of Birth *</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} onBlur={handleBlur} className={inputClass("dob")} />
                  {showError("dob")}
                </div>
                <div>
                  <label className="block mb-1 font-bold text-[#8B4513] text-sm">Gender *</label>
                  <select name="gender" value={form.gender} onChange={handleChange} onBlur={handleBlur} className={inputClass("gender")}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {showError("gender")}
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. PROFESSIONAL TAB ── */}
          <div className={`${activeTab === "professional" ? "block" : "hidden"} animate-[fadeIn_0.5s_ease-in-out]`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} onBlur={handleBlur} className={inputClass("category")}>
                  <option value="">Select Category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Children">Children</option>
                  <option value="Both">Both</option>
                </select>
                {showError("category")}
              </div>
              <div>
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">Specialty *</label>
                <input name="specialty" value={form.specialty} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., Suits, Ethnic" className={inputClass("specialty")} />
                {showError("specialty")}
              </div>
              
              <div>
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">Website / Insta / FB</label>
                <input type="url" name="social" value={form.social} onChange={handleChange} onBlur={handleBlur} placeholder="https://..." className={inputClass("social")} />
                {showError("social")}
              </div>

              <div>
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">Since (Year) *</label>
                <input name="since" value={form.since} onChange={handleChange} onBlur={handleBlur} maxLength={4} placeholder="YYYY" className={inputClass("since")} />
                {showError("since")}
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">Work Type *</label>
                <select name="worktype" value={form.worktype} onChange={handleChange} onBlur={handleBlur} className={inputClass("worktype")}>
                  <option value="">Select Work Type</option>
                  <option value="Home">Home</option>
                  <option value="Shop">Shop</option>
                  <option value="Both">Both</option>
                </select>
                {showError("worktype")}
              </div>
              
              {(form.worktype === "Shop" || form.worktype === "Both") && (
                <>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-bold text-[#8B4513] text-sm">Shop Address *</label>
                    <input name="shopAddress" value={form.shopAddress} onChange={handleChange} onBlur={handleBlur} placeholder="123 Tailor Street..." className={inputClass("shopAddress")} />
                    {showError("shopAddress")}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-bold text-[#8B4513] text-sm">Shop City *</label>
                    <input name="shopCity" value={form.shopCity} onChange={handleChange} onBlur={handleBlur} placeholder="City Name" className={inputClass("shopCity")} />
                    {showError("shopCity")}
                  </div>
                </>
              )}
              
               <div className="md:col-span-2">
                  <label className="block mb-1 font-bold text-[#8B4513] text-sm">Other Information</label>
                  <textarea name="otherInfo" value={form.otherInfo} onChange={handleChange} onBlur={handleBlur} rows={3} className={inputClass("otherInfo")} />
              </div>
            </div>
          </div>

          {/* ── 3. CONTACT TAB ── */}
          <div className={`${activeTab === "contact" ? "block" : "hidden"} animate-[fadeIn_0.5s_ease-in-out]`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">Contact Number *</label>
                <input type="tel" name="contact" value={form.contact} onChange={handleChange} onBlur={handleBlur} maxLength={10} placeholder="10 Digit Number" className={inputClass("contact")} />
                {showError("contact")}
              </div>
              <div>
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">City *</label>
                <input name="city" value={form.city} onChange={handleChange} onBlur={handleBlur} placeholder="Home City" className={inputClass("city")} />
                {showError("city")}
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-[#8B4513] text-sm">Full Address *</label>
                <input name="address" value={form.address} onChange={handleChange} onBlur={handleBlur} placeholder="Full Home Address" className={inputClass("address")} />
                {showError("address")}
              </div>
            </div>
            
            <button type="button" onClick={doSaveOrUpdate} className="mt-10 w-full rounded-lg bg-gradient-to-r from-[#DAA520] to-[#C59217] py-4 text-xl font-bold text-white transition hover:opacity-90 shadow-lg transform hover:-translate-y-1">
              {isEditing ? "UPDATE PROFILE" : "CREATE PROFILE"}
            </button>
          </div>
          
        </form>
      </div>
    </main>
  );
}