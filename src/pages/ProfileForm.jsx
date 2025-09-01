// import { useEffect, useState } from "react";
// import { getProfile, updateProfile } from "../components/services/requests";
// import { useNavigate } from "react-router-dom";

// export default function ProfileForm() {
//   const [form, setForm] = useState({ username: "", email: "" });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     async function fetchProfile() {
//       try {
//         const data = await getProfile();
//         setForm({ username: data.username, email: data.email });
//       } catch (err) {
//         console.error("Failed to load profile:", err);
//         setError(err.response?.data?.error || "Could not load profile.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProfile();
//   }, []);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((f) => ({ ...f, [name]: value }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setSaving(true);
//       setError("");
//       await updateProfile(form);
//       navigate("/profile"); // go back to profile after saving
//     } catch (err) {
//       console.error("Failed to update profile:", err);
//       setError(err.response?.data?.error || "Update failed.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p className="text-gray-500 animate-pulse">Loading form…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
//       <h1 className="text-xl font-bold mb-4">Edit Profile</h1>

//       {error && <p className="text-red-600 mb-4">{error}</p>}

//       <form onSubmit={onSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Username</label>
//           <input
//             type="text"
//             name="username"
//             value={form.username}
//             onChange={onChange}
//             className="w-full border rounded px-3 py-2"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={onChange}
//             className="w-full border rounded px-3 py-2"
//           />
//         </div>

//         <div className="flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={() => navigate("/profile")}
//             className="border px-4 py-2 rounded"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={saving}
//             className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../components/services/requests";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthFormContainer from "../components/common/AuthFormContainer";
import FormField from "../components/common/FormField";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function ProfileForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setForm({
          username: data.username || "",
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});

      await updateProfile(form);
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Failed to update profile:", err);

      const errorData = err.response?.data || {};
      let errorMessage = "Update failed. Please try again.";

      // Handle backend validation errors
      if (errorData.username) {
        setErrors({ username: errorData.username[0] });
      } else if (errorData.email) {
        setErrors({ email: errorData.email[0] });
      } else {
        setErrors({ submit: errorData.error || errorMessage });
      }

      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthFormContainer title="Edit Profile">
        <LoadingSpinner text="Loading your profile..." />
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer title="Edit Profile">
      <form onSubmit={onSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="First Name" error={errors.first_name}>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              className="input-field"
              placeholder="Optional"
              disabled={saving}
            />
          </FormField>

          <FormField label="Last Name" error={errors.last_name}>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={onChange}
              className="input-field"
              placeholder="Optional"
              disabled={saving}
            />
          </FormField>
        </div>

        <FormField label="Username" error={errors.username} required>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={onChange}
            className={`input-field ${errors.username ? "input-error" : ""}`}
            disabled={saving}
          />
        </FormField>

        <FormField label="Email Address" error={errors.email} required>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className={`input-field ${errors.email ? "input-error" : ""}`}
            disabled={saving}
          />
        </FormField>

        <FormField label="Phone Number" error={errors.phone_number}>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={onChange}
            className="input-field"
            placeholder="Optional"
            disabled={saving}
          />
        </FormField>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary min-w-[120px]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </AuthFormContainer>
  );
}
