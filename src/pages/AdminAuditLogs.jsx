import { useEffect, useState, useCallback } from "react";
import {
  fetchAuditLogs,
  exportAuditLogsCSV,
} from "../components/services/auditLogs";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    project_id: "",
    actor_id: "",
    action: "",
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs(filters);
      //setLogs(res.data);
      const data = res.data;
      if (Array.isArray(data)) {
        setLogs(data);
      } else if (Array.isArray(data.results)) {
        setLogs(data.results);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  async function handleExport() {
    try {
      const res = await exportAuditLogsCSV(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "audit_logs.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV export failed", err);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Audit Logs</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          name="project_id"
          placeholder="Project ID"
          value={filters.project_id}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="actor_id"
          placeholder="Actor ID"
          value={filters.actor_id}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="action"
          value={filters.action}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All actions</option>
          <option value="PROJECT_EDIT">Project Edit</option>
        </select>

        <button
          onClick={loadLogs}
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          Apply Filters
        </button>
      </div>

      {/* Export */}
      <div className="mb-4">
        <button
          onClick={handleExport}
          className="bg-gray-800 text-white rounded px-4 py-2"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Time</th>
                <th className="border p-2">Actor</th>
                <th className="border p-2">Action</th>
                <th className="border p-2">Object</th>
                <th className="border p-2">Object ID</th>
                <th className="border p-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="border p-2">{log.actor_username}</td>
                  <td className="border p-2">{log.action}</td>
                  <td className="border p-2">{log.object_type}</td>
                  <td className="border p-2">{log.object_id}</td>
                  <td className="border p-2">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
