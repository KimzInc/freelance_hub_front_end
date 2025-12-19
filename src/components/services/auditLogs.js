import api from "./api";

export function fetchAuditLogs(params = {}) {
  return api.get("/admin/audit-logs/", { params });
}

export function exportAuditLogsCSV(params = {}) {
  return api.get("/admin/audit-logs/export/", {
    params,
    responseType: "blob",
  });
}
