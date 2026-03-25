import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Coffee, Loader2, ChevronLeft, ChevronRight, Upload, Handshake, X } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

export default function PartnerOnboarding() {
  const { registerCafe, isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    openingTime: '',
    closingTime: '',
    category: 'Cafe' as 'Cafe' | 'Restaurant' | 'Cloud Kitchen',
    costPerPerson: '',
    profilePicture: null as File | null,
    profilePictureUrl: '',
    managerName: '',
    managerPhone: '',
    galleryImages: [] as { file: File, url: string }[],
    acceptedTerms: false
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (submitted) {
    return <Navigate to="/verification-pending" replace />;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'profile') {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, profilePicture: file, profilePictureUrl: url });
    } else {
      const newImages: { file: File, url: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error('Skipping non-image file');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Image ${file.name} is larger than 5MB`);
          continue;
        }
        newImages.push({ file, url: URL.createObjectURL(file) });
      }
      setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...newImages] });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.openingTime || !formData.closingTime || !formData.costPerPerson || !formData.profilePicture) {
        toast.error('Please fill all required fields and upload a profile picture');
        return;
      }
    } else if (step === 2) {
      if (!formData.managerName || !formData.managerPhone) {
        toast.error('Please fill all manager details');
        return;
      }
      if (formData.managerPhone.length !== 10) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }
    } else if (step === 3) {
      if (formData.galleryImages.length < 4) {
        toast.error('Please upload at least 4 cafe images for the gallery');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!formData.acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const dbData = new FormData();
      
      // Set to match Backend expected names
      dbData.append('Name', formData.name);
      dbData.append('Cafe_Address', formData.address);
      dbData.append('latitude', formData.latitude.toString());
      dbData.append('longitude', formData.longitude.toString());
      
      // Format opening_hours correctly
      const hours = {
        monday: { open: formData.openingTime, close: formData.closingTime, closed: false },
        tuesday: { open: formData.openingTime, close: formData.closingTime, closed: false },
        wednesday: { open: formData.openingTime, close: formData.closingTime, closed: false },
        thursday: { open: formData.openingTime, close: formData.closingTime, closed: false },
        friday: { open: formData.openingTime, close: formData.closingTime, closed: false },
        saturday: { open: formData.openingTime, close: formData.closingTime, closed: false },
        sunday: { open: formData.openingTime, close: formData.closingTime, closed: false },
      };
      dbData.append('opening_hours', JSON.stringify(hours));
      
      dbData.append('Cafe_type', formData.category);
      dbData.append('Average_Cost', formData.costPerPerson);
      dbData.append('managerName', formData.managerName);
      dbData.append('Phonenumber', formData.managerPhone);
      
      // We pass the logged in user's email 
      dbData.append('email_address_manager', user?.email || `manager_${Date.now()}@test.com`);
      
      if (formData.profilePicture) {
        dbData.append('profile_picture', formData.profilePicture);
      }
      
      formData.galleryImages.forEach((img) => {
        dbData.append('Cafe_photos', img.file);
      });

      // Call context function which uses api.postForm
      await registerCafe(dbData);
      
      toast.success('Application submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      galleryImages: formData.galleryImages.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 p-3 rounded-full">
              <Coffee className="size-6 md:size-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Partner Onboarding</h1>
          <p className="text-sm md:text-base text-gray-600">Join Caffelino as a cafe partner</p>
        </div>

        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center size-8 md:size-10 rounded-full font-semibold text-sm md:text-base ${
                  i <= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i}
                </div>
                {i < 4 && (
                  <div className={`w-8 md:w-16 h-1 mx-1 md:mx-2 ${i < step ? 'bg-orange-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 md:mt-4 px-2">
            <span className="text-xs md:text-sm font-medium text-gray-700">Cafe</span>
            <span className="text-xs md:text-sm font-medium text-gray-700">Manager</span>
            <span className="text-xs md:text-sm font-medium text-gray-700">Gallery</span>
            <span className="text-xs md:text-sm font-medium text-gray-700">Terms</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Handshake className="size-6 text-orange-500" />
                <div>
                  <CardTitle className="text-2xl">Register Your Cafe</CardTitle>
                  <CardDescription>Step {step} of 4 - Let's get your cafe set up</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-orange-900 mb-2">📍 Cafe Details</h3>
                    <p className="text-sm text-orange-800">
                      Tell us about your cafe so customers can find and visit you
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cafe Profile Picture *</Label>
                      {formData.profilePictureUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={formData.profilePictureUrl}
                            alt="Cafe Profile"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFormData({ ...formData, profilePicture: null, profilePictureUrl: '' })}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                          <Upload className="size-12 text-gray-400 mb-3" />
                          <span className="text-sm font-medium text-gray-700">Upload cafe profile picture</span>
                          <span className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUpload(e, 'profile')}
                          />
                        </label>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cafeName">Cafe Name *</Label>
                      <Input
                        id="cafeName"
                        placeholder="e.g., Brew & Bites Cafe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <LocationPicker
                      address={formData.address}
                      onAddressChange={(address) => setFormData({ ...formData, address })}
                      onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="openingTime">Opening Time *</Label>
                        <Input
                          id="openingTime"
                          type="time"
                          value={formData.openingTime}
                          onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closingTime">Closing Time *</Label>
                        <Input
                          id="closingTime"
                          type="time"
                          value={formData.closingTime}
                          onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Business Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cafe">Cafe</SelectItem>
                          <SelectItem value="Restaurant">Restaurant</SelectItem>
                          <SelectItem value="Cloud Kitchen">Cloud Kitchen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerPerson">Approx. Cost per Person *</Label>
                      <Input
                        id="costPerPerson"
                        placeholder="e.g., 500"
                        value={formData.costPerPerson}
                        onChange={e => setFormData({ ...formData, costPerPerson: e.target.value })}
                        type="number"
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">👤 Manager Details</h3>
                    <p className="text-sm text-blue-800">
                      Who will be managing the day-to-day operations?
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">Manager Full Name *</Label>
                      <Input
                        id="managerName"
                        placeholder="John Doe"
                        value={formData.managerName}
                        onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerPhone">Manager Phone Number *</Label>
                      <Input
                        id="managerPhone"
                        placeholder="9876543210"
                        value={formData.managerPhone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, managerPhone: val });
                        }}
                        maxLength={10}
                        inputMode="numeric"
                      />
                      <p className="text-xs text-gray-500">{formData.managerPhone.length}/10 digits</p>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-purple-900 mb-2">📸 Cafe Gallery</h3>
                    <p className="text-sm text-purple-800">
                      Upload at least 4 high-quality photos: Interior, Exterior, Seating, and Ambience
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {formData.galleryImages.map((img, index) => (
                        <div key={index} className="relative aspect-video">
                          <img src={img.url} alt={`Cafe ${index + 1}`} className="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2"
                            onClick={() => removeImage(index)}
                          >
                            <X className="size-4" />
                          </Button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            Photo {index + 1}
                          </div>
                        </div>
                      ))}
                      {formData.galleryImages.length < 10 && (
                        <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                          <Upload className="size-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Upload Image</span>
                          <span className="text-xs text-gray-500 mt-1">Click to browse</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => handleImageUpload(e, 'gallery')}
                          />
                        </label>
                      )}
                    </div>
                    <div className={`text-sm font-medium ${formData.galleryImages.length >= 4 ? 'text-green-600' : 'text-orange-600'}`}>
                      {formData.galleryImages.length >= 4 ? '✓' : '⚠'} {formData.galleryImages.length} / 4 minimum images uploaded
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Partnership Terms</h3>
                    <p className="text-sm text-green-800">
                      Review and accept our partnership terms to get started
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <h4 className="font-medium text-lg">Commission Structure & Terms</h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-orange-100 text-orange-600 rounded-full p-2">
                            <span className="font-bold">6%</span>
                          </div>
                          <div>
                            <h5 className="font-semibold">Platform Commission</h5>
                            <p className="text-sm text-gray-600">6% commission on every completed order</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={formData.acceptedTerms}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, acceptedTerms: checked as boolean })
                        }
                      />
                      <label htmlFor="terms" className="text-sm cursor-pointer flex-1">
                        I accept the 6% commission per order and agree to all partnership terms and conditions.
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-6 border-t">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    <ChevronLeft className="mr-2 size-4" />
                    Previous
                  </Button>
                )}
                {step < 4 ? (
                  <Button
                    type="button"
                    className="ml-auto bg-orange-500 hover:bg-orange-600"
                    onClick={handleNext}
                  >
                    Next Step
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="ml-auto bg-green-500 hover:bg-green-600"
                    onClick={handleSubmit}
                    disabled={loading || !formData.acceptedTerms}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Setting up your cafe...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ChevronRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}