import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function StudentDetails() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();

      // Firebase returns an object with keys, convert to array
      const studentsList = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];

      setStudents(studentsList);
      setError(null);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(
        "Could not load student data. Please check if the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;

    const headers = [
      "Admission No",
      "Name",
      "DOB",
      "Email",
      "Phone",
      "Semester",
      "CGPA",
    ];
    const csvRows = [
      headers.join(","),
      ...students.map((s) =>
        [
          s.admission_no || "",
          `"${s.name || ""}"`,
          s.date_of_birth || "",
          s.email || "",
          s.mobile_no || "",
          s.semester || "",
          s.cgpa || "",
        ].join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredAndSorted = students
    .filter(
      (s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.admission_no?.toLowerCase().includes(search.toLowerCase()) ||
        s.course?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
      if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="pb-4 border-b border-mainBlack/10 flex items-center justify-between">
        <div>
          <h1 className="text-[2rem] font-semibold text-mainBlack">
            Student Details
          </h1>
          <p className="text-sm text-mainBlack/60 mt-0.5">
            View and search all student records from database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={loading || students.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-mainBlack/10 rounded-lg text-sm font-medium text-mainBlack hover:bg-mainBlack/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
          {!loading && (
            <span className="text-xs font-medium bg-mainBlack text-white border border-mainBlack rounded-full px-3 py-1">
              {filteredAndSorted.length} students
            </span>
          )}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center justify-between">
        <div className="relative w-full mr-2 md:mr-6">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mainBlack/40"
          />
          <input
            type="text"
            placeholder="Search name, admission no, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-full w-full pl-9 pr-4 py-2 text-sm border border-mainBlack/20 rounded-lg bg-white focus:outline-none transition-all"
          />
        </div>

        <button
          onClick={toggleSort}
          className="flex items-center gap-2 px-2 md:px-4 py-2 bg-white border border-mainBlack/10 rounded-lg text-xs md:text-sm font-medium text-mainBlack hover:bg-mainBlack/5 transition-colors"
        >
          {sortOrder === "asc" ? (
            <ArrowUp size={16} />
          ) : (
            <ArrowDown size={16} />
          )}
          Sort by Name
        </button>
      </div>

      {/* Table / Content */}
      <div className="bg-white rounded-lg border border-mainBlack/10 overflow-hidden min-h-[200px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-mainBlack/40">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-mainBlack" />
            <p className="text-sm">Fetching student records...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-mainBlack">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchStudents}
              className="mt-3 text-xs bg-mainBlack text-white border border-mainBlack px-3 py-1 rounded-md hover:bg-mainBlack/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-mainBlack/10 bg-mainBlack/5">
                {[
                  "Admission No",
                  "Name",
                  "DOB",
                  "Email",
                  "Phone",
                  "Semester",
                  "CGPA",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold text-mainBlack/60 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-mainBlack/5">
              {filteredAndSorted.map((s) => (
                <tr key={s.id} className="hover:bg-mainBlack/5 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-mainBlack/60">
                    {s.admission_no}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-mainBlack">
                    {s.name}
                  </td>
                  <td className="px-5 py-3.5 text-mainBlack/80">
                    {s.date_of_birth || "N/A"}
                  </td>
                  <td className="px-5 py-3.5 text-mainBlack/80">
                    {s.email || "N/A"}
                  </td>
                  <td className="px-5 py-3.5 text-mainBlack/80">
                    {s.mobile_no || "N/A"}
                  </td>
                  <td className="px-5 py-3.5 text-mainBlack/80">
                    {s.semester || "N/A"}
                  </td>
                  <td className="px-5 py-3.5 text-mainBlack/80 font-medium">
                    {s.cgpa || "N/A"}
                  </td>
                </tr>
              ))}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-20 text-sm text-mainBlack/40"
                  >
                    No student records found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
