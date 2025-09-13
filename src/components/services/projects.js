import api from "./api";

export async function getProjects() {
  const res = await api.get("/home/project/");
  return res.data.results;
}

export async function purchaseProject(projectId) {
  const res = await api.post(`/purchase/sample/${projectId}/`, {
    terms_accepted: true,
  });
  return res.data;
}

export async function getProjectDetail(projectId) {
  const res = await api.get(`/project/${projectId}/`);
  return res.data;
}

export async function getProjectPreview(projectId) {
  const res = await api.get(`/preview/${projectId}/`);
  return res.data;
}

export async function downloadProject(projectId, projectTitle) {
  const res = await api.get(`/project/${projectId}/download/`, {
    responseType: "blob", // Important for file downloads
  });

  // Create a blob from the response
  const blob = new Blob([res.data], { type: "application/pdf" });

  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement("a");
  link.href = url;

  // Use project title as filename (replace spaces with underscores)
  const safeTitle = projectTitle.replace(/\s+/g, "_");
  link.setAttribute("download", `${safeTitle}.pdf`);

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);

  // Clean up the URL object
  window.URL.revokeObjectURL(url);

  return res.data;
}

////// PAYPAL ////////////////

export async function createPayPalOrder(projectId, amount) {
  const res = await api.post("/payments/paypal/create-order/", {
    project_id: projectId,
    amount: amount,
  });
  return res.data;
}

export async function capturePayPalOrder(orderId) {
  const res = await api.post("/payments/paypal/capture-order/", {
    order_id: orderId,
  });
  return res.data;
}

export async function createPayPalOrderCustomRequest(requestId) {
  const res = await api.post("/payments/paypal/create-order/", {
    custom_request_id: requestId,
  });
  return res.data;
}

// Claim a project (freelancer accepts a request)
export async function claimProject(requestId) {
  const res = await api.post(`/request/${requestId}/claim/`);
  return res.data;
}

// Get projects available for freelancers (not yet claimed)
export async function getFreelancerProjects() {
  const res = await api.get("/freelancer/projects/");
  return res.data;
}

// Get projects assigned to this freelancer
export async function getMyFreelancerProjects() {
  const res = await api.get("/me/projects/");
  return res.data;
}
