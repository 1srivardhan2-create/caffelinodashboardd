import { useState } from 'react';
import { useNavigate } from 'react-router';
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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [isPublished, setIsPublished] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    banner: '',
    cafe: '',
    venue: '',
    address: '',
    mapsLink: '',
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
    instagram: '',
    website: '',
    // Payment Fields
    accHolderName: '',
    bankName: '',
    accNumber: '',
    confirmAccNumber: '',
    ifscCode: '',
    upiId: '',
    panNumber: '',
    gstNumber: '',
  });

  const [errors, setErrors] = useState({
    accNumber: '',
    confirmAccNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const validatePayment = () => {
    let isValid = true;
    const newErrors = { accNumber: '', confirmAccNumber: '', ifscCode: '', upiId: '' };

    if (formData.accNumber !== formData.confirmAccNumber) {
      newErrors.confirmAccNumber = 'Account numbers do not match';
      isValid = false;
    }
    
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
      isValid = false;
    }

    if (formData.upiId && !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      newErrors.upiId = 'Invalid UPI ID format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = () => {
    toast.success('Event draft saved successfully!');
    navigate('/events/manage');
  };

  const handlePublish = () => {
    if (currentStep === 7) {
      if (!validatePayment()) {
        toast.error('Please fix payment details errors.');
        return;
      }
      
      if (!formData.accNumber || !formData.ifscCode) {
        toast.error('Account Number and IFSC Code are mandatory.');
        return;
      }
    }
    
    setIsPublished(true);
    toast.success('Event published successfully!');
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
    const maskedAccount = formData.accNumber.length > 4 
      ? `•••• ${formData.accNumber.slice(-4)}` 
      : '••••';

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
                  <p className="font-bold text-[#3E2723]">{formData.bankName || 'Bank'}</p>
                  <p className="text-sm font-medium text-gray-500">{maskedAccount}</p>
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
          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">Create New Event</h1>
          <p className="text-[#8B5E3C] mt-2">Fill in the details to host a premium experience.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            className="border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50 hover:text-[#5C3A21]"
          >
            <Save className="mr-2 size-4" />
            Save Draft
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
                  className="bg-[#3E2723] text-white hover:bg-[#5C3A21] px-8"
                >
                  Next Step
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  className="bg-gradient-to-r from-[#8B5E3C] to-[#5C3A21] text-white hover:shadow-lg hover:shadow-[#8B5E3C]/30 px-8 border-none"
                >
                  Publish Event
                  <CheckCircle2 className="ml-2 size-4" />
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
