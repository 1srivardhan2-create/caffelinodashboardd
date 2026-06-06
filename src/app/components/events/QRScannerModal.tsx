import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, Camera, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (ticketData: any) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = 'qr-reader';

  const startScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setHasCameraPermission(true);
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(scannerRegionId);
        }

        await scannerRef.current.start(
          { facingMode: 'environment' }, // Prefer back camera on mobile
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            if (isScanning) return; // Prevent multiple scans at once
            setIsScanning(true);
            
            try {
              // Try to parse as JSON first (our format)
              const data = JSON.parse(decodedText);
              stopScanner();
              onScanSuccess(data);
            } catch (e) {
              // If not JSON, assume it's just the ticket number string
              stopScanner();
              onScanSuccess({ ticketNumber: decodedText });
            }
          },
          (errorMessage) => {
            // Ignore ongoing scan errors (like not finding a QR code in the frame)
          }
        );
      } else {
        setHasCameraPermission(false);
        toast.error('No cameras found on this device.');
      }
    } catch (err) {
      console.error(err);
      setHasCameraPermission(false);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white border-[#E8DCC4] p-0 overflow-hidden rounded-2xl">
        <div className="flex justify-between items-center p-4 border-b border-[#E8DCC4] bg-[#FDFBF7]">
          <DialogTitle className="text-lg font-bold text-[#3E2723] flex items-center gap-2">
            <Camera className="size-5 text-[#8B5E3C]" /> Live Scanner
          </DialogTitle>
          <button onClick={handleClose} className="p-1 hover:bg-[#F5E6D3] rounded-full text-[#8B5E3C]">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px] bg-black">
          {hasCameraPermission === false ? (
            <div className="text-center text-white p-4">
              <p className="mb-4">Camera access is required to scan tickets.</p>
              <Button onClick={startScanner} className="bg-[#8B5E3C] hover:bg-[#5C3A21]">
                <RefreshCcw className="mr-2 size-4" /> Try Again
              </Button>
            </div>
          ) : (
            <div className="w-full relative">
              <div id={scannerRegionId} className="w-full overflow-hidden rounded-lg"></div>
              {isScanning && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-[#FDFBF7] border-t border-[#E8DCC4] text-center">
          <p className="text-sm text-[#8B5E3C]">Align the QR code within the frame to scan.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
