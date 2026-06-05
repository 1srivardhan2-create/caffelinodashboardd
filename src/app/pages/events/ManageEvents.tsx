import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PlusCircle, Search, Calendar, Ticket, IndianRupee, MoreHorizontal, MapPin } from 'lucide-react';

export default function ManageEvents() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active Events' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  // Mock data for events
  const mockEvents: any[] = [];

  const filteredEvents = mockEvents.filter(e => e.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">Manage Events</h1>
          <p className="text-[#8B5E3C] mt-2">View and manage all your cafe events.</p>
        </div>
        <Button 
          onClick={() => navigate('/events/create')}
          className="bg-gradient-to-r from-[#8B5E3C] to-[#5C3A21] text-white hover:shadow-lg hover:shadow-[#8B5E3C]/30 border-none px-6 h-12 rounded-xl"
        >
          <PlusCircle className="mr-2 size-5" />
          Create Event
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#E8DCC4] flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#3E2723] text-white shadow-md'
                  : 'text-[#8B5E3C] hover:bg-[#F5E6D3]/50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#E8DCC4] text-[#5C3A21]'
              }`}>
                {mockEvents.filter(e => e.status === tab.id).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B5E3C]" />
          <input 
            type="text" 
            placeholder="Search events..." 
            className="w-full bg-[#FDFBF7] border border-[#E8DCC4] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 text-[#3E2723] placeholder:text-[#A89F91]"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-[#E8DCC4] border-dashed rounded-3xl p-16 text-center">
          <div className="bg-[#F5E6D3] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="size-8 text-[#8B5E3C]" />
          </div>
          <h3 className="text-xl font-bold text-[#3E2723] mb-2">No {activeTab} events</h3>
          <p className="text-[#8B5E3C]">When you create events, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-[0_8px_30px_rgba(139,94,60,0.12)] transition-all duration-300 group cursor-pointer h-full flex flex-col">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img 
                    src={event.banner} 
                    alt={event.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white transition-colors">
                    <MoreHorizontal className="size-5 text-[#8B5E3C]" />
                  </div>
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    event.status === 'active' ? 'bg-green-500 text-white' :
                    event.status === 'drafts' ? 'bg-gray-500 text-white' :
                    event.status === 'completed' ? 'bg-[#8B5E3C] text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {event.status}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#3E2723] mb-3 line-clamp-1 group-hover:text-[#8B5E3C] transition-colors">{event.name}</h3>
                  
                  <div className="space-y-2 mb-5 flex-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="size-4 mr-2 text-[#C19A6B]" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="size-4 mr-2 text-[#C19A6B]" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[#E8DCC4] flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[10px] font-bold text-[#A89F91] uppercase tracking-wider mb-1">Tickets Sold</p>
                      <div className="flex items-center gap-1 text-[#3E2723] font-semibold">
                        <Ticket className="size-4 text-[#8B5E3C]" />
                        {event.ticketsSold}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#A89F91] uppercase tracking-wider mb-1">Revenue</p>
                      <div className="flex items-center justify-end gap-1 text-[#3E2723] font-semibold">
                        <IndianRupee className="size-4 text-green-600" />
                        {event.revenue}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
