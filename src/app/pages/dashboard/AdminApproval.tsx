import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../services/api';
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface CafeData {
  _id: string;
  Name: string;
  Cafe_Address: string;
  Cafe_type: string[];
  Average_Cost: string;
  status: string;
  Cafe_photos: string[];
}

export default function AdminApproval() {
  const [cafes, setCafes] = useState<CafeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCafes = async () => {
    try {
      const res = await api.get('/api/cafe/admin/all');
      setCafes(res);
    } catch (error) {
      toast.error('Failed to fetch cafes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/cafe/approve/${id}`, {});
      toast.success('Cafe approved successfully!');
      fetchCafes();
    } catch (error) {
      toast.error('Failed to approve cafe');
    }
  };

  if (loading) {
    return <div className="p-8">Loading cafes...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Approval</h1>
        <p className="text-sm md:text-base text-gray-600">Review and approve new registered cafes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cafes.map((cafe) => (
          <Card key={cafe._id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 bg-gray-100">
              {cafe.Cafe_photos && cafe.Cafe_photos.length > 0 ? (
                <ImageWithFallback
                  src={optimizeCloudinaryUrl(cafe.Cafe_photos[0], 500, 'auto', 'webp')}
                  alt={cafe.Name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge
                  className={cafe.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}
                >
                  {cafe.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="flex-none pb-2">
              <CardTitle className="text-xl">{cafe.Name}</CardTitle>
              <p className="text-sm text-gray-500 line-clamp-1">{cafe.Cafe_Address}</p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Category:</span> {cafe.Cafe_type?.[0] || 'N/A'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Avg Cost:</span> ₹{cafe.Average_Cost}
                </div>
              </div>

              {cafe.status === 'pending' ? (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleApprove(cafe._id)}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Approve Cafe
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  <ShieldAlert className="mr-2 size-4 text-green-500" />
                  Already Approved
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {cafes.length === 0 && (
          <p className="text-gray-500 col-span-full">No cafes found.</p>
        )}
      </div>
    </div>
  );
}
