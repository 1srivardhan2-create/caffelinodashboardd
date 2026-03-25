import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../../../services/api';
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, ArrowLeft, MapPin, Phone, Coffee, Clock, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface Cafe {
  _id: string;
  Name: string;
  Cafe_Address: string;
  cafe_location: string;
  Cafe_type: string[];
  Average_Cost: string;
  Cafe_photos: string[];
  AboutCafe: string;
  Phonenumber: string;
  opening_hours: any;
}

interface MenuItem {
  _id: string;
  item_name: string;
  Category: string;
  food_type: string;
  price: number;
  description_food: string;
  image_url: string;
  available: boolean;
}

export default function CafeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const [cart, setCart] = useState<{ id: string; quantity: number; price: number; name: string }[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchCafeDetails = async () => {
      try {
        const data = await api.get(`/api/cafe/user/${id}`);
        setCafe(data.cafe);
        setMenu(data.menu);
      } catch (error) {
        console.error('Failed to fetch cafe details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCafeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cafe not found</h2>
        <button onClick={() => navigate('/app')} className="text-orange-500 hover:underline">
          Go back to Explore
        </button>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(menu.map((m) => m.Category)))];

  const filteredMenu =
    activeCategory === 'All' ? menu : menu.filter((m) => m.Category === activeCategory);

  const getQuantity = (id: string) => cart.find(c => c.id === id)?.quantity || 0;

  const updateCart = (item: MenuItem, increment: boolean) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item._id);
      if (existing) {
        if (!increment && existing.quantity === 1) {
          return prev.filter(c => c.id !== item._id);
        }
        return prev.map(c => c.id === item._id ? { ...c, quantity: c.quantity + (increment ? 1 : -1) } : c);
      }
      if (increment) {
        return [...prev, { id: item._id, quantity: 1, price: item.price, name: item.item_name }];
      }
      return prev;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cgst = cartTotal * 0.025;
  const sgst = cartTotal * 0.025;
  const finalTotal = cartTotal + cgst + sgst;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await api.post(`/api/cafe/user/${id}/order`, { 
        items: cart, 
        subtotal: cartTotal,
        cgst: cgst,
        sgst: sgst,
        totalAmount: finalTotal 
      });
      toast.success(res.message || 'Order placed successfully!');
      setCart([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Image */}
      <div className="w-full h-64 md:h-80 lg:h-96 relative bg-gray-900">
        {cafe.Cafe_photos?.[0] ? (
          <ImageWithFallback
            src={optimizeCloudinaryUrl(cafe.Cafe_photos[0], 1200, 'auto', 'webp')}
            alt={cafe.Name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Coffee className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate('/app')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16 relative z-10">
        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{cafe.Name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {cafe.Cafe_type.map((type, i) => (
                  <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700">
                    {type}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span>{cafe.Cafe_Address}</span>
                    {cafe.cafe_location && cafe.cafe_location !== '0,0' && (
                      <a 
                        href={`https://www.google.com/maps?q=${cafe.cafe_location}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline text-sm mt-1 inline-flex items-center gap-1"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 shrink-0" />
                  <span>{cafe.Phonenumber}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {/* Basic opening hours display block */}
                    Mon: {cafe.opening_hours?.monday?.open} - {cafe.opening_hours?.monday?.close}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6 md:w-64 text-center shrink-0">
              <div className="text-sm font-medium text-orange-600 mb-1">Cost for two</div>
              <div className="text-3xl font-bold text-gray-900">₹{(parseInt(cafe.Average_Cost) * 2).toString()}</div>
              <div className="text-xs text-gray-500 mt-2">Approximate</div>
            </div>
          </div>
          
          {cafe.AboutCafe && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{cafe.AboutCafe}</p>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>
          
          <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredMenu.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500">
              <Coffee className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No menu items available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <Card key={item._id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-32">
                    <div className="w-32 shrink-0 bg-gray-100">
                      {item.image_url ? (
                        <ImageWithFallback
                          src={optimizeCloudinaryUrl(item.image_url, 400, 'auto', 'webp')}
                          alt={item.item_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Coffee className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">{item.item_name}</h4>
                          <div className={`w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center ${item.food_type === 'Veg' ? 'border-green-600' : 'border-red-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.food_type === 'Veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          </div>
                        </div>
                        {item.description_food && (
                          <p className="text-xs text-gray-500 line-clamp-2">{item.description_food}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-bold text-gray-900">₹{item.price}</div>
                        {item.available ? (
                          <div className="flex items-center bg-orange-50 rounded-lg overflow-hidden border border-orange-200">
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateCart(item, false); }}
                              className="p-1 px-2 text-orange-600 hover:bg-orange-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-orange-700">
                              {getQuantity(item._id)}
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateCart(item, true); }}
                              className="p-1 px-2 text-orange-600 hover:bg-orange-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-red-50 text-red-600 border-none shrink-0">Sold Out</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Sticky Cart Bottom Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom border-t border-gray-200" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-600">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items | Taxes 5%
              </span>
              <span className="text-xl font-bold text-gray-900">₹{finalTotal.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
