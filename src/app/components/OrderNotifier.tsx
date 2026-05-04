import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Bell, BellRing, Volume2, VolumeX } from 'lucide-react';

// Generate notification sound using Web Audio API (no mp3 file needed)
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a pleasant two-tone chime
    const playTone = (freq: number, startTime: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);
      
      oscillator.start(audioCtx.currentTime + startTime);
      oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    // Three ascending tones — pleasant "ding-ding-ding" 🔔
    playTone(523.25, 0, 0.2);      // C5
    playTone(659.25, 0.15, 0.2);   // E5
    playTone(783.99, 0.30, 0.4);   // G5

    // Close audio context after sound finishes
    setTimeout(() => audioCtx.close(), 1500);
  } catch (err) {
    console.warn('Could not play notification sound:', err);
  }
}

// Show browser notification
function showBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '☕',
        badge: '☕',
        tag: 'caffelino-order', // Prevents duplicate notifications
        requireInteraction: false
      });
    } catch (err) {
      console.warn('Browser notification failed:', err);
    }
  }
}

export default function OrderNotifier() {
  const { isAuthenticated } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const initialLoadDone = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Enable notifications (requires user click to unlock audio)
  const handleEnable = useCallback(() => {
    // Play a test tone to unlock audio context (browser restriction)
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      setTimeout(() => ctx.close(), 200);
    } catch (e) {
      // Ignore
    }

    requestPermission();
    setEnabled(true);
    toast.success('🔔 Order notifications enabled!', {
      description: 'You will hear a sound when new orders arrive.'
    });
  }, [requestPermission]);

  // Disable notifications
  const handleDisable = useCallback(() => {
    setEnabled(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    toast.info('🔕 Order notifications disabled');
  }, []);

  // Polling logic
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const checkForNewOrders = async () => {
      try {
        const res = await api.get('/api/orders/latest');
        const order = res?.order;

        if (!order) return;

        const orderId = String(order.id);

        // First load — just store the ID, don't notify
        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
          setLastOrderId(orderId);
          return;
        }

        // New order detected!
        if (orderId !== lastOrderId) {
          setLastOrderId(orderId);
          setNewOrderCount(prev => prev + 1);

          // 🔊 Play sound
          playNotificationSound();

          // 🔔 Browser notification
          const itemText = order.itemCount > 1
            ? `${order.firstItem} + ${order.itemCount - 1} more`
            : order.firstItem;
          
          showBrowserNotification(
            '🍕 New Order!',
            `${order.userName || 'Customer'} ordered ${itemText} — ₹${order.totalAmount?.toFixed(2) || '0.00'}`
          );

          // 🍞 Toast notification
          toast.success('🍕 New Order Received!', {
            description: `${order.userName || 'Customer'} — ${itemText} — ₹${order.totalAmount?.toFixed(2) || '0.00'}`,
            duration: 8000
          });
        }
      } catch (err) {
        // Silent fail — don't spam console during normal polling
      }
    };

    // Initial check
    checkForNewOrders();

    // Poll every 5 seconds
    pollIntervalRef.current = setInterval(checkForNewOrders, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [enabled, isAuthenticated, lastOrderId]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setEnabled(false);
      setLastOrderId(null);
      setNewOrderCount(0);
      initialLoadDone.current = false;
    }
  }, [isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  return (
    <button
      onClick={enabled ? handleDisable : handleEnable}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 w-full justify-start
        ${enabled
          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
          : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
        }
      `}
      title={enabled ? 'Click to disable notifications' : 'Click to enable order notifications'}
    >
      {enabled ? (
        <>
          <BellRing className="size-4 animate-pulse" />
          <span>Notifications On</span>
          {newOrderCount > 0 && (
            <span className="ml-auto bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {newOrderCount}
            </span>
          )}
        </>
      ) : (
        <>
          <Bell className="size-4" />
          <span>Enable Notifications</span>
        </>
      )}
    </button>
  );
}
