import { useEffect, useState } from "react";
import {
  getDisciplines,
  getAssignmentTypes,
} from "../../components/services/lookups";

export default function ClientRequestEditForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    // convert incoming initial deadline (ISO or date-only) to YYYY-MM-DD
    deadline: initial?.deadline ? toDateValue(initial.deadline) : "",
    number_of_pages: initial?.number_of_pages ?? 1,
    sources: initial?.sources ?? 0,
    style: initial?.style || "",
    description: initial?.description || "",
    attached_file_path: null, // new file (optional)
    discipline: initial?.discipline ?? null,
    assignment_type: initial?.assignment_type ?? null,
  });

  const [disciplines, setDisciplines] = useState([]);
  const [assignTypes, setAssignTypes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [d, a] = await Promise.all([
          getDisciplines(),
          getAssignmentTypes(),
        ]);
        setDisciplines(d || []);
        setAssignTypes(a || []);
      } catch (e) {
        console.error("Failed to load dropdown options", e);
        setDisciplines([]);
        setAssignTypes([]);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Helper: convert backend ISO (or YYYY-MM-DDTHH:mm:ssZ) to "YYYY-MM-DD"
  function toDateValue(iso) {
    try {
      if (!iso) return "";
      // if already YYYY-MM-DD, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((f) => ({ ...f, [name]: files?.[0] || null }));
    } else if (
      name === "number_of_pages" ||
      name === "sources" ||
      name === "discipline" ||
      name === "assignment_type"
    ) {
      setForm((f) => ({
        ...f,
        [name]: value === "" ? null : parseInt(value, 10),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleClearFile = () =>
    setForm((f) => ({ ...f, attached_file_path: null }));

  const submit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (form.title && form.title.trim().length === 0) {
      return alert("Title is required.");
    }
    if (!form.deadline) {
      return alert("Deadline is required.");
    }
    if (form.number_of_pages && Number(form.number_of_pages) < 1) {
      return alert("Pages must be at least 1.");
    }
    if (
      form.attached_file_path &&
      form.attached_file_path.size > 10 * 1024 * 1024
    ) {
      return alert("Attached file must be smaller than 10MB.");
    }
    // Expect YYYY-MM-DD from date input
    if (form.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(form.deadline)) {
      return alert("Please select a valid date (YYYY-MM-DD).");
    }

    // Build payload with only editable fields (do not include null/empty)
    const payload = {};
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
    for (const k of fields) {
      const v = form[k];
      if (v === undefined || v === null || v === "") continue;

      // For file, only include if it's a File object
      if (k === "attached_file_path") {
        if (v instanceof File) {
          payload[k] = v;
        }
        // if user didn't pick a new file, do not add anything — backend will keep existing file
        continue;
      }

      payload[k] = v;
    }

    // If deadline is present and contains a time (defensive), strip to date-only:
    if (payload.deadline && payload.deadline.includes("T")) {
      payload.deadline = payload.deadline.split("T")[0];
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            name="title"
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Literature review on ..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Deadline</span>
          <input
            type="date"
            name="deadline"
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.deadline}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Pages</span>
          <input
            type="number"
            min={1}
            name="number_of_pages"
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.number_of_pages ?? ""}
            onChange={handleChange}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Sources</span>
          <input
            type="number"
            min={0}
            name="sources"
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.sources ?? ""}
            onChange={handleChange}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Style</span>
        <input
          name="style"
          className="mt-1 w-full border rounded px-3 py-2"
          value={form.style}
          onChange={handleChange}
          placeholder="APA / MLA / Chicago / Harvard..."
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Description</span>
        <textarea
          name="description"
          rows={4}
          className="mt-1 w-full border rounded px-3 py-2"
          value={form.description}
          onChange={handleChange}
          placeholder="Add/clarify instructions for the freelancer..."
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Discipline</span>
          <select
            name="discipline"
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.discipline ?? ""}
            onChange={handleChange}
            disabled={loadingOptions}
          >
            <option value="">Select…</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Assignment Type</span>
          <select
            name="assignment_type"
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.assignment_type ?? ""}
            onChange={handleChange}
            disabled={loadingOptions}
          >
            <option value="">Select…</option>
            {assignTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <label className="block">
          <span className="text-sm font-medium">
            Replace Attached File (optional)
          </span>
          <input
            type="file"
            name="attached_file_path"
            className="mt-1 block"
            onChange={handleChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
        </label>
        {form.attached_file_path && (
          <button
            type="button"
            onClick={handleClearFile}
            className="mt-6 px-3 py-2 rounded border"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border hover:bg-gray-50"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
