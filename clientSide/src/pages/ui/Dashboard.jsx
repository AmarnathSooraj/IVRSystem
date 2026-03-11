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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/twilio/stats");
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Calls Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-mainBlack/10 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mainBlack/5 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-mainBlack">
              Recent IVR Logs
            </h2>
            <button className="text-xs text-mainBlack/40 font-semibold hover:text-mainBlack transition-colors">
              View All Logs
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
                  stats.recentLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-mainBlack/5 transition-colors">
                      <td className="px-5 py-3 text-mainBlack/60">{log.time}</td>
                      <td className="px-5 py-3 text-mainBlack font-medium">{log.callerId}</td>
                      <td className="px-5 py-3 text-mainBlack/60">{log.action}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'completed' ? 'bg-green-100 text-green-700' :
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

        {/* System Health */}
        <div className="bg-white rounded-xl border border-mainBlack/10 shadow-sm p-5 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-mainBlack">
            System Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-mainBlack/5 rounded-lg border border-mainBlack/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-mainBlack">
                  IVR Engine
                </span>
              </div>
              <span className="text-[10px] font-bold text-mainBlack/60 uppercase tracking-tighter">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-mainBlack/5 rounded-lg border border-mainBlack/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-mainBlack">
                  Database Connection
                </span>
              </div>
              <span className="text-[10px] font-bold text-mainBlack/60 uppercase tracking-tighter">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-mainBlack/5 rounded-lg border border-mainBlack/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-mainBlack">
                  SMS Gateway
                </span>
              </div>
              <span className="text-[10px] font-bold text-mainBlack/60 uppercase tracking-tighter">
                Idle
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-mainBlack/10">
            <p className="text-[10px] text-mainBlack/40 text-center uppercase tracking-[0.2em] font-bold">
              Last Backup:{" "}
              <span className="text-sideBlack/60">2 Hours Ago</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
