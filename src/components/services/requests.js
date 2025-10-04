import api from "./api";

function calculateHoursUntilDeadline(deadline) {
  if (!deadline) return 96; // default fallback
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate - now;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}

export async function submitCustomRequest(form) {
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // Handle file uploads properly
      if (key === "attached_file_path" && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    }
  });

  const hours = calculateHoursUntilDeadline(form.deadline);
  formData.set("deadline_hours", hours); // override if already present

  try {
    const response = await api.post("/purchase/new/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting custom request:", error);
    throw error;
  }
}

export async function getCustomRequest(id) {
  const res = await api.get(`/request/${id}/`);
  return res.data;
}

export async function getMyRequests() {
  const res = await api.get("/my-requests/");
  return res.data;
}

export async function getProfile() {
  const response = await api.get("/me/");
  return response.data;
}

export async function updateProfile(data) {
  const response = await api.patch("/me/update/", data);
  return response.data;
}

export async function changePassword(data) {
  const response = await api.post("/change-password/", data);
  return response.data;
}

export async function getMessages(requestId) {
  const token = localStorage.getItem("access");
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/request/${requestId}/messages/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export const sendMessage = async (requestId, content) => {
  const response = await api.post(`/request/${requestId}/messages/`, {
    content,
  });
  return response.data;
};

export async function checkApproval() {
  const response = await api.get("/check-approval/");
  return response.data;
}

export async function getCustomRequestSummary(id) {
  const res = await api.get(`/requests/${id}/summary/`);
  return res.data;
}

/// to be used by the PriceCalculator component

export const getPriceQuote = async (projectType, pages, deadlineHours) => {
  const response = await api.post("/price/quote/", {
    project_type: projectType,
    pages,
    deadline_hours: deadlineHours,
  });
  return response.data;
};
