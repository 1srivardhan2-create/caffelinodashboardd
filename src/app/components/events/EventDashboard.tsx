import { 
  CalendarDays, 
  Ticket, 
  DollarSign, 
  Users, 
  TrendingUp, 
  QrCode,
  CheckCircle2
} from 'lucide-react';

export default function EventDashboard() {
  const stats = [
    { label: 'Total Events', value: '12', icon: CalendarDays, color: 'text-[#8C6D53]', bg: 'bg-[#8C6D53]/10' },
    { label: 'Tickets Sold', value: '843', icon: Ticket, color: 'text-[#4A3B32]', bg: 'bg-[#4A3B32]/10' },
    { label: 'Total Revenue', value: '₹42,150', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Avg. Attendance', value: '85%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' }
  ];

  const recentRegistrations = [
    { id: 'TKT-8921', name: 'Rahul Sharma', event: 'Live Jazz Night', amount: '₹500', status: 'Confirmed', date: 'Today, 2:30 PM' },
    { id: 'TKT-8922', name: 'Priya Patel', event: 'Coffee Tasting Masterclass', amount: '₹1200', status: 'Checked In', date: 'Today, 1:15 PM' },
    { id: 'TKT-8923', name: 'Amit Kumar', event: 'Acoustic Sunday', amount: '₹0 (Free)', status: 'Confirmed', date: 'Yesterday' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E1D9] flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart / Analytics Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#E8E1D9] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none text-gray-700 focus:ring-2 focus:ring-[#8C6D53]/50">
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-center text-gray-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Analytics Chart Overview</p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Next Event */}
        <div className="bg-gradient-to-br from-[#4A3B32] to-[#2A211C] rounded-2xl shadow-sm p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 opacity-10">
            <CalendarDays className="w-32 h-32" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
              <span className="text-[#D4AF37]">✨</span> Next Upcoming Event
            </h3>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20 relative z-10 shadow-inner">
              <p className="text-sm text-[#E8E1D9] mb-1 font-medium">Tomorrow, 7:00 PM</p>
              <p className="font-bold text-xl mb-2 text-white">Live Jazz Night</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-200">45/50 Seats Sold</span>
                <span className="text-green-400 font-semibold">90% Filled</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.4)]" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B49017] hover:from-[#E5C048] hover:to-[#C5A028] text-[#2A211C] font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 relative z-10 shadow-lg transform hover:-translate-y-0.5">
            <QrCode className="w-5 h-5" />
            Scan Ticket QR
          </button>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E1D9] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
          <button className="text-sm text-[#8C6D53] font-semibold hover:text-[#4A3B32] transition-colors">View All Registrations &rarr;</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs uppercase bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 tracking-wider">Attendee Name</th>
                <th className="px-6 py-4 tracking-wider">Event</th>
                <th className="px-6 py-4 tracking-wider">Ticket ID</th>
                <th className="px-6 py-4 tracking-wider">Amount</th>
                <th className="px-6 py-4 tracking-wider">Status</th>
                <th className="px-6 py-4 tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRegistrations.map((reg, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8C6D53]/10 text-[#8C6D53] flex items-center justify-center font-bold text-xs">
                      {reg.name.charAt(0)}
                    </div>
                    {reg.name}
                  </td>
                  <td className="px-6 py-4">{reg.event}</td>
                  <td className="px-6 py-4 font-mono text-xs bg-gray-50/50 rounded">{reg.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{reg.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border ${
                      reg.status === 'Checked In' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {reg.status === 'Checked In' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{reg.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
