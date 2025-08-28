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
