import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { motion } from 'motion/react';
import { PlusCircle, Calendar, MapPin, Ticket, IndianRupee, MoreVertical, Edit, Trash2, Globe, EyeOff, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function MyEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/events/my-events');
      if (res.success) {
        setEvents(res.events);
      }
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePublish = async (id: string, currentStatus: string) => {
    try {
      const endpoint = currentStatus === 'published' ? `/api/events/unpublish/${id}` : `/api/events/publish/${id}`;
      const res = await api.post(endpoint, {});
      if (res.success) {
        toast.success(`Event ${currentStatus === 'published' ? 'unpublished' : 'published'}`);
        fetchEvents();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await api.delete(`/api/events/delete/${id}`);
      if (res.success) {
        toast.success('Event deleted');
        fetchEvents();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5E3C]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">My Events</h1>
          <p className="text-[#8B5E3C] mt-2">Manage all your upcoming and past events.</p>
        </div>
        <Button 
          onClick={() => navigate('/events/create')}
          className="bg-gradient-to-r from-[#8B5E3C] to-[#5C3A21] text-white hover:shadow-lg border-none"
        >
          <PlusCircle className="mr-2 size-4" />
          Create New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-[#E8DCC4] rounded-2xl p-12 text-center shadow-sm">
          <div className="bg-[#F5E6D3] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="size-8 text-[#8B5E3C]" />
          </div>
          <h2 className="text-xl font-bold text-[#3E2723] mb-2">No events found</h2>
          <p className="text-[#8B5E3C] mb-6">You haven't created any events yet.</p>
          <Button 
            onClick={() => navigate('/events/create')}
            className="bg-[#3E2723] text-white hover:bg-[#5C3A21]"
          >
            Create Your First Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={event._id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8DCC4] shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {event.bannerUrl ? (
                  <img src={event.bannerUrl} alt={event.eventName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm ${
                    event.status === 'published' ? 'bg-green-500/90 text-white' : 
                    event.status === 'draft' ? 'bg-orange-500/90 text-white' : 
                    'bg-gray-500/90 text-white'
                  }`}>
                    {event.status}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-white/90 text-[#3E2723] rounded-md backdrop-blur-md shadow-sm">
                    {event.ticketType === 'paid' ? `₹${event.ticketPrice}` : 'Free'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-[#3E2723] mb-1 line-clamp-1">{event.eventName || 'Untitled Event'}</h3>
                <p className="text-sm text-[#8B5E3C] mb-4 line-clamp-1">{event.eventCategory || 'Uncategorized'}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="size-4 mr-2 text-[#C19A6B]" />
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'} • {event.startTime || 'TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="size-4 mr-2 text-[#C19A6B]" />
                    <span className="line-clamp-1">{event.venueName || 'Venue TBD'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Ticket className="size-4 mr-2 text-[#C19A6B]" />
                    {event.ticketsSold} / {event.maxSeats || '∞'} sold
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[#E8DCC4] flex items-center justify-between gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/events/edit/${event._id}`)}
                    className="flex-1 text-[#8B5E3C] border-[#E8DCC4] hover:bg-[#F5E6D3]/50"
                  >
                    <Edit className="size-4 mr-1.5" /> Edit
                  </Button>
                  
                  {event.status === 'published' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePublish(event._id, event.status)}
                      className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <EyeOff className="size-4 mr-1.5" /> Unpublish
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePublish(event._id, event.status)}
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Globe className="size-4 mr-1.5" /> Publish
                    </Button>
                  )}

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(event._id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
