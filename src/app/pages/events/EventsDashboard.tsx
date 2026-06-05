import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../../services/api';
import { useEventAuth } from '../../context/EventAuthContext';
import { motion } from 'motion/react';
import { 
  CalendarDays, 
  Ticket, 
  IndianRupee, 
  Flame,
  PlusCircle,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import { Card } from '../../components/ui/card';

export default function EventsDashboard() {
  const navigate = useNavigate();
  const { user } = useEventAuth();
  const [statsData, setStatsData] = useState({
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    totalTicketsSold: 0,
    totalRegistrations: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id) {
        try {
          const res = await api.get(`/api/events/dashboard?organizerId=${user.id}`);
          if (res.success) {
            setStatsData(res.stats);
          }
        } catch (err) {
          console.error("Failed to load dashboard stats", err);
        }
      }
    };
    fetchStats();
  }, [user]);

  const stats = [
    { label: 'Total Events', value: statsData.totalEvents.toString(), icon: CalendarDays, color: 'from-[#8B5E3C] to-[#5C3A21]' },
    { label: 'Tickets Sold', value: statsData.totalTicketsSold.toString(), icon: Ticket, color: 'from-[#C19A6B] to-[#A87B45]' },
    { label: 'Total Revenue', value: `₹ ${statsData.totalRevenue}`, icon: IndianRupee, color: 'from-[#2C3E50] to-[#1A252F]' },
    { label: 'Upcoming Events', value: statsData.upcomingEvents.toString(), icon: Flame, color: 'from-[#E67E22] to-[#D35400]' },
  ];

  const actions = [
    { label: 'Create Event', icon: PlusCircle, route: '/events/create', desc: 'Host a new experience' },
    { label: 'View Analytics', icon: BarChart3, route: '/events/dashboard', desc: 'Track performance' },
    { label: 'Registrations', icon: Users, route: '/events/dashboard', desc: 'Manage attendees' },
    { label: 'Manage Events', icon: Settings, route: '/events/manage', desc: 'Edit & update events' },
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
      <div>
        <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">Dashboard Overview</h1>
        <p className="text-[#8B5E3C] mt-2">Welcome back! Here's what's happening with your events.</p>
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
              <Card className="relative overflow-hidden group cursor-pointer border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(139,94,60,0.12)] transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg text-white transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="size-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#3E2723] mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-[#8B5E3C] uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
                {/* Decorative blur */}
                <div className={`absolute -bottom-6 -right-6 size-24 bg-gradient-to-br ${stat.color} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-[#3E2723] mb-6">Quick Actions</h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  onClick={() => navigate(action.route)}
                  className="h-full bg-white/60 backdrop-blur-md border border-[#E8DCC4] rounded-2xl p-6 cursor-pointer hover:bg-gradient-to-br hover:from-white hover:to-[#FDFBF7] shadow-sm hover:shadow-[0_8px_30px_rgba(139,94,60,0.08)] transition-all duration-300 group"
                >
                  <div className="bg-[#F5E6D3] w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#8B5E3C] transition-colors duration-300">
                    <Icon className="size-6 text-[#8B5E3C] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-[#3E2723] mb-2">{action.label}</h3>
                  <p className="text-sm text-gray-500">{action.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
