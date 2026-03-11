import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeCalls: 0,
    callsToday: 0,
    avgDuration: 0,
    completionRate: 0,
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = `${API_URL}/api/twilio/stats?limit=100`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch Twilio stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 15 seconds
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const ivrStats = [
    {
      label: "Active Calls",
      value: stats.activeCalls.toString(),
      color: "text-mainBlack",
      bg: "bg-white",
    },
    {
      label: "Calls Today",
      value: stats.callsToday.toString(),
      color: "text-mainBlack",
      bg: "bg-white",
    },
    {
      label: "Avg. Duration",
      value: `${stats.avgDuration}s`,
      color: "text-mainBlack",
      bg: "bg-white",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      color: "text-mainBlack",
      bg: "bg-white",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-mainBlack/10">
        <h1 className="text-[2rem] font-semibold text-mainBlack">
          IVR Operations Dashboard
        </h1>
        <p className="text-sm text-mainBlack/60 mt-0.5">
          Real-time monitoring of your college IVR system
        </p>
      </div>

      {/* Live IVR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ivrStats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-lg border border-mainBlack/10 shadow-sm flex items-center gap-4"
          >
            <div>
              <p className="text-xs font-semibold text-mainBlack/60 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className={`text-xl font-medium ${stat.color} tracking-tight`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full">
        {/* Latest Calls Table */}
        <div className="bg-white rounded-xl border border-gray-100/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-mainBlack">
              Recent IVR Logs
            </h2>
            <button
              onClick={() => setShowAllLogs(!showAllLogs)}
              className="text-xs text-sideBlack/60 font-semibold hover:text-mainBlack transition-colors"
            >
              {showAllLogs ? "View Less" : "View All Logs"}
            </button>
          </div>
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-mainBlack/5">
                  <th className="px-5 py-3 font-semibold text-mainBlack/60">
                    Time
                  </th>
                  <th className="px-5 py-3 font-semibold text-mainBlack/60">
                    Caller ID
                  </th>
                  <th className="px-5 py-3 font-semibold text-mainBlack/60">
                    Action
                  </th>
                  <th className="px-5 py-3 font-semibold text-mainBlack/60">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mainBlack/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-mainBlack/40 italic">
                      Loading latest logs...
                    </td>
                  </tr>
                ) : stats.recentLogs && stats.recentLogs.length > 0 ? (
                  (showAllLogs ? stats.recentLogs : stats.recentLogs.slice(0, 5)).map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-gray-600">{log.time}</td>
                      <td className="px-5 py-3 text-gray-900 font-medium">{log.callerId}</td>
                      <td className="px-5 py-3 text-gray-600">{log.action}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${log.status === 'completed' ? 'bg-green-100 text-green-700' :
                            log.status === 'in-progress' || log.status === 'ringing' ? 'bg-blue-100 text-blue-700' :
                              log.status === 'failed' || log.status === 'no-answer' || log.status === 'canceled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                          }`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-mainBlack/40 italic">
                      No recent call logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
