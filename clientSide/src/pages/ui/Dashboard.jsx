import { useState, useEffect } from 'react';

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
        const url = `http://localhost:5000/api/twilio/stats?limit=50`;
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
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Calls Today",
      value: stats.callsToday.toString(),
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Avg. Duration",
      value: `${stats.avgDuration}s`,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-[2rem] font-semibold text-mainBlack">
          IVR Operations Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Real-time monitoring of your college IVR system
        </p>
      </div>

      {/* Live IVR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ivrStats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-gray-100/50 shadow-sm flex items-center gap-4"
          >
            <div>
              <p className="text-xs font-semibold text-sideBlack uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-xl font-medum text-mainBlack tracking-tight">
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
                <tr className="bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold text-gray-600">
                    Time
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-600">
                    Caller ID
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-600">
                    Action
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400 italic">
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          log.status === 'in-progress' || log.status === 'ringing' ? 'bg-blue-50 text-blue-600' :
                          log.status === 'failed' || log.status === 'no-answer' || log.status === 'canceled' ? 'bg-rose-50 text-rose-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400 italic">
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
