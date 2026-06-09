import React, { useState, useEffect } from 'react';
import { useEventAuth } from '../../context/EventAuthContext';
import { api } from '../../../services/api';
import { Ticket, Search, User, Phone, Mail, CalendarDays, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { Input } from '../../components/ui/input';

interface TicketData {
  _id: string;
  ticketNumber: string;
  status: string;
  eventId: {
    _id: string;
    eventName: string;
    cafeName: string;
  };
  registrationId: {
    userName: string;
    email: string;
    phone: string;
    amountPaid: number;
  };
  createdAt: string;
}

export default function TicketsList() {
  const { user } = useEventAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/events/my-tickets', {
          params: { organizerId: user?.id }
        });
        if (res.data.success) {
          setTickets(res.data.tickets);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTickets();
    }
  }, [user]);

  const uniqueEvents = Array.from(new Map(tickets.filter(t => t.eventId).map(t => [t.eventId._id, t.eventId])).values());

  const filteredTickets = tickets.filter(ticket => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      ticket.ticketNumber.toLowerCase().includes(term) ||
      ticket.registrationId?.userName?.toLowerCase().includes(term) ||
      ticket.registrationId?.email?.toLowerCase().includes(term) ||
      ticket.eventId?.eventName?.toLowerCase().includes(term)
    );
    const matchesEvent = selectedEventId === 'all' || ticket.eventId?._id === selectedEventId;
    return matchesSearch && matchesEvent;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5E3C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#3E2723] to-[#5C3A21] rounded-2xl p-8 text-[#FDFBF7] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Ticket className="w-64 h-64 -mt-16 -mr-16 transform rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Tickets Sold</h1>
          <p className="text-[#E8DCC4] mt-2 max-w-xl text-sm leading-relaxed">
            View all tickets sold across all your events. Access attendee details, ticket IDs, and statuses instantly.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC4] p-4 flex items-center gap-3 flex-1">
          <Search className="size-5 text-[#A89F91]" />
          <Input 
            type="text"
            placeholder="Search by Ticket ID, Name, Email or Event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-base"
          />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC4] p-4 flex items-center gap-3 shrink-0 md:min-w-[250px]">
          <Filter className="size-5 text-[#A89F91]" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-transparent border-none text-[#5C3A21] focus:outline-none focus:ring-0 font-medium cursor-pointer"
          >
            <option value="all">All Events</option>
            {uniqueEvents.map(ev => (
              <option key={ev._id} value={ev._id}>{ev.eventName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#5C3A21]">
            <thead className="bg-[#FFF8F0] border-b border-[#E8DCC4] text-xs uppercase font-bold text-[#8B5E3C]">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Attendee Info</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC4]/50">
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4 text-[#C19A6B]" />
                      <span className="font-bold text-[#3E2723]">{ticket.ticketNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-bold text-[#3E2723] flex items-center gap-2">
                        <User className="size-3" /> {ticket.registrationId?.userName}
                      </p>
                      <p className="text-xs text-[#8B5E3C] flex items-center gap-2">
                        <Mail className="size-3" /> {ticket.registrationId?.email}
                      </p>
                      <p className="text-xs text-[#8B5E3C] flex items-center gap-2">
                        <Phone className="size-3" /> {ticket.registrationId?.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#3E2723]">{ticket.eventId?.eventName}</p>
                    <p className="text-xs text-[#8B5E3C]">{ticket.eventId?.cafeName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'used' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {ticket.status === 'active' ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                      {ticket.status.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#8B5E3C] flex items-center gap-2">
                      <CalendarDays className="size-3" /> 
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              ))}
              
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#8B5E3C]">
                    No tickets found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
