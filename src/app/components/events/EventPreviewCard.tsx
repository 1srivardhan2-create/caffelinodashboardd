import { Card } from '../ui/card';
import { MapPin, Calendar, Clock, IndianRupee, Users } from 'lucide-react';

export default function EventPreviewCard({ formData }: any) {
  // Use a default banner if none uploaded
  const bannerImg = formData.banner || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200&h=675';
  
  return (
    <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white sticky top-24">
      {/* Banner */}
      <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
        <img 
          src={bannerImg} 
          alt="Event Banner" 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {formData.category && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[#8B5E3C] shadow-sm">
            {formData.category}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Title & Description */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-[#3E2723] leading-tight mb-2">
            {formData.name || 'Event Title Preview'}
          </h2>
          <p className="text-gray-500 text-sm line-clamp-2">
            {formData.description || 'Add a description to see how it looks here.'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 bg-[#F5E6D3] p-2 rounded-lg">
              <Calendar className="size-4 text-[#8B5E3C]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</p>
              <p className="text-sm font-medium text-[#3E2723]">
                {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 bg-[#F5E6D3] p-2 rounded-lg">
              <Clock className="size-4 text-[#8B5E3C]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</p>
              <p className="text-sm font-medium text-[#3E2723]">
                {formData.startTime || 'Time'} - {formData.endTime || 'Time'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 col-span-2">
            <div className="mt-0.5 bg-[#F5E6D3] p-2 rounded-lg">
              <MapPin className="size-4 text-[#8B5E3C]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Venue</p>
              <p className="text-sm font-medium text-[#3E2723]">
                {formData.venue || 'Event Venue'}{formData.cafe ? ` at ${formData.cafe}` : ''}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {formData.address || 'Address'}
              </p>
            </div>
          </div>
        </div>

        {/* Price & Seats footer */}
        <div className="pt-4 border-t border-[#E8DCC4] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Price</p>
            {formData.isPaid ? (
              <div className="flex items-center gap-1 text-[#3E2723] font-bold text-xl">
                <IndianRupee className="size-5" />
                <span>{formData.price || '0'}</span>
              </div>
            ) : (
              <span className="text-[#8B5E3C] font-bold text-xl">Free</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Capacity</p>
            <div className="flex items-center justify-end gap-1 text-gray-600 font-medium">
              <Users className="size-4" />
              <span>{formData.maxSeats || '0'} seats</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
