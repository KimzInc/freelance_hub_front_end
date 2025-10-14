// import api from "./api";

// export async function getProjects() {
//   const res = await api.get("/home/project/");
//   return res.data.results;
// }

// export async function purchaseProject(projectId) {
//   const res = await api.post(`/purchase/sample/${projectId}/`, {
//     terms_accepted: true,
//   });
//   return res.data;
// }

// export async function getProjectDetail(projectId) {
//   const res = await api.get(`/project/${projectId}/`);
//   return res.data;
// }

// export async function getProjectPreview(projectId) {
//   const res = await api.get(`/preview/${projectId}/`);
//   return res.data;
// }

// export async function downloadProject(projectId, projectTitle) {
//   const res = await api.get(`/project/${projectId}/download/`, {
//     responseType: "blob",
//   });

//   const blob = new Blob([res.data], { type: "application/pdf" });
//   const url = window.URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;

//   const safeTitle = projectTitle.replace(/\s+/g, "_");
//   link.setAttribute("download", `${safeTitle}.pdf`);

//   document.body.appendChild(link);
//   link.click();
//   link.parentNode.removeChild(link);
//   window.URL.revokeObjectURL(url);

//   return res.data;
// }

// export async function createPayPalOrder(projectId, amount) {
//   const res = await api.post("/payments/paypal/create-order/", {
//     project_id: projectId,
//     amount: amount,
//   });
//   return res.data;
// }

// export async function capturePayPalOrder(orderId) {
//   const res = await api.post("/payments/paypal/capture-order/", {
//     order_id: orderId,
//   });
//   return res.data;
// }

// export async function createPayPalOrderCustomRequest(requestId) {
//   const res = await api.post("/payments/paypal/create-order/", {
//     custom_request_id: requestId,
//   });
//   return res.data;
// }

// export async function claimProject(requestId) {
//   const res = await api.post(`/request/${requestId}/claim/`);
//   return res.data;
// }

// // FIXED: Handle paginated response for freelancer projects
// export async function getFreelancerProjects() {
//   try {
//     const res = await api.get("/freelancer/projects/");
//     console.log("Raw freelancer projects response:", res.data);

//     // Handle different response structures
//     if (res.data && Array.isArray(res.data.results)) {
//       return res.data.results;
//     } else if (Array.isArray(res.data)) {
//       return res.data;
//     } else if (res.data && Array.isArray(res.data.data)) {
//       return res.data.data;
//     } else {
//       console.warn("Unexpected freelancer projects structure:", res.data);
//       return [];
//     }
//   } catch (error) {
//     console.error("Error fetching freelancer projects:", error);
//     throw error;
//   }
// }

// // FIXED: Handle paginated response for my freelancer projects
// export async function getMyFreelancerProjects() {
//   try {
//     const res = await api.get("/me/projects/");
//     console.log("Raw my freelancer projects response:", res.data);

//     // Handle different response structures
//     if (res.data && Array.isArray(res.data.results)) {
//       return res.data.results;
//     } else if (Array.isArray(res.data)) {
//       return res.data;
//     } else if (res.data && Array.isArray(res.data.data)) {
//       return res.data.data;
//     } else {
//       console.warn("Unexpected my freelancer projects structure:", res.data);
//       return [];
//     }
//   } catch (error) {
//     console.error("Error fetching my freelancer projects:", error);
//     throw error;
//   }
// }

import api from "./api";

export async function getProjects(filters = {}) {
  const params = new URLSearchParams();

  if (filters.query) params.append("query", filters.query);
  if (filters.discipline) params.append("discipline", filters.discipline);
  if (filters.assignment_type)
    params.append("assignment_type", filters.assignment_type);

  try {
    const res = await api.get(`/home/project/?${params.toString()}`);
    console.log("Raw projects response:", res.data);

    // Handle different response structures
    if (res.data && Array.isArray(res.data.results)) {
      return res.data; // Return full paginated response
    } else if (Array.isArray(res.data)) {
      return { results: res.data }; // Convert to consistent structure
    } else {
      console.warn("Unexpected projects response structure:", res.data);
      return { results: [] };
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
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
    responseType: "blob",
  });

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const safeTitle = projectTitle.replace(/\s+/g, "_");
  link.setAttribute("download", `${safeTitle}.pdf`);

  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);

  return res.data;
}

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

export async function claimProject(requestId) {
  const res = await api.post(`/request/${requestId}/claim/`);
  return res.data;
}

// FIXED: Handle paginated response for freelancer projects
export async function getFreelancerProjects() {
  try {
    const res = await api.get("/freelancer/projects/");
    console.log("Raw freelancer projects response:", res.data);

    // Handle different response structures
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    } else if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.warn("Unexpected freelancer projects structure:", res.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching freelancer projects:", error);
    throw error;
  }
}

// FIXED: Handle paginated response for my freelancer projects
export async function getMyFreelancerProjects() {
  try {
    const res = await api.get("/me/projects/");
    console.log("Raw my freelancer projects response:", res.data);

    // Handle different response structures
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    } else if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.warn("Unexpected my freelancer projects structure:", res.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching my freelancer projects:", error);
    throw error;
  }
}

// New functions for disciplines and assignment types
export async function getDisciplines() {
  try {
    const res = await api.get("/disciplines/");
    console.log("Raw disciplines response:", res.data);

    // Handle paginated response
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    } else if (Array.isArray(res.data)) {
      return res.data;
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

    // Handle paginated response
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    } else if (Array.isArray(res.data)) {
      return res.data;
    } else {
      console.warn("Unexpected assignment types response structure:", res.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching assignment types:", error);
    throw error;
  }
}
