import { RouterProvider } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

const GOOGLE_CLIENT_ID = '544452206953-hf3mo2cn3gbkadb8g5ejkm6skigio6er.apps.googleusercontent.com';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <OrderProvider>
          <RouterProvider router={router} />
          <Toaster />
        </OrderProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
