import api from "./api";

export async function submitCustomRequest(form) {
  const formData = new FormData();

  formData.append("title", form.title);

  if (form.deadline instanceof Date) {
    formData.append("deadline", form.deadline.toISOString().split("T")[0]);
  } else {
    formData.append("deadline", form.deadline); // assume it's already "YYYY-MM-DD"
  }

  formData.append("number_of_pages", form.number_of_pages);
  formData.append("sources", form.sources);
  formData.append("style", form.style);
  formData.append("description", form.description);

  formData.append("total_price", parseFloat(form.total_price).toFixed(2));

  formData.append("terms_accepted", form.terms_accepted ? "true" : "false");

  if (form.attached_file_path) {
    formData.append("attached_file_path", form.attached_file_path);
  }

  const res = await api.post("/purchase/new/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // Should be the custom request details
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
