const ivrStats = [
  {
    label: "Active Calls",
    value: "0",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Calls Today",
    value: "0",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    label: "Avg. Duration",
    value: "0s",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Completion Rate",
    value: "0%",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function Dashboard() {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Calls Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-mainBlack">
              Recent IVR Logs
            </h2>
            <button className="text-xs text-sideBlack/60 font-semibold hover:text-mainBlack transition-colors">
              View All Logs
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
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-gray-400 italic"
                  >
                    No active call logs found...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-100/50 shadow-sm p-5 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-mainBlack">
            System Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/30 rounded-lg border border-emerald-100/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-900/80">
                  IVR Engine
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-50/50 rounded-lg border border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-mainBlack/80">
                  Database Connection
                </span>
              </div>
              <span className="text-[10px] font-bold text-mainBlack/60 uppercase tracking-tighter">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-amber-50/30 rounded-lg border border-amber-100/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-900/80">
                  SMS Gateway
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                Idle
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100/50">
            <p className="text-[10px] text-sideBlack/40 text-center uppercase tracking-[0.2em] font-bold">
              Last Backup:{" "}
              <span className="text-sideBlack/60">2 Hours Ago</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
