import { useRouteError, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { AlertCircle, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function EventErrorBoundary() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
      <div className="bg-[#F5E6D3] p-6 rounded-full mb-8">
        <AlertCircle className="size-16 text-[#8B5E3C]" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#3E2723] mb-4">Event Not Found</h1>
      <p className="text-lg text-[#8B5E3C] mb-8 max-w-md">
        {error?.status === 404 
          ? "We couldn't find the page or event you were looking for. It may have been deleted or moved."
          : "An unexpected error occurred while loading this page. Please try again."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate('/events/dashboard')}
          className="bg-gradient-to-r from-[#8B5E3C] to-[#5C3A21] text-white hover:shadow-lg border-none h-12 px-6"
        >
          <LayoutDashboard className="mr-2 size-5" />
          Return to Dashboard
        </Button>
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
          className="text-[#8B5E3C] border-[#E8DCC4] hover:bg-[#F5E6D3]/50 h-12 px-6"
        >
          <ArrowLeft className="mr-2 size-5" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
