import { motion } from 'motion/react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { IndianRupee, Clock, CheckCircle2, Ticket, Download, ChevronRight } from 'lucide-react';

export default function EventsEarnings() {
  const stats = [
    { label: 'Total Revenue', value: '₹ 4,20,500', icon: IndianRupee, color: 'text-[#3E2723]', bg: 'bg-[#FDFBF7]', border: 'border-[#E8DCC4]' },
    { label: 'Pending Settlements', value: '₹ 85,000', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Completed Settlements', value: '₹ 3,35,500', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Total Tickets Sold', value: '1,248', icon: Ticket, color: 'text-[#8B5E3C]', bg: 'bg-[#F5E6D3]', border: 'border-[#E8DCC4]' },
  ];

  const recentTransactions = [
    { id: 'TRX-9821', event: 'Acoustic Evening with John', amount: '₹ 22,500', date: 'Oct 24, 2026', status: 'completed' },
    { id: 'TRX-9822', event: 'Coffee Tasting Workshop', amount: '₹ 18,000', date: 'Nov 02, 2026', status: 'pending' },
    { id: 'TRX-9819', event: 'Jazz & Beans', amount: '₹ 30,000', date: 'Sep 15, 2026', status: 'completed' },
    { id: 'TRX-9815', event: 'Latte Art Masterclass', amount: '₹ 15,000', date: 'Aug 20, 2026', status: 'completed' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">Earnings & Settlements</h1>
          <p className="text-[#8B5E3C] mt-2">Track your event revenue and payout status.</p>
        </div>
        <Button 
          variant="outline"
          className="border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50 h-11 px-6 rounded-xl"
        >
          <Download className="mr-2 size-4" />
          Download Statement
        </Button>
      </div>

      {/* Stats Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`p-6 border ${stat.border} shadow-sm bg-white hover:shadow-[0_8px_30px_rgba(139,94,60,0.08)] transition-all duration-300 relative overflow-hidden group`}>
                <div className={`absolute -right-4 -top-4 size-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
                    <Icon className={`size-6 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-bold text-[#3E2723] mb-1">{stat.value}</h3>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Transactions List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl border border-[#E8DCC4] shadow-sm overflow-hidden"
      >
        <div className="p-6 md:p-8 border-b border-[#E8DCC4] flex items-center justify-between bg-[#FDFBF7]">
          <h2 className="text-xl font-bold text-[#3E2723]">Recent Settlements</h2>
          <Button variant="ghost" className="text-[#8B5E3C] font-semibold">View All <ChevronRight className="ml-1 size-4" /></Button>
        </div>
        
        <div className="divide-y divide-[#E8DCC4]">
          {recentTransactions.map((trx, index) => (
            <div key={index} className="p-6 md:p-8 hover:bg-[#FDFBF7]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${trx.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {trx.status === 'completed' ? <CheckCircle2 className="size-6" /> : <Clock className="size-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-[#3E2723] text-lg mb-1">{trx.event}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="font-medium text-[#8B5E3C]">{trx.id}</span>
                    <span>•</span>
                    <span>{trx.date}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                <div className="text-xl font-bold text-[#3E2723]">{trx.amount}</div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  trx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {trx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
