import { useState, useEffect, useRef } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Pencil, Save, X, MapPin, Clock, Phone, User, Mail, QrCode, Upload, Trash2, RefreshCw } from 'lucide-react';

export default function Profile() {
  const { cafe, updateCafe } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    openingTime: '',
    closingTime: '',
    managerName: '',
    managerPhone: '',
    costPerPerson: ''
  });

  // QR State
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrDeleting, setQrDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cafe) {
      setFormData({
        name: cafe.name || '',
        address: cafe.address || '',
        openingTime: cafe.openingTime || '',
        closingTime: cafe.closingTime || '',
        managerName: cafe.managerName || '',
        managerPhone: cafe.managerPhone || '',
        costPerPerson: cafe.costPerPerson || ''
      });
      if (cafe.upiPhoto) {
        setQrUrl(cafe.upiPhoto);
      }
    }
  }, [cafe]);

  // Fetch QR on mount (in case auth context didn't have it yet)
  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await api.get('/api/cafe/qr');
        if (res.upiPhoto) {
          setQrUrl(res.upiPhoto);
          updateCafe({ upiPhoto: res.upiPhoto });
        }
      } catch (err) {
        // Silently fail — QR may not exist yet
      }
    };
    fetchQR();
  }, []);

  const handleQRUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB allowed.');
      return;
    }

    setQrUploading(true);
    try {
      const formData = new FormData();
      formData.append('qr', file);

      const res = await api.postForm('/api/cafe/qr/upload', formData);

      if (res.upiPhoto) {
        setQrUrl(res.upiPhoto);
        updateCafe({ upiPhoto: res.upiPhoto });
        toast.success('QR code uploaded successfully!');
      } else {
        toast.error(res.message || 'Failed to upload QR');
      }
    } catch (err) {
      toast.error('Failed to upload QR code');
    } finally {
      setQrUploading(false);
    }
  };

  const handleQRDelete = async () => {
    setQrDeleting(true);
    try {
      await api.delete('/api/cafe/qr');
      setQrUrl(null);
      updateCafe({ upiPhoto: '' });
      toast.success('QR code removed');
    } catch (err) {
      toast.error('Failed to remove QR code');
    } finally {
      setQrDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleQRUpload(file);
  };

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
        averageCostPerPerson: Number(formData.costPerPerson) || formData.costPerPerson
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

          {/* QR Code Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <QrCode className="size-5 text-orange-500" />
                <CardTitle>Payment QR Code</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrUrl ? (
                <>
                  {/* QR Preview */}
                  <div className="relative group">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-white flex flex-col items-center">
                      <img
                        src={qrUrl}
                        alt="Payment QR Code"
                        className="w-full max-w-[200px] h-auto rounded-lg shadow-sm"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        This QR appears on printed bills
                      </p>
                    </div>
                  </div>

                  {/* QR Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={() => qrInputRef.current?.click()}
                      disabled={qrUploading}
                    >
                      {qrUploading ? (
                        <RefreshCw className="mr-1 size-3 animate-spin" />
                      ) : (
                        <Upload className="mr-1 size-3" />
                      )}
                      Replace
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={handleQRDelete}
                      disabled={qrDeleting}
                    >
                      {qrDeleting ? (
                        <RefreshCw className="mr-1 size-3 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 size-3" />
                      )}
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                /* Upload Zone */
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
                    ${isDragging
                      ? 'border-orange-400 bg-orange-50 scale-[1.02]'
                      : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/50'
                    }
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => qrInputRef.current?.click()}
                >
                  {qrUploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <RefreshCw className="size-8 text-orange-500 animate-spin" />
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="bg-orange-100 p-3 rounded-full">
                        <QrCode className="size-8 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Upload UPI QR Code
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleQRUpload(file);
                  e.target.value = '';
                }}
              />

              <p className="text-xs text-gray-400 text-center">
                This QR will be shown on receipts for "Scan & Pay"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}