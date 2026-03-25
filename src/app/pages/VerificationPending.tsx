import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Coffee } from 'lucide-react';

import { useEffect } from 'react';

export default function VerificationPending() {
  const navigate = useNavigate();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Poll the backend every 5 seconds to check if admin/owner approved the cafe in MongoDB
    const checkApprovalStatus = async () => {
      try {
        const { api } = await import('../../services/api');
        const res = await api.get('/api/cafe/status');
        if (res && res.hasCafe && (res.status === true || res.status === 'true' || res.status === 'approved')) {
          clearInterval(interval);
          window.location.href = '/dashboard';
        }
      } catch (err) {
        // Silently fail and keep polling
      }
    };

    interval = setInterval(checkApprovalStatus, 5000);
    checkApprovalStatus(); // initial check

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-12 text-center">
          {/* Coffee Beans Loading Animation */}
          <div className="mb-8 relative h-32 flex items-center justify-center">
            {/* Center Coffee Cup */}
            <motion.div
              className="absolute"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Coffee className="size-16 text-orange-500" />
            </motion.div>

            {/* Rotating Coffee Beans */}
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const angle = (index * 360) / 6;
              return (
                <motion.div
                  key={index}
                  className="absolute"
                  style={{
                    width: '24px',
                    height: '24px',
                  }}
                  initial={{ rotate: 0 }}
                  animate={{
                    rotate: 360,
                    x: [
                      Math.cos((angle * Math.PI) / 180) * 60,
                      Math.cos(((angle + 360) * Math.PI) / 180) * 60,
                    ],
                    y: [
                      Math.sin((angle * Math.PI) / 180) * 60,
                      Math.sin(((angle + 360) * Math.PI) / 180) * 60,
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <motion.div
                    className="bg-orange-600 rounded-full"
                    style={{ width: '12px', height: '16px', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: index * 0.1,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="size-16 text-green-600" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Application Submitted Successfully!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-600 mb-2"
          >
            Your cafe partnership application is under verification
          </motion.p>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-8"
          >
            <p className="text-orange-900 font-medium mb-2">
              ☕ We're brewing your partnership!
            </p>
            <p className="text-orange-800">
              Our team will review your application and contact you within <strong>24 hours</strong>.
            </p>
            <p className="text-orange-700 text-sm mt-2">
              You'll receive a confirmation email at your registered email address.
            </p>
          </motion.div>

          {/* Demo Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={async () => {
                try {
                  const { api } = await import('../../services/api');
                  const res = await api.get('/api/cafe/status');
                  if (res && res.hasCafe && (res.status === true || res.status === 'true' || res.status === 'approved')) {
                    // Update auth context by reloading or manual state sync (here we just reload)
                    window.location.href = '/dashboard';
                  } else {
                    import('sonner').then(({ toast }) => toast.info('Your cafe is still under review.'));
                  }
                } catch (e) {
                  import('sonner').then(({ toast }) => toast.error('Failed to check status.'));
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg"
              size="lg"
            >
              Check Application Status
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              You can explore the dashboard once your application is approved
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">24hrs</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-gray-600">Secure Process</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
