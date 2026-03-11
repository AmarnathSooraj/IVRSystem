import { useState, useEffect } from 'react';
import { Edit2, X, Save } from "lucide-react";

export default function FeeDetails() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editData, setEditData] = useState({
    "MERIT FEES": 0,
    "MANAGEMENT FEES": 0,
    "NRI FEES": 0
  });

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : Object.values(data));
      }
    } catch (error) {
      console.error("Failed to fetch courses/fee details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setEditData({
      "MERIT FEES": course["MERIT FEES"] || 0,
      "MANAGEMENT FEES": course["MANAGEMENT FEES"] || 0,
      "NRI FEES": course["NRI FEES"] || 0
    });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${selectedCourse.KEY}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        closeEditModal();
        fetchCourses();
      } else {
        alert("Failed to update fees");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Error updating course");
    }
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="pb-4 border-b border-mainBlack/10">
        <h1 className="text-[2rem] font-semibold text-mainBlack">
          Fee & Course Management
        </h1>
        <p className="text-sm text-mainBlack/60 mt-0.5">
          Admin Console: View and update department fee structures.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
            <p className="text-mainBlack/60 font-medium scale-110">Loading course details...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-mainBlack/10 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mainBlack/5 flex justify-between items-center bg-white">
            <h2 className="text-xs font-bold uppercase tracking-widest text-mainBlack/40">
              Departmental Fee Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-mainBlack/10">
                  <th className="px-6 py-4 text-sm font-semibold text-mainBlack uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-mainBlack uppercase tracking-wider text-right">
                    Merit Fee
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-mainBlack uppercase tracking-wider text-right">
                    Management Fee
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-mainBlack uppercase tracking-wider text-right">
                    NRI Quota
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-mainBlack uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mainBlack/5">
                {courses.length > 0 ? (
                  courses.map((course, idx) => (
                    <tr key={idx} className="hover:bg-mainBlack/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-mainBlack uppercase">
                          {course.DEPARTMENT || "N/A"}
                        </div>
                        <div className="text-[10px] text-mainBlack/40 font-mono mt-0.5">
                          ID: {course.KEY}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-mainBlack tabular-nums">
                        ₹{(course["MERIT FEES"] || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-mainBlack tabular-nums">
                        ₹{(course["MANAGEMENT FEES"] || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-mainBlack tabular-nums">
                        ₹{(course["NRI FEES"] || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => openEditModal(course)}
                          className="p-2 text-mainBlack/40 hover:text-mainBlack hover:bg-mainBlack/10 rounded-lg transition-all"
                          title="Edit Fees"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-mainBlack/60 italic">
                      No course details found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mainBlack/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-mainBlack/10 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-lg font-semibold text-mainBlack uppercase">Edit Fees</h3>
                <p className="text-xs text-mainBlack/60 font-medium">{selectedCourse?.DEPARTMENT}</p>
              </div>
              <button 
                onClick={closeEditModal}
                className="p-1 hover:bg-mainBlack/10 rounded-full transition-colors text-mainBlack/40"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-mainBlack/40 uppercase tracking-wider">Merit Fee (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white border border-mainBlack/10 rounded-lg focus:border-mainBlack outline-none transition-all font-medium"
                  value={editData["MERIT FEES"]}
                  onChange={(e) => handleChange("MERIT FEES", e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-mainBlack/40 uppercase tracking-wider">Management Fee (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white border border-mainBlack/10 rounded-lg focus:border-mainBlack outline-none transition-all font-medium"
                  value={editData["MANAGEMENT FEES"]}
                  onChange={(e) => handleChange("MANAGEMENT FEES", e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-mainBlack/40 uppercase tracking-wider">NRI Quota Fee (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white border border-mainBlack/10 rounded-lg focus:border-mainBlack outline-none transition-all font-medium"
                  value={editData["NRI FEES"]}
                  onChange={(e) => handleChange("NRI FEES", e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-mainBlack/10 flex justify-end gap-3">
              <button 
                onClick={closeEditModal}
                className="px-4 py-2 text-sm font-medium text-mainBlack/60 hover:text-mainBlack transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-mainBlack hover:bg-mainBlack/90 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md shadow-mainBlack/5 transition-all active:scale-95"
              >
                <Save size={16} />
                Update Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

