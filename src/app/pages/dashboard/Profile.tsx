import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Pencil, Save, X, MapPin, Clock, Phone, User, Mail } from 'lucide-react';

export default function Profile() {
  const { cafe, updateCafe } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: cafe?.name || '',
    address: cafe?.address || '',
    openingTime: cafe?.openingTime || '',
    closingTime: cafe?.closingTime || '',
    managerName: cafe?.managerName || '',
    managerPhone: cafe?.managerPhone || '',
    costPerPerson: cafe?.costPerPerson || ''
  });

  const handleSave = () => {
    if (formData.managerPhone && formData.managerPhone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    updateCafe(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: cafe?.name || '',
      address: cafe?.address || '',
      openingTime: cafe?.openingTime || '',
      closingTime: cafe?.closingTime || '',
      managerName: cafe?.managerName || '',
      managerPhone: cafe?.managerPhone || '',
      costPerPerson: cafe?.costPerPerson || ''
    });
    setIsEditing(false);
  };

  if (!cafe) return null;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cafe Profile</h1>
          <p className="text-sm md:text-base text-gray-600">View and manage your cafe information</p>
        </div>
        {!isEditing ? (
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2 size-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 size-4" />
              Cancel
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSave}>
              <Save className="mr-2 size-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cafe Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cafe Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{cafe.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                ) : (
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-gray-500 mt-1" />
                    <p>{cafe.address}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={formData.openingTime}
                      onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-500" />
                      <p>{cafe.openingTime}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={formData.closingTime}
                      onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-500" />
                      <p>{cafe.closingTime}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <p className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg inline-block">
                  {cafe.category}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Approx. Cost per Person</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.costPerPerson}
                    onChange={e => setFormData({ ...formData, costPerPerson: e.target.value })}
                  />
                ) : (
                  <p className="font-medium text-lg text-orange-600">₹{cafe.costPerPerson || 'N/A'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manager Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Manager Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.managerName}
                    onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-gray-500" />
                    <p>{cafe.managerName}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Manager Phone</Label>
                {isEditing ? (
                  <>
                    <Input
                      value={formData.managerPhone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, managerPhone: val });
                      }}
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="9876543210"
                    />
                    <p className="text-xs text-gray-500">{formData.managerPhone.length}/10 digits</p>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-gray-500" />
                    <p>{cafe.managerPhone}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Google Account Email</Label>
                {isEditing ? (
                  <Input
                    value={cafe.email || ''}
                    disabled
                    className="bg-gray-100"
                    title="Account email cannot be changed"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-gray-500" />
                    <p>{cafe.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                cafe.status === 'approved' ? 'bg-green-100 text-green-800' :
                cafe.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {cafe.status === 'approved' ? '✓ Verified' :
                 cafe.status === 'pending_verification' ? 'Pending' :
                 'Rejected'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}