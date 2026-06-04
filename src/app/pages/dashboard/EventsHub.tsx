import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, CalendarPlus, BarChart3 } from 'lucide-react';
import EventDashboard from '../../components/events/EventDashboard';
import CreateEvent from '../../components/events/CreateEvent';

export default function EventsHub() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FDFBF7] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-[#4A3B32] to-[#8C6D53] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Ticket className="w-64 h-64 transform rotate-12" />
          </div>
          
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-2 shadow-sm">
              <span className="text-[#D4AF37]">🎟️</span> Premium Organizer Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              Caffelino Events Hub
            </h1>
            <p className="text-[#FDFBF7] text-lg max-w-xl opacity-90">
              Create, manage, and monetize events across our premium cafe network. Turn spaces into vibrant experiences.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 p-2 bg-white rounded-2xl shadow-sm border border-[#E8E1D9] w-fit relative z-20">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-[#4A3B32] text-white shadow-md'
                : 'text-[#8C6D53] hover:bg-[#FDFBF7]'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Event Dashboard
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-[#4A3B32] text-white shadow-md'
                : 'text-[#8C6D53] hover:bg-[#FDFBF7]'
            }`}
          >
            <CalendarPlus className="w-5 h-5" />
            Create Event
          </button>
        </div>

        {/* Content Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EventDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CreateEvent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
