import api from "./api";

export async function clientEditRequest(id, payload) {
  const fd = new FormData();
  const fields = [
    "title",
    "deadline",
    "number_of_pages",
    "sources",
    "style",
    "description",
    "attached_file_path",
    "discipline",
    "assignment_type",
  ];

  fields.forEach((k) => {
    const v = payload[k];

    // Skip unset or empty values (so PATCH won't overwrite with null accidentally)
    if (v === undefined || v === null || v === "") return;

    if (k === "deadline") {
      // Accept either "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" or a Date object.
      let dateOnly = null;
      if (v instanceof Date && !isNaN(v.getTime())) {
        // send YYYY-MM-DD
        dateOnly = v.toISOString().split("T")[0];
      } else if (typeof v === "string") {
        // if contains 'T' (datetime-local) -> split; if it's full ISO -> split; else assume it's already YYYY-MM-DD
        if (v.includes("T")) {
          dateOnly = v.split("T")[0];
        } else if (v.includes(" ")) {
          // just in case: "2025-11-22 09:00"
          dateOnly = v.split(" ")[0];
        } else {
          // probably already YYYY-MM-DD
          dateOnly = v;
        }
      }
      if (dateOnly) fd.append("deadline", dateOnly);
      return;
    }

    if (k === "attached_file_path") {
      // if payload contains a File object, append; if it's a string (existing file url), skip
      if (v instanceof File) {
        fd.append("attached_file_path", v);
      }
      // else: user didn't select a new file — don't append anything so backend keeps the old file
      return;
    }

    // Discipline and assignment_type must be integer PKs
    if (k === "discipline" || k === "assignment_type") {
      // allow 0? if not, skip empty
      if (typeof v === "number") fd.append(k, String(v));
      else if (!isNaN(Number(v))) fd.append(k, String(Number(v)));
      // else skip
      return;
    }

    // numbers — ensure string values for FormData
    if (k === "number_of_pages" || k === "sources") {
      fd.append(k, String(v));
      return;
    }

    // default: append as string
    fd.append(k, String(v));
  });

  const { data } = await api.patch(`/request/${id}/client-edit/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function getRequestById(id) {
  const { data } = await api.get(`/request/${id}/`);
  return data;
}

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

export const getPriceQuote = async (projectType, pages, deadlineHours) => {
  const response = await api.post("/price/quote/", {
    project_type: projectType,
    pages,
    deadline_hours: deadlineHours,
  });
  return response.data;
};

// In requests.js - update the functions to handle paginated responses
export async function getDisciplines() {
  try {
    const res = await api.get("/disciplines/");
    console.log("Raw disciplines response:", res.data);

    // Handle paginated response (common in DRF)
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    }
    // Handle non-paginated array response
    else if (Array.isArray(res.data)) {
      return res.data;
    }
    // Fallback - try to extract data from common structures
    else if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.warn("Unexpected disciplines response structure:", res.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching disciplines:", error);
    throw error;
  }
}

export async function getAssignmentTypes() {
  try {
    const res = await api.get("/assignment-types/");
    console.log("Raw assignment types response:", res.data);

    // Handle paginated response (common in DRF)
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    }
    // Handle non-paginated array response
    else if (Array.isArray(res.data)) {
      return res.data;
    }
    // Fallback - try to extract data from common structures
    else if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.warn("Unexpected assignment types response structure:", res.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching assignment types:", error);
    throw error;
  }
}
