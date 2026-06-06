import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { ScanLine, Search, Download, CheckCircle, Clock, Users, XCircle, AlertCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import QRScannerModal from '../../components/events/QRScannerModal';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '../../components/ui/dialog';

export default function Attendance() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalCheckedIn: 0,
    todaysCheckIns: 0,
    attendancePercentage: 0
  });
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, checked-in, pending (simulated if we had full list)

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/api/attendance/stats');
      if (statsRes.success) setStats(statsRes.stats);

      const listRes = await api.get('/api/attendance/list');
      if (listRes.success) setAttendanceList(listRes.attendance);
    } catch (err) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Polling every 5 seconds for live updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    if (attendanceList.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = ['Ticket Number', 'Attendee Name', 'Email', 'Phone', 'Event Name', 'Check-In Time', 'Status'];
    const csvContent = [
      headers.join(','),
      ...attendanceList.map(a => [
        a.ticketNumber,
        `"${a.attendeeName}"`,
        a.email,
        a.phone,
        `"${a.eventName}"`,
        `"${new Date(a.checkedInAt).toLocaleString()}"`,
        a.checkedIn ? 'Checked-In' : 'Pending'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScanSuccess = async (qrData: any) => {
    // Determine the ticket number from either a JSON object or a raw string
    const ticketNumber = qrData.ticketNumber || qrData;
    if (!ticketNumber) {
      toast.error('Invalid QR Code format.');
      setIsScannerOpen(false);
      return;
    }

    try {
      const res = await api.get(`/api/attendance/verify?ticketNumber=${encodeURIComponent(ticketNumber)}`);
      
      setIsScannerOpen(false); // Close camera modal first

      if (res.success) {
        setVerificationData(res.data);
        setIsVerifyModalOpen(true);
      } else {
        // If the ticket was already checked in, show error with timestamp
        if (res.message === '❌ Already Checked In' && res.data) {
          toast.error(`❌ Already Checked In: ${res.data.attendeeName} at ${new Date(res.data.checkedInAt).toLocaleString()}`);
        } else {
          toast.error(res.message || 'Invalid Ticket');
        }
      }
    } catch (err: any) {
      setIsScannerOpen(false);
      toast.error(err?.response?.data?.message || 'Error verifying ticket.');
    }
  };

  const confirmCheckIn = async () => {
    if (!verificationData) return;
    setIsCheckingIn(true);
    try {
      const res = await api.post('/api/attendance/scan', {
        ticketNumber: verificationData.ticketNumber
      });

      if (res.success) {
        toast.success(`${verificationData.attendeeName} Checked In Successfully!`);
        setIsVerifyModalOpen(false);
        setVerificationData(null);
        fetchData(); // Instantly update dashboard
      } else {
        toast.error(res.message || 'Failed to check in.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Check-in failed.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const filteredList = attendanceList.filter(a => {
    const matchesSearch = 
      a.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm);
    
    if (filterStatus === 'checked-in') return matchesSearch && a.checkedIn;
    // For pending, we'd need the full registration list. For now, our DB only stores checked-in records.
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5E3C]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">Attendance & Check-Ins</h1>
          <p className="text-[#8B5E3C] mt-2">Live tracking for your event check-ins.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-[#8B5E3C] hover:bg-[#5C3A21] text-white shadow-md shadow-[#8B5E3C]/20"
          >
            <Camera className="mr-2 size-4" /> Scan Ticket
          </Button>
          <Button 
            onClick={exportCSV}
            variant="outline"
            className="border-[#8B5E3C] text-[#8B5E3C] hover:bg-[#F5E6D3]"
          >
            <Download className="mr-2 size-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC4] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="size-16 text-[#8B5E3C]" /></div>
          <p className="text-sm font-bold text-[#A89F91] uppercase tracking-wider mb-2">Total Registrations</p>
          <p className="text-4xl font-extrabold text-[#3E2723]">{stats.totalRegistrations}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle className="size-16 text-green-600" /></div>
          <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">Total Checked-In</p>
          <p className="text-4xl font-extrabold text-[#3E2723]">{stats.totalCheckedIn}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC4] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="size-16 text-[#8B5E3C]" /></div>
          <p className="text-sm font-bold text-[#A89F91] uppercase tracking-wider mb-2">Today's Check-Ins</p>
          <p className="text-4xl font-extrabold text-[#3E2723]">{stats.todaysCheckIns}</p>
        </div>

        <div className="bg-gradient-to-br from-[#8B5E3C] to-[#5C3A21] p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ScanLine className="size-16 text-white" /></div>
          <p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">Attendance Rate</p>
          <p className="text-4xl font-extrabold">{stats.attendancePercentage}%</p>
        </div>
      </div>

      {/* Tools */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E8DCC4] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, ticket, email, phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#E8DCC4]">
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Ticket #</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Attendee</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Event</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Time</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC4]">
              {filteredList.map((record, i) => (
                <tr key={record._id || i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-[#3E2723]">{record.ticketNumber}</td>
                  <td className="p-4 font-medium text-[#3E2723]">{record.attendeeName}</td>
                  <td className="p-4 text-sm text-[#8B5E3C] truncate max-w-[150px]">{record.eventName}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <p>{record.email}</p>
                    <p className="text-xs">{record.phone}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(record.checkedInAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 size-3" /> Checked In
                    </span>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />

      {/* Verification Modal */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-[#E8DCC4] rounded-2xl">
          <DialogTitle className="text-xl font-bold text-[#3E2723] border-b border-[#E8DCC4] pb-4">
            Verify Attendee
          </DialogTitle>
          
          {verificationData && (
            <div className="space-y-4 py-4">
              <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC4]">
                <h3 className="font-extrabold text-2xl text-[#3E2723] mb-1">{verificationData.attendeeName}</h3>
                <p className="text-sm font-bold text-[#8B5E3C] uppercase tracking-wider">{verificationData.eventName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-[#3E2723]">
                <div>
                  <span className="block text-xs font-bold text-[#A89F91] uppercase mb-1">Ticket Number</span>
                  <span className="font-mono">{verificationData.ticketNumber}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#A89F91] uppercase mb-1">Registered</span>
                  <span>{new Date(verificationData.registrationDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#A89F91] uppercase mb-1">Email</span>
                  <span className="truncate">{verificationData.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#A89F91] uppercase mb-1">Phone</span>
                  <span>{verificationData.phone}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0 mt-4 border-t border-[#E8DCC4] pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsVerifyModalOpen(false)}
              className="border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmCheckIn}
              disabled={isCheckingIn}
              className="bg-green-600 hover:bg-green-700 text-white shadow-md"
            >
              <CheckCircle className="mr-2 size-4" /> 
              {isCheckingIn ? 'Checking In...' : 'Confirm Check-In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
