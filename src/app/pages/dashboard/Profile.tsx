import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Pencil, Save, X, MapPin, Clock, Phone, User, Mail, QrCode, Search, ExternalLink, CheckCircle, CreditCard } from 'lucide-react';

export default function Profile() {
  const { cafe, updateCafe } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    openingTime: '',
    closingTime: '',
    managerName: '',
    managerPhone: '',
    costPerPerson: '',
    upiId: ''
  });

  useEffect(() => {
    if (cafe) {
      setFormData({
        name: cafe.name || '',
        address: cafe.address || '',
        openingTime: cafe.openingTime || '',
        closingTime: cafe.closingTime || '',
        managerName: cafe.managerName || '',
        managerPhone: cafe.managerPhone || '',
        costPerPerson: cafe.costPerPerson || '',
        upiId: cafe.upiId || ''
      });
    }
  }, [cafe]);

  const handleSave = async () => {
    if (formData.managerPhone && formData.managerPhone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    try {
      await api.put('/api/cafe/editprofile', {
        name: formData.name,
        address: formData.address,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        managerName: formData.managerName,
        managerPhone: formData.managerPhone,
        averageCostPerPerson: Number(formData.costPerPerson) || formData.costPerPerson,
        upiId: formData.upiId
      });

      updateCafe(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: cafe?.name || '',
      address: cafe?.address || '',
      openingTime: cafe?.openingTime || '',
      closingTime: cafe?.closingTime || '',
      managerName: cafe?.managerName || '',
      managerPhone: cafe?.managerPhone || '',
      costPerPerson: cafe?.costPerPerson || '',
      upiId: cafe?.upiId || ''
    });
    setIsEditing(false);
  };

  const handleQrLookup = async () => {
    if (!qrInput.trim()) {
      toast.error('Enter an Order ID or URL');
      return;
    }

    setQrLoading(true);
    setQrResult(null);

    try {
      // Extract order ID from URL or use raw input
      let orderId = qrInput.trim();
      // Handle full URLs like https://caffelino.in/order/423700
      const urlMatch = orderId.match(/\/order\/([a-zA-Z0-9]+)/);
      if (urlMatch) {
        orderId = urlMatch[1];
      }

      const data = await api.get(`/api/orders/${orderId}`);
      if (data.success && data.order) {
        setQrResult(data.order);
        toast.success('Order found!');
      } else {
        toast.error(data.message || 'Order not found');
      }
    } catch (err) {
      toast.error('Failed to look up order');
    } finally {
      setQrLoading(false);
    }
  };

  const handleOpenOrderPage = (orderId: string) => {
    window.open(`/order/${orderId}`, '_blank');
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

              {/* UPI ID */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="size-4 text-purple-500" />
                  UPI ID (for Payment QR)
                </Label>
                {isEditing ? (
                  <>
                    <Input
                      value={formData.upiId}
                      onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="e.g. caffelino@okaxis"
                    />
                    <p className="text-xs text-gray-500">
                      This UPI ID will appear on every printed bill for instant payment
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {cafe.upiId ? (
                      <p className="font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                        {cafe.upiId}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">Not set — Edit profile to add UPI ID</p>
                    )}
                  </div>
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

          {/* QR Scanner / Order Lookup */}
          <Card className="border-orange-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <QrCode className="size-5" />
                QR Order Lookup
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Scan or paste QR code / Order ID to verify orders
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Order ID or QR URL"
                  value={qrInput}
                  onChange={e => setQrInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleQrLookup()}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 px-3 shrink-0"
                  onClick={handleQrLookup}
                  disabled={qrLoading}
                >
                  {qrLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="size-4" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Paste URL like: caffelino.in/order/abc123
              </p>

              {/* QR Result */}
              {qrResult && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                    <CheckCircle className="size-4" />
                    Order Found
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-gray-800">
                      Order #{qrResult.orderId || qrResult._id?.slice(-6)}
                    </p>
                    {qrResult.cafeName && (
                      <p className="text-gray-600 text-xs">Cafe: {qrResult.cafeName}</p>
                    )}
                    <div className="flex justify-between text-gray-700">
                      <span>Items:</span>
                      <span>{qrResult.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 font-bold">
                      <span>Total:</span>
                      <span>₹{qrResult.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-xs">
                      <span>Status:</span>
                      <span className="uppercase font-medium">{qrResult.orderStatus || qrResult.status}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(qrResult.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                    onClick={() => handleOpenOrderPage(qrResult._id)}
                  >
                    <ExternalLink className="mr-2 size-3" />
                    View Full Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}