import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Image as ImageIcon, Pencil, Save, X, Upload, Trash2, Plus, Loader2 } from 'lucide-react';

export default function Albums() {
  const { cafe, updateCafe } = useAuth();
  
  // UI State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);

  // Preview URLs
  const [tempProfilePicture, setTempProfilePicture] = useState('');
  const [tempGalleryImages, setTempGalleryImages] = useState<string[]>([]);
  
  // Actual File objects for upload
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!cafe) return null;

  const handleProfileEdit = () => {
    setTempProfilePicture(cafe.profilePicture || '');
    setProfileFile(null);
    setIsEditingProfile(true);
  };

  const handleGalleryEdit = () => {
    setTempGalleryImages([...(cafe.galleryImages || [])]);
    setGalleryFiles([]);
    setIsEditingGallery(true);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfileFile(file);
    const url = URL.createObjectURL(file);
    setTempProfilePicture(url);
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviewUrls: string[] = [];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }

      newFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    setGalleryFiles([...galleryFiles, ...newFiles]);
    setTempGalleryImages([...tempGalleryImages, ...newPreviewUrls]);
    toast.success(`${newFiles.length} image(s) attached`);
  };

  const handleDeleteGalleryImage = async (index: number) => {
    // If it's a new unsaved file
    const existingImagesCount = cafe.galleryImages?.length || 0;
    
    if (index >= existingImagesCount) {
      // Remove from pending files
      const localIndex = index - existingImagesCount;
      setGalleryFiles(files => files.filter((_, i) => i !== localIndex));
      setTempGalleryImages(urls => urls.filter((_, i) => i !== index));
      toast.success('Pending image removed');
      return;
    }

    // Attempt to delete an existing backend image
    try {
      const res = await api.delete(`/api/cafe/albums/gallery/${index}`);
      updateCafe({ galleryImages: res.galleryImages, profilePicture: res.profilePicture });
      setTempGalleryImages(res.galleryImages);
      toast.success(res.message || 'Image deleted successfully');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleSaveProfile = async () => {
    if (!profileFile) {
      setIsEditingProfile(false);
      return;
    }

    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', profileFile);
      
      const res = await api.postForm('/api/cafe/albums/profile', formData);
      updateCafe({ profilePicture: res.profilePicture, galleryImages: res.galleryImages });
      
      setIsEditingProfile(false);
      setProfileFile(null);
      toast.success(res.message || 'Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload profile photo');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveGallery = async () => {
    if (galleryFiles.length === 0) {
      setIsEditingGallery(false);
      return;
    }

    setIsSavingGallery(true);
    try {
      const formData = new FormData();
      galleryFiles.forEach(file => {
        formData.append('gallery_images', file);
      });
      
      const res = await api.postForm('/api/cafe/albums/gallery', formData);
      updateCafe({ galleryImages: res.galleryImages, profilePicture: res.profilePicture });
      
      setTempGalleryImages(res.galleryImages);
      setGalleryFiles([]);
      setIsEditingGallery(false);
      toast.success(res.message || 'Gallery updated successfully!');
    } catch (err) {
      toast.error('Failed to upload gallery photos');
    } finally {
      setIsSavingGallery(false);
    }
  };

  const handleCancelProfile = () => {
    setTempProfilePicture('');
    setProfileFile(null);
    setIsEditingProfile(false);
  };

  const handleCancelGallery = () => {
    setTempGalleryImages([]);
    setGalleryFiles([]);
    setIsEditingGallery(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Cafe Albums</h1>
        <p className="text-sm md:text-base text-gray-600">Manage your cafe photos and gallery</p>
      </div>

      <div className="space-y-6">
        {/* Cafe Profile Picture */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cafe Profile Photo</CardTitle>
            {!isEditingProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleProfileEdit}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelProfile}>
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600" 
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  {isSavingProfile ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <div className="space-y-4">
                {tempProfilePicture ? (
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 max-w-2xl">
                    <img
                      src={tempProfilePicture}
                      alt="Cafe Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 max-w-2xl">
                    <ImageIcon className="size-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No cafe photo uploaded</p>
                  </div>
                )}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  Upload New Photo
                </Button>
              </div>
            ) : (
              <>
                {cafe.profilePicture ? (
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 max-w-2xl">
                    <img
                      src={cafe.profilePicture}
                      alt="Cafe Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 max-w-2xl">
                    <ImageIcon className="size-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No cafe photo uploaded</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Cafe Gallery */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Cafe Gallery ({isEditingGallery ? tempGalleryImages.length : (cafe.galleryImages?.length || 0)} photos)
            </CardTitle>
            {!isEditingGallery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGalleryEdit}
              >
                <Pencil className="mr-2 size-4" />
                Edit Gallery
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelGallery}>
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600" 
                  size="sm"
                  onClick={handleSaveGallery}
                  disabled={isSavingGallery}
                >
                  {isSavingGallery ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  {isSavingGallery ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditingGallery ? (
              <div className="space-y-4">
                {tempGalleryImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tempGalleryImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={img}
                            alt={`Cafe ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Photo {index + 1}
                        </div>
                        <button
                          onClick={() => handleDeleteGalleryImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    {/* Add More Button */}
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="size-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Add More</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => galleryInputRef.current?.click()}
                    className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <ImageIcon className="size-12 text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-gray-500 mb-2">No gallery photos uploaded</p>
                    <p className="text-xs text-gray-400">Click to upload photos</p>
                  </div>
                )}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryImageUpload}
                />
              </div>
            ) : (
              <>
                {(cafe.galleryImages?.length || 0) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(cafe.galleryImages || []).map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={img}
                            alt={`Cafe ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Photo {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <ImageIcon className="size-12 text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-gray-500">No gallery photos uploaded</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}