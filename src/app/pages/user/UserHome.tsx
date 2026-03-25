import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { api } from '../../../services/api';
import { Coffee, MapPin, Loader2 } from 'lucide-react';

interface Cafe {
  _id: string;
  Name: string;
  Cafe_Address: string;
  cafe_location: string;
  Cafe_type: string[];
  Average_Cost: string;
  Cafe_photos: string[];
}

export default function UserHome() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const data = await api.get('/api/cafe/user/approved');
        setCafes(data);
      } catch (error) {
        console.error('Failed to fetch cafes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCafes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Cafes</h1>
        </div>

        {cafes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-medium text-gray-700">No cafes found nearby</h3>
            <p className="text-gray-500 mt-2">Check back later for new cafes in your area.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cafes.map((cafe) => (
              <Card 
                key={cafe._id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-none shadow-sm"
                onClick={() => navigate(`/app/cafe/${cafe._id}`)}
              >
                <div className="relative h-48 bg-gray-100">
                  {cafe.Cafe_photos && cafe.Cafe_photos.length > 0 ? (
                    <ImageWithFallback
                      src={optimizeCloudinaryUrl(cafe.Cafe_photos[0], 500, 'auto', 'webp')}
                      alt={cafe.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Coffee className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {cafe.Cafe_type?.[0] && (
                      <Badge className="bg-white/90 text-gray-800 hover:bg-white border-none shadow-sm backdrop-blur-sm">
                        {cafe.Cafe_type[0]}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg line-clamp-1">{cafe.Name}</CardTitle>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="flex items-start gap-1.5 text-sm mb-3">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    <div className="flex flex-col min-w-0">
                      <span className="line-clamp-2 text-gray-500">{cafe.Cafe_Address}</span>
                      {cafe.cafe_location && cafe.cafe_location !== '0,0' && (
                        <a 
                          href={`https://www.google.com/maps?q=${cafe.cafe_location}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:underline text-xs mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Map
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-gray-500">Average Cost</span>
                    <span className="text-orange-600">₹{cafe.Average_Cost} / person</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
