import React, { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 import icons


// ✅ Define interface for form data
interface UserFormData {
  name: string;
  email: string;
  password: string;
  whatsapp_number: string;
  domain_type: "salon" | "worker" | "company" | ""; // restricts domain_type to enum values
}

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    whatsapp_number: "",
    domain_type: ""
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handledomain_typeSelect = (domain_type: UserFormData["domain_type"]) => {
    setFormData({ ...formData, domain_type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/auth/addUser`,
        formData
      );
      setMessage(res.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        whatsapp_number: "",
        domain_type: ""
      });
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-4">
        <h2 className="text-2xl font-bold text-center mb-6">Add User</h2>

        {message && (
          <p className="mb-4 text-center text-sm text-red-500">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />

          {/* Password with eye icon */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <input
            type="text"
            name="whatsapp_number"
            placeholder="Enter WhatsApp Number"
            value={formData.whatsapp_number}
            onChange={handleChange}
            className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />

          {/* domain_type Buttons */}
          <div>
            <label className="block mb-2 font-semibold text-blue-700">Select domain type:</label>
            <div className="flex gap-3">
              {["salon", "worker", "company"].map((domain_type) => (
                <button
                  type="button"
                  key={domain_type}
                  onClick={() => handledomain_typeSelect(domain_type as UserFormData["domain_type"])}
                  className={`px-5 py-2 rounded-xl border-2 font-semibold transition text-sm ${formData.domain_type === domain_type
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-gray-100 text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                >
                  {domain_type.charAt(0).toUpperCase() + domain_type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
