import { useState } from 'react';
import { UploadCloud, CheckCircle2, ShieldCheck, MapPin, Clock, Users, DollarSign, Calendar, IndianRupee } from 'lucide-react';

export default function CreateEvent() {
  const [eventType, setEventType] = useState('Paid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E1D9] p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500">Provide the main details for your event</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Event Name</label>
              <input type="text" required placeholder="e.g. Sunday Acoustic Night" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Event Description</label>
              <textarea required rows={3} placeholder="Tell people what this event is about..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all resize-none"></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Event Category</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all bg-white">
                <option>Live Music</option>
                <option>Open Mic</option>
                <option>Workshop</option>
                <option>Coffee Meetup</option>
                <option>Comedy Show</option>
                <option>Networking</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Event Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E1D9] p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center">
              <span className="text-xl">🖼️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Event Banner</h2>
              <p className="text-sm text-gray-500">Upload a high-quality image (Recommended: 1200 × 675)</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-amber-50/50 transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-[#8C6D53]" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>
        </div>

        {/* Location & Time */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E1D9] p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center">
              <span className="text-xl">📍</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Location & Time</h2>
              <p className="text-sm text-gray-500">Where and when is it happening?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/> Select Cafe Location</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all bg-white">
                <option>Caffelino Downtown</option>
                <option>Caffelino Westside</option>
                <option>Caffelino Northpark</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400"/> Event Date</label>
              <input type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all text-gray-700" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> Time (Start - End)</label>
              <div className="flex items-center gap-2">
                <input type="time" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all text-gray-700" />
                <span className="text-gray-400">-</span>
                <input type="time" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E1D9] p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#8C6D53]/10 flex items-center justify-center">
              <span className="text-xl">🎟️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Capacity & Pricing</h2>
              <p className="text-sm text-gray-500">Set your limits and ticket price</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400"/> Total Seats (Capacity)</label>
              <input type="number" min="1" required placeholder="e.g. 50" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-400"/> Ticket Type</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setEventType('Free')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${eventType === 'Free' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  Free Event
                </button>
                <button 
                  type="button" 
                  onClick={() => setEventType('Paid')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${eventType === 'Paid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  Paid Event
                </button>
              </div>
            </div>

            {eventType === 'Paid' && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Ticket Price (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" min="1" required placeholder="500" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8C6D53]/50 focus:border-[#8C6D53] outline-none transition-all text-lg font-medium text-gray-900" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Organizer Payment Details (If Paid) */}
        {eventType === 'Paid' && (
          <div className="bg-[#4A3B32] rounded-2xl shadow-xl p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Payment Settlement Details</h2>
                <p className="text-sm text-gray-300">Where should we send your earnings?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Account Holder Name</label>
                <input type="text" required placeholder="Name on bank account" className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Bank Name</label>
                <input type="text" required placeholder="e.g. HDFC Bank" className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Account Number</label>
                <input type="text" required placeholder="XXXX XXXX XXXX" className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">IFSC Code</label>
                <input type="text" required placeholder="e.g. HDFC0001234" className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">UPI ID (Optional)</label>
                <input type="text" placeholder="yourname@bank" className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all" />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || isSuccess}
            className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center min-w-[200px] ${
              isSuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-[#D4AF37] to-[#B49017] hover:from-[#E5C048] hover:to-[#C5A028] text-[#2A211C]'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#2A211C] border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Event Created!
              </span>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
