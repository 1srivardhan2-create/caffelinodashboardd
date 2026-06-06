import { ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { useEventAuth } from '../../context/EventAuthContext';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CalendarDays, 
  Settings, 
  LogOut,
  Ticket,
  X,
  MenuIcon as MenuBurger,
  IndianRupee,
  ListOrdered
} from 'lucide-react';

interface EventsLayoutProps {
  children: ReactNode;
}

export default function EventsLayout({ children }: EventsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useEventAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/events/login');
  };

  const navItems = [
    { to: '/events/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/events/earnings', icon: IndianRupee, label: 'Earnings' },
    { to: '/events/tickets', icon: Ticket, label: 'Tickets Sold' },
    { to: '/events/create', icon: PlusCircle, label: 'Create Event' },
    { to: '/events/my-events', icon: ListOrdered, label: 'My Events' },
    { to: '/events/manage', icon: CalendarDays, label: 'Manage Events' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#E8DCC4] z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#8B5E3C] to-[#5C3A21] p-2 rounded-lg">
            <Ticket className="size-5 text-[#FDFBF7]" />
          </div>
          <div>
            <h1 className="font-bold text-[#3E2723]">Caffelino Events</h1>
            <p className="text-[10px] text-[#8B5E3C] uppercase tracking-wider font-semibold">Organizer Hub</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-[#F5E6D3]/50 rounded-lg text-[#8B5E3C]"
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <MenuBurger className="size-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#3E2723]/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-white border-r border-[#E8DCC4] flex flex-col
        transform transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(139,94,60,0.05)]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-[#E8DCC4] hidden lg:block">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#8B5E3C] to-[#5C3A21] p-3 rounded-xl shadow-md shadow-[#8B5E3C]/20">
              <Ticket className="size-7 text-[#FDFBF7]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-[#3E2723] tracking-tight">Caffelino</h1>
              <p className="text-xs text-[#C19A6B] uppercase tracking-[0.2em] font-bold mt-1">Events Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 mt-16 lg:mt-0">
          <div className="text-xs font-bold text-[#A89F91] uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/events/dashboard' && location.pathname.startsWith(item.to));
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                    isActive
                      ? 'text-[#FDFBF7] font-medium shadow-md shadow-[#8B5E3C]/20'
                      : 'text-[#5C3A21] hover:bg-[#F5E6D3]/40'
                  }`
                }
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B5E3C] to-[#C19A6B] z-0" />
                )}
                <Icon className={`size-5 relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FDFBF7]' : 'text-[#8B5E3C]'}`} />
                <span className="relative z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E8DCC4] bg-[#FDFBF7]/50">
          {user && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="size-10 rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#5C3A21] flex items-center justify-center text-white overflow-hidden shadow-sm">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.fullName} className="size-full object-cover" />
                ) : (
                  <span className="font-bold text-sm">{user.fullName?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#3E2723] truncate">{user.fullName}</p>
                <p className="text-xs text-[#8B5E3C] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start text-[#8B5E3C] border-[#E8DCC4] hover:bg-white hover:text-[#5C3A21] rounded-xl h-12"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 size-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0 bg-[#FDFBF7] selection:bg-[#C19A6B] selection:text-white">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
