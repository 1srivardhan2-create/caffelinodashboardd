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
  const [isConfirmingCheckIn, setIsConfirmingCheckIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Success and Error Modals
  const [successData, setSuccessData] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorData, setErrorData] = useState<any>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

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
        setIsConfirmingCheckIn(false);
        setIsVerifyModalOpen(true);
      } else {
        // If the ticket was already checked in, show error modal
        if (res.message === '❌ Already Checked In' && res.data) {
          setErrorData(res.data);
          setIsErrorModalOpen(true);
        } else {
          toast.error(res.message || 'Invalid Ticket');
        }
      }
    } catch (err: any) {
      setIsScannerOpen(false);
      
      if (err?.response?.data?.message === '❌ Already Checked In' && err?.response?.data?.data) {
        setErrorData(err.response.data.data);
        setIsErrorModalOpen(true);
      } else {
        toast.error(err?.response?.data?.message || 'Error verifying ticket.');
      }
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
        setIsVerifyModalOpen(false);
        // Show success modal
        setSuccessData({
          attendeeName: verificationData.attendeeName,
          ticketNumber: verificationData.ticketNumber,
          eventName: verificationData.eventName,
          checkedInAt: res.attendance?.checkedInAt || new Date().toISOString()
        });
        setIsSuccessModalOpen(true);
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
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Payment</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Time</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Scanned By</th>
                <th className="p-4 text-xs font-bold text-[#A89F91] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC4]">
              {filteredList.map((record, i) => (
                <tr key={record._id || i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-[#3E2723]">{record.ticketNumber}</td>
                  <td className="p-4 font-medium text-[#3E2723]">
                    {record.attendeeName}
                    <div className="text-xs text-gray-500 font-normal">{record.phone}</div>
                  </td>
                  <td className="p-4 text-sm text-[#8B5E3C] truncate max-w-[150px]">{record.eventName}</td>
                  <td className="p-4 text-sm">
                    {record.paymentStatus === 'completed' ? (
                      <span className="text-green-600 font-medium">PAID</span>
                    ) : record.paymentStatus === 'pending' ? (
                      <span className="text-orange-600 font-medium">PENDING</span>
                    ) : (
                      <span className="text-gray-600 font-medium uppercase">{record.paymentStatus || 'FREE'}</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(record.checkedInAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{record.checkedInBy}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 size-3" /> Checked In
                    </span>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
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
        <DialogContent className="max-w-2xl bg-white border-[#E8DCC4] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold text-[#3E2723] border-b border-[#E8DCC4] pb-4">
            Verify Attendee
          </DialogTitle>
          
          {verificationData && (
            <div className="space-y-6 py-2">
              
              {/* ATTENDEE INFORMATION */}
              <div>
                <h4 className="text-xs font-bold text-[#A89F91] uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Attendee Information</h4>
                <div className="flex items-start gap-4">
                  {verificationData.profilePhoto ? (
                    <img src={verificationData.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#8B5E3C]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#F5E6D3] flex items-center justify-center text-[#8B5E3C] font-bold text-xl border-2 border-[#8B5E3C] shrink-0">
                      {verificationData.attendeeName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-2xl text-[#3E2723] truncate">{verificationData.attendeeName}</h3>
                    {verificationData.phone && <p className="text-sm text-gray-600 mt-1">Mobile: <span className="font-medium text-[#3E2723]">{verificationData.phone}</span></p>}
                    {verificationData.email && <p className="text-sm text-gray-600">Email: <span className="font-medium text-[#3E2723]">{verificationData.email}</span></p>}
                    {verificationData.instagramId && <p className="text-sm text-gray-600">Instagram: <span className="font-medium text-[#8B5E3C]">@{verificationData.instagramId}</span></p>}
                  </div>
                </div>
              </div>

              {/* TICKET INFORMATION */}
              <div>
                <h4 className="text-xs font-bold text-[#A89F91] uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Ticket Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4 text-sm bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC4]">
                  <div>
                    <span className="block text-xs text-gray-500">Ticket Number</span>
                    <span className="font-mono font-bold text-[#8B5E3C]">{verificationData.ticketNumber}</span>
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <span className="block text-xs text-gray-500">Registration ID</span>
                    <span className="font-mono text-xs text-gray-600 block truncate" title={verificationData.registrationId}>{verificationData.registrationId}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Registration Time</span>
                    <span className="font-medium text-[#3E2723]">{new Date(verificationData.registrationDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Payment Status</span>
                    {verificationData.paymentStatus === 'completed' ? (
                      <span className="font-bold text-green-600">PAID</span>
                    ) : verificationData.paymentStatus === 'pending' ? (
                      <span className="font-bold text-orange-600">PENDING</span>
                    ) : (
                      <span className="font-bold text-gray-600 uppercase">{verificationData.paymentStatus || 'FREE'}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Ticket Price</span>
                    <span className="font-medium text-[#3E2723]">₹{verificationData.ticketPrice}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Seat Number</span>
                    <span className="font-medium text-[#3E2723]">{verificationData.seatNumber}</span>
                  </div>
                </div>
              </div>

              {/* EVENT INFORMATION */}
              <div>
                <h4 className="text-xs font-bold text-[#A89F91] uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Event Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="block text-xs text-gray-500">Event</span>
                    <span className="font-bold text-[#3E2723]">{verificationData.eventName}</span>
                  </div>
                  {verificationData.organizationName && (
                    <div className="col-span-2">
                      <span className="block text-xs text-gray-500">Hosted By</span>
                      <span className="font-medium text-[#3E2723]">{verificationData.organizationName}</span>
                    </div>
                  )}
                  {verificationData.instagramId && (
                    <div className="col-span-2 md:col-span-3 mt-2">
                      <a href={`https://instagram.com/${verificationData.instagramId.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        View Event Instagram
                      </a>
                    </div>
                  )}
                  {verificationData.eventCategory && (
                    <div>
                      <span className="block text-xs text-gray-500">Category</span>
                      <span className="font-medium text-[#3E2723]">{verificationData.eventCategory}</span>
                    </div>
                  )}
                  {verificationData.eventDate && (
                    <div>
                      <span className="block text-xs text-gray-500">Date</span>
                      <span className="font-medium text-[#3E2723]">{new Date(verificationData.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {verificationData.startTime && (
                    <div>
                      <span className="block text-xs text-gray-500">Time</span>
                      <span className="font-medium text-[#3E2723]">{verificationData.startTime}</span>
                    </div>
                  )}
                  {verificationData.venueName && (
                    <div className="col-span-2">
                      <span className="block text-xs text-gray-500">Venue</span>
                      <span className="font-medium text-[#3E2723]">{verificationData.venueName}{verificationData.city ? `, ${verificationData.city}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          <DialogFooter className="flex flex-col gap-3 mt-4 border-t border-[#E8DCC4] pt-4">
            {isConfirmingCheckIn ? (
              <div className="w-full">
                <p className="text-center font-bold text-[#3E2723] mb-4">Confirm attendee check-in?</p>
                <div className="flex gap-3 justify-center w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfirmingCheckIn(false)}
                    className="flex-1 border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50"
                  >
                    No
                  </Button>
                  <Button 
                    onClick={confirmCheckIn}
                    disabled={isCheckingIn}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md"
                  >
                    <CheckCircle className="mr-2 size-4" /> 
                    {isCheckingIn ? 'Checking In...' : 'Yes, Check-In'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-end w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="border-[#E8DCC4] text-[#8B5E3C] hover:bg-[#F5E6D3]/50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setIsConfirmingCheckIn(true)}
                  className="bg-[#8B5E3C] hover:bg-[#5C3A21] text-white shadow-md"
                >
                  Continue Check-In
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUCCESS MODAL */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-green-200 rounded-2xl text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 text-green-600 p-4 rounded-full">
              <CheckCircle className="size-12" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-black text-[#3E2723] mb-2">
            Check-In Successful
          </DialogTitle>
          {successData && (
            <div className="text-left bg-[#FDFBF7] p-4 rounded-xl border border-[#E8DCC4] mt-6">
              <p className="text-sm text-gray-500 mb-1">Attendee Name</p>
              <p className="font-bold text-[#3E2723] mb-3">{successData.attendeeName}</p>
              
              <p className="text-sm text-gray-500 mb-1">Event Name</p>
              <p className="font-bold text-[#3E2723] mb-3">{successData.eventName}</p>

              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ticket Number</p>
                  <p className="font-mono text-[#8B5E3C]">{successData.ticketNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Check-In Time</p>
                  <p className="font-medium text-[#3E2723]">{new Date(successData.checkedInAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
          <Button 
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* ALREADY SCANNED MODAL */}
      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-red-200 rounded-2xl text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 text-red-600 p-4 rounded-full">
              <XCircle className="size-12" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-black text-[#3E2723] mb-2">
            Ticket Already Used
          </DialogTitle>
          <p className="text-gray-600 mb-6">This ticket has already been checked in and cannot be used again.</p>
          
          {errorData && (
            <div className="text-left bg-[#FDFBF7] p-4 rounded-xl border border-red-100 mt-2 space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Attendee Name</p>
                <p className="font-bold text-[#3E2723]">{errorData.attendeeName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Previous Check-In Time</p>
                  <p className="font-medium text-red-600">{new Date(errorData.checkedInAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Checked-In By</p>
                  <p className="font-medium text-[#3E2723]">{errorData.checkedInBy}</p>
                </div>
              </div>
            </div>
          )}
          <Button 
            onClick={() => setIsErrorModalOpen(false)}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
