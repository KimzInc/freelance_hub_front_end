import api from "./api";

export async function getDisciplines() {
  const { data } = await api.get("/disciplines/");
  // normalize if paginated
  return Array.isArray(data) ? data : data.results || [];
}

export async function getAssignmentTypes() {
  const { data } = await api.get("/assignment-types/");
  return Array.isArray(data) ? data : data.results || [];
}
