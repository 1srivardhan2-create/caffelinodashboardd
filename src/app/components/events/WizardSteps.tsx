import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { UploadCloud, MapPin, Calendar as CalendarIcon, Clock, Link as LinkIcon, Instagram, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export const Step1BasicInfo = ({ formData, setFormData }: any) => {
  const categories = [
    { id: 'music', label: '🎵 Live Music' },
    { id: 'mic', label: '🎤 Open Mic' },
    { id: 'coffee', label: '☕ Coffee Meetup' },
    { id: 'workshop', label: '🎨 Workshop' },
    { id: 'comedy', label: '🤣 Comedy Night' },
    { id: 'networking', label: '💼 Networking' },
    { id: 'other', label: '🎭 Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[#3E2723] font-semibold">Event Name</Label>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Acoustic Evening at Caffelino" 
          className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-[#3E2723] font-semibold">Event Description</Label>
        <Textarea 
          id="description" 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What's this event about?" 
          className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white min-h-[120px] resize-none"
        />
      </div>
      <div className="space-y-3">
        <Label className="text-[#3E2723] font-semibold">Event Category</Label>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setFormData({ ...formData, category: cat.label })}
              className={`px-4 py-2 rounded-full cursor-pointer border transition-all duration-300 text-sm font-medium ${
                formData.category === cat.label 
                  ? 'bg-gradient-to-r from-[#8B5E3C] to-[#5C3A21] text-white border-transparent shadow-md' 
                  : 'bg-white border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50'
              }`}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Step2Banner = ({ formData, setFormData }: any) => {
  const handleSimulateUpload = () => {
    // Mocking an image upload by just setting a placeholder premium image
    setFormData({ ...formData, banner: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1200&h=675' });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[#3E2723] font-semibold">Event Banner</Label>
        <p className="text-sm text-gray-500">Recommended size: 1200 x 675px</p>
        
        {!formData.banner ? (
          <div 
            onClick={handleSimulateUpload}
            className="mt-4 border-2 border-dashed border-[#C19A6B] rounded-2xl p-12 flex flex-col items-center justify-center bg-[#FDFBF7] cursor-pointer hover:bg-[#F5E6D3]/40 transition-colors duration-300 group"
          >
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="size-8 text-[#8B5E3C]" />
            </div>
            <p className="text-[#3E2723] font-medium mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden mt-4 border border-[#E8DCC4] shadow-sm group">
            <img src={formData.banner} alt="Banner Preview" className="w-full h-auto object-cover aspect-[16/9]" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button onClick={() => setFormData({ ...formData, banner: '' })} variant="secondary" className="bg-white text-red-600 hover:bg-white/90">
                Remove Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Step3Location = ({ formData, setFormData }: any) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cafe" className="text-[#3E2723] font-semibold">Select Cafe</Label>
        <select 
          id="cafe"
          value={formData.cafe}
          onChange={(e) => setFormData({ ...formData, cafe: e.target.value })}
          className="w-full border border-[#E8DCC4] rounded-md h-12 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/50"
        >
          <option value="">Choose a cafe...</option>
          <option value="Caffelino Downtown">Caffelino Downtown</option>
          <option value="Caffelino Westside">Caffelino Westside</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="venue" className="text-[#3E2723] font-semibold">Event Venue / Room</Label>
        <Input 
          id="venue" 
          value={formData.venue} 
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          placeholder="e.g. Main Hall, Rooftop" 
          className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-[#3E2723] font-semibold">Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input 
            id="address" 
            value={formData.address} 
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full street address" 
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maps" className="text-[#3E2723] font-semibold">Google Maps Link</Label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input 
            id="maps" 
            value={formData.mapsLink} 
            onChange={(e) => setFormData({ ...formData, mapsLink: e.target.value })}
            placeholder="https://maps.google.com/..." 
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export const Step4DateTime = ({ formData, setFormData }: any) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date" className="text-[#3E2723] font-semibold">Event Date</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input 
            id="date" 
            type="date"
            value={formData.date} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-[#3E2723] font-semibold">Start Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input 
              id="startTime" 
              type="time"
              value={formData.startTime} 
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-[#3E2723] font-semibold">End Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input 
              id="endTime" 
              type="time"
              value={formData.endTime} 
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Step5Tickets = ({ formData, setFormData }: any) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => setFormData({ ...formData, isPaid: false })}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
            !formData.isPaid 
              ? 'border-[#8B5E3C] bg-[#F5E6D3]/40' 
              : 'border-[#E8DCC4] bg-white hover:border-[#C19A6B]'
          }`}
        >
          <div className={`font-bold text-lg mb-1 ${!formData.isPaid ? 'text-[#8B5E3C]' : 'text-gray-600'}`}>Free Event</div>
          <div className="text-sm text-gray-500">Anyone can join</div>
        </div>
        <div 
          onClick={() => setFormData({ ...formData, isPaid: true })}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
            formData.isPaid 
              ? 'border-[#8B5E3C] bg-[#F5E6D3]/40' 
              : 'border-[#E8DCC4] bg-white hover:border-[#C19A6B]'
          }`}
        >
          <div className={`font-bold text-lg mb-1 ${formData.isPaid ? 'text-[#8B5E3C]' : 'text-gray-600'}`}>Paid Event</div>
          <div className="text-sm text-gray-500">Sell tickets</div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, height: 0 }} 
        animate={{ opacity: formData.isPaid ? 1 : 0, height: formData.isPaid ? 'auto' : 0 }}
        className="overflow-hidden space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="price" className="text-[#3E2723] font-semibold">Ticket Price (₹)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
            <Input 
              id="price" 
              type="number"
              value={formData.price} 
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00" 
              className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-8 font-medium text-lg"
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxSeats" className="text-[#3E2723] font-semibold">Maximum Seats</Label>
          <Input 
            id="maxSeats" 
            type="number"
            value={formData.maxSeats} 
            onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value, availableSeats: e.target.value })}
            placeholder="e.g. 50" 
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableSeats" className="text-[#3E2723] font-semibold">Available Seats</Label>
          <Input 
            id="availableSeats" 
            type="number"
            value={formData.availableSeats} 
            onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-gray-50 h-12 text-gray-500"
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export const Step6Organizer = ({ formData, setFormData }: any) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="orgName" className="text-[#3E2723] font-semibold">Organizer Name</Label>
        <Input 
          id="orgName" 
          value={formData.orgName} 
          onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
          placeholder="e.g. John Doe / Acoustic Vibes" 
          className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#3E2723] font-semibold">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="hello@example.com" 
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[#3E2723] font-semibold">Phone Number</Label>
          <Input 
            id="phone" 
            type="tel"
            value={formData.phone} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210" 
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram" className="text-[#3E2723] font-semibold">Instagram Link</Label>
        <div className="relative">
          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input 
            id="instagram" 
            value={formData.instagram} 
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="https://instagram.com/..." 
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website" className="text-[#3E2723] font-semibold">Website (Optional)</Label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input 
            id="website" 
            value={formData.website} 
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://..." 
            className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-12 pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export const Step7PaymentSettlement = ({ formData, setFormData, errors }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#FDFBF7] border border-[#E8DCC4] p-4 rounded-xl flex gap-3 mb-6">
        <div className="bg-[#F5E6D3] p-2 rounded-lg shrink-0 h-fit">
          <ShieldCheck className="size-5 text-[#8B5E3C]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#3E2723]">Secure Settlement</h4>
          <p className="text-xs text-[#8B5E3C] mt-1 leading-relaxed">
            Your ticket revenue will be settled to this account after successful event registrations. All details are encrypted and stored securely.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#3E2723] flex items-center gap-2 border-b border-[#E8DCC4] pb-2">
          <Lock className="size-4 text-[#8B5E3C]" /> Bank Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accHolderName" className="text-[#3E2723] font-semibold">Account Holder Name</Label>
            <Input 
              id="accHolderName" 
              value={formData.accHolderName} 
              onChange={(e) => setFormData({ ...formData, accHolderName: e.target.value })}
              placeholder="As per bank records" 
              className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-[#3E2723] font-semibold">Bank Name</Label>
            <Input 
              id="bankName" 
              value={formData.bankName} 
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. HDFC Bank" 
              className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accNumber" className="text-[#3E2723] font-semibold">Account Number</Label>
            <Input 
              id="accNumber"
              type="password"
              value={formData.accNumber} 
              onChange={(e) => setFormData({ ...formData, accNumber: e.target.value })}
              placeholder="Enter account number" 
              className={`border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11 ${errors.accNumber ? 'border-red-500' : ''}`}
            />
            {errors.accNumber && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="size-3" /> {errors.accNumber}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmAccNumber" className="text-[#3E2723] font-semibold">Confirm Account Number</Label>
            <Input 
              id="confirmAccNumber"
              type="text"
              value={formData.confirmAccNumber} 
              onChange={(e) => setFormData({ ...formData, confirmAccNumber: e.target.value })}
              placeholder="Re-enter account number" 
              className={`border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11 ${errors.confirmAccNumber ? 'border-red-500' : ''}`}
            />
            {errors.confirmAccNumber && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="size-3" /> {errors.confirmAccNumber}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ifscCode" className="text-[#3E2723] font-semibold">IFSC Code</Label>
            <Input 
              id="ifscCode" 
              value={formData.ifscCode} 
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              placeholder="e.g. HDFC0001234" 
              className={`border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11 ${errors.ifscCode ? 'border-red-500' : ''}`}
            />
            {errors.ifscCode && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="size-3" /> {errors.ifscCode}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiId" className="text-[#3E2723] font-semibold">UPI ID</Label>
            <Input 
              id="upiId" 
              value={formData.upiId} 
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="e.g. user@okicici" 
              className={`border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11 ${errors.upiId ? 'border-red-500' : ''}`}
            />
            {errors.upiId && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="size-3" /> {errors.upiId}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-[#3E2723] flex items-center gap-2 border-b border-[#E8DCC4] pb-2">
          Tax Details (Optional)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="panNumber" className="text-[#3E2723] font-semibold">PAN Number</Label>
            <Input 
              id="panNumber" 
              value={formData.panNumber} 
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F" 
              className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstNumber" className="text-[#3E2723] font-semibold">GST Number</Label>
            <Input 
              id="gstNumber" 
              value={formData.gstNumber} 
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              placeholder="22AAAAA0000A1Z5" 
              className="border-[#E8DCC4] focus-visible:ring-[#8B5E3C] bg-white h-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
