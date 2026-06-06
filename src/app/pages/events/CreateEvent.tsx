import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../../../services/api';
import { api } from '../../../services/api';
import { useEventAuth } from '../../context/EventAuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Copy } from 'lucide-react';
import { 
  Step1BasicInfo, 
  Step2Banner, 
  Step3Location, 
  Step4DateTime, 
  Step5Tickets, 
  Step6Organizer,
  Step7PaymentSettlement
} from '../../components/events/WizardSteps';
import EventPreviewCard from '../../components/events/EventPreviewCard';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [isPublished, setIsPublished] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(eventId || localStorage.getItem('currentDraftId'));
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [eventStatus, setEventStatus] = useState<string>('draft');

  const { user } = useEventAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    bannerUrl: '',
    bannerPublicId: '',
    cafe: '',
    venue: '',
    address: '',
    mapsLink: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    date: '',
    startTime: '',
    endTime: '',
    isPaid: false,
    price: '',
    maxSeats: '',
    availableSeats: '',
    orgName: '',
    email: '',
    phone: '',
    eventInstagramId: '',
    // Payment Fields
    accHolderName: '',
    paymentMobileNumber: '',
    upiId: '',
    confirmUpiId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        orgName: prev.orgName || user.fullName,
        email: prev.email || user.email
      }));
    }
  }, [user]);

  // Load draft or edit event on mount
  useEffect(() => {
    const loadDraft = async () => {
      const idToLoad = eventId || draftId;
      if (idToLoad) {
        try {
          const data = await api.get(`/api/events/edit/${idToLoad}`);
          if (data.success && data.event) {
            const ev = data.event;
            setEventStatus(ev.status);
            setFormData(prev => ({
              ...prev,
              name: ev.eventName || '',
              description: ev.eventDescription || '',
              category: ev.eventCategory || '',
              bannerUrl: ev.bannerUrl || '',
              bannerPublicId: ev.bannerPublicId || '',
              cafe: ev.cafeName || '',
              venue: ev.venueName || '',
              address: ev.address || '',
              mapsLink: ev.googleMapsLink || '',
              city: ev.city || '',
              state: ev.state || '',
              country: ev.country || '',
              pincode: ev.pincode || '',
              date: ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '',
              startTime: ev.startTime || '',
              endTime: ev.endTime || '',
              isPaid: ev.ticketType === 'paid',
              price: ev.ticketPrice?.toString() || '',
              maxSeats: ev.maxSeats?.toString() || '',
              orgName: ev.organizerName || user?.fullName || '',
              email: ev.email || user?.email || '',
              phone: ev.phone || '',
              eventInstagramId: ev.eventInstagramId || '',
              accHolderName: ev.accountHolderName || '',
              paymentMobileNumber: ev.paymentMobileNumber || '',
              upiId: ev.upiId || '',
              confirmUpiId: ev.upiId || '',
            }));
            if (!eventId) {
              toast.success('Draft restored successfully');
            }
          } else if (!eventId) {
            localStorage.removeItem('currentDraftId');
            setDraftId(null);
          }
        } catch (err) {
          console.error('Failed to load event');
        }
      }
    };
    loadDraft();
  }, [eventId, draftId, user]);

  const [errors, setErrors] = useState({
    paymentMobileNumber: '',
    upiId: '',
    confirmUpiId: ''
  });

  const validatePayment = () => {
    let isValid = true;
    const newErrors = { paymentMobileNumber: '', upiId: '', confirmUpiId: '' };

    if (!formData.paymentMobileNumber || !/^\d{10}$/.test(formData.paymentMobileNumber)) {
      newErrors.paymentMobileNumber = 'Valid 10-digit mobile number is required';
      isValid = false;
    }

    if (formData.upiId !== formData.confirmUpiId) {
      newErrors.confirmUpiId = 'UPI IDs do not match';
      isValid = false;
    }
    
    if (!formData.upiId || !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      newErrors.upiId = 'Invalid UPI ID format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePhone = () => {
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits.');
      return false;
    }
    return true;
  };

  const triggerAutoSave = async () => {
    setIsSavingDraft(true);
    try {
      const currentEventId = eventId || draftId;
      const payload = {
        ...(currentEventId ? { _id: currentEventId } : {}),
        eventName: formData.name,
        eventDescription: formData.description,
        eventCategory: formData.category,
        bannerUrl: formData.bannerUrl,
        bannerPublicId: formData.bannerPublicId,
        cafeName: formData.cafe,
        venueName: formData.venue,
        address: formData.address,
        googleMapsLink: formData.mapsLink,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        eventDate: formData.date || null,
        startTime: formData.startTime,
        endTime: formData.endTime,
        ticketType: formData.isPaid ? 'paid' : 'free',
        ticketPrice: Number(formData.price) || 0,
        maxSeats: Number(formData.maxSeats) || 0,
        organizerName: formData.orgName,
        email: formData.email,
        phone: formData.phone,
        eventInstagramId: formData.eventInstagramId,
        accountHolderName: formData.accHolderName,
        paymentMobileNumber: formData.paymentMobileNumber,
        upiId: formData.upiId,
        organizerId: user?.id,
      };

      const endpoint = currentEventId ? `/api/events/update/${currentEventId}` : '/api/events/save-draft';
      const res = await api.post(endpoint, payload);
      
      if (res.success && res.event && !currentEventId) {
        setDraftId(res.event._id);
        if (!eventId) {
          localStorage.setItem('currentDraftId', res.event._id);
        }
        toast.success('Draft Saved');
      } else if (res.success && currentEventId) {
        // Automatically saved
      }
    } catch (err) {
      console.error('Auto save failed', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      await triggerAutoSave();
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = async () => {
    await triggerAutoSave();
    navigate('/events/dashboard');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!validatePhone()) return;

    if (currentStep === 7 && formData.isPaid) {
      if (!validatePayment()) {
        toast.error('Please fix payment details errors.');
        return;
      }
      
      if (!formData.paymentMobileNumber || !formData.upiId) {
        toast.error('Payment Mobile Number and UPI ID are mandatory.');
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      const currentEventId = eventId || draftId;
      const payload = {
        ...(currentEventId ? { _id: currentEventId } : {}),
        eventName: formData.name,
        eventDescription: formData.description,
        eventCategory: formData.category,
        bannerUrl: formData.bannerUrl,
        bannerPublicId: formData.bannerPublicId,
        cafeName: formData.cafe,
        venueName: formData.venue,
        address: formData.address,
        googleMapsLink: formData.mapsLink,
        city: formData.city || 'Default City',
        state: formData.state || 'Default State',
        country: formData.country || 'Default Country',
        pincode: formData.pincode || '000000',
        eventDate: formData.date || new Date().toISOString(),
        startTime: formData.startTime || '00:00',
        endTime: formData.endTime || '23:59',
        ticketType: formData.isPaid ? 'paid' : 'free',
        ticketPrice: Number(formData.price) || 0,
        maxSeats: Number(formData.maxSeats) || 0,
        organizerName: formData.orgName || 'Organizer',
        email: formData.email || 'email@example.com',
        phone: formData.phone || '0000000000',
        eventInstagramId: formData.eventInstagramId,
        accountHolderName: formData.accHolderName,
        paymentMobileNumber: formData.paymentMobileNumber,
        upiId: formData.upiId,
        organizerId: user?.id,
      };

      let data;
      if (currentEventId && eventStatus === 'published') {
        // Just update it and don't change status to published again, it's already published
        data = await api.post(`/api/events/update/${currentEventId}`, payload);
        if (data.success) {
          setIsPublished(true);
          if (!eventId) localStorage.removeItem('currentDraftId');
          toast.success('Event updated successfully!');
        } else {
          toast.error(data.message || 'Failed to update event');
        }
        return;
      }

      data = await api.post(currentEventId ? `/api/events/update/${currentEventId}` : '/api/events/create', payload);

      if (data.success) {
        const idToPublish = data.event._id;
        const publishRes = await api.post(`/api/events/publish/${idToPublish}`, {});
        if (publishRes.success) {
          setIsPublished(true);
          localStorage.removeItem('currentDraftId');
          setDraftId(null);
          toast.success('Event published successfully!');
        } else {
          toast.error(publishRes.message || 'Saved but failed to publish.');
        }
      } else {
        toast.error(data.message || 'Failed to publish event');
      }
    } catch (error) {
      toast.error('An error occurred during publishing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Basic Information',
    'Event Banner',
    'Location',
    'Date & Time',
    'Tickets',
    'Organizer Information',
    'Payment Settlement'
  ];

  if (isPublished) {
  const maskedUPI = formData.upiId ? formData.upiId : '';

    return (
      <div className="max-w-3xl mx-auto pt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#E8DCC4] text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="size-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-[#3E2723] tracking-tight mb-2">Event Published Successfully</h1>
          <p className="text-[#8B5E3C] text-lg mb-10">Your event is now live and ready for registrations.</p>
          
          <div className="bg-[#FDFBF7] rounded-2xl p-6 mb-8 text-left border border-[#E8DCC4]">
            <h3 className="font-bold text-[#3E2723] mb-4 text-xl">{formData.name || 'Your Event'}</h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ticket Price</p>
                <p className="font-medium text-[#3E2723]">{formData.isPaid ? `₹ ${formData.price}` : 'Free'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="font-medium text-[#3E2723]">{formData.date || 'TBD'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Venue</p>
                <p className="font-medium text-[#3E2723]">{formData.venue || 'TBD'} {formData.cafe ? `at ${formData.cafe}` : ''}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#E8DCC4]">
              <p className="text-xs text-[#8B5E3C] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                Organizer Settlement Account
              </p>
              <div className="bg-white p-3 rounded-lg border border-[#E8DCC4] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#3E2723]">Payment Details</p>
                  <p className="text-sm font-medium text-gray-500">{maskedUPI}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[#8B5E3C]"><Copy className="size-4" /></Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/events/dashboard')}
              className="bg-[#3E2723] text-white hover:bg-[#5C3A21] px-8 h-12 rounded-xl"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/events/manage')}
              variant="outline"
              className="border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50 px-8 h-12 rounded-xl"
            >
              Manage Events
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">{eventId ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="text-[#8B5E3C] mt-2">Fill in the details to host a premium experience.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50 hover:text-[#5C3A21]"
          >
            <Save className="mr-2 size-4" />
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={handlePublish}
            className="bg-gradient-to-r from-[#8B5E3C] to-[#5C3A21] text-white hover:shadow-lg hover:shadow-[#8B5E3C]/30 border-none"
          >
            <CheckCircle2 className="mr-2 size-4" />
            Publish Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Wizard Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress Indicator */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC4]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[#8B5E3C] uppercase tracking-wider">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-[#3E2723]">
                {stepTitles[currentStep - 1]}
              </span>
            </div>
            <div className="w-full bg-[#F5E6D3] h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#8B5E3C] to-[#C19A6B]"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E8DCC4] min-h-[500px] flex flex-col">
            <h2 className="text-2xl font-bold text-[#3E2723] mb-6">{stepTitles[currentStep - 1]}</h2>
            
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
                  {currentStep === 2 && <Step2Banner formData={formData} setFormData={setFormData} />}
                  {currentStep === 3 && <Step3Location formData={formData} setFormData={setFormData} />}
                  {currentStep === 4 && <Step4DateTime formData={formData} setFormData={setFormData} />}
                  {currentStep === 5 && <Step5Tickets formData={formData} setFormData={setFormData} />}
                  {currentStep === 6 && <Step6Organizer formData={formData} setFormData={setFormData} />}
                  {currentStep === 7 && <Step7PaymentSettlement formData={formData} setFormData={setFormData} errors={errors} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E8DCC4]">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50"
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={isSavingDraft}
                  className="bg-[#3E2723] text-white hover:bg-[#5C3A21] px-8"
                >
                  {isSavingDraft ? 'Saving...' : 'Next Step'}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#8B5E3C] to-[#5C3A21] text-white hover:shadow-lg hover:shadow-[#8B5E3C]/30 px-8 border-none"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Event'}
                  {!isSubmitting && <CheckCircle2 className="ml-2 size-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <h3 className="text-sm font-bold text-[#8B5E3C] uppercase tracking-wider mb-4 px-2">Live Preview</h3>
            <EventPreviewCard formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
