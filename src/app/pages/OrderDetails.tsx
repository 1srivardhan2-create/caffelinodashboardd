import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { CheckCircle, Clock, Coffee, Package, AlertCircle } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://caffelinodashboardd.onrender.com"
);

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/orders/${id}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Order not found');
        }
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <AlertCircle size={48} color="#ef4444" />
          <h2 style={styles.errorTitle}>Order Not Found</h2>
          <p style={styles.errorMsg}>{error || 'This order does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    PENDING: { color: '#f59e0b', bg: '#fef3c7', icon: Clock, label: 'Pending' },
    ACCEPTED: { color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle, label: 'Accepted' },
    TOKEN_PAID: { color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle, label: 'Token Paid' },
    CONFIRMED: { color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle, label: 'Confirmed' },
    READY: { color: '#8b5cf6', bg: '#ede9fe', icon: Package, label: 'Ready' },
    COMPLETED: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle, label: 'Completed' },
    CANCELLED: { color: '#ef4444', bg: '#fee2e2', icon: AlertCircle, label: 'Cancelled' },
  };

  const rawStatus = (order.orderStatus || order.status || 'PENDING').toUpperCase();
  const sConf = statusConfig[rawStatus] || statusConfig.PENDING;
  const StatusIcon = sConf.icon;

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoRow}>
            <div style={styles.logoBg}>
              <Coffee size={22} color="#fff" />
            </div>
            <div>
              <h1 style={styles.brandName}>CAFFELINO</h1>
              <p style={styles.brandSub}>Order Verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div style={styles.cardWrapper}>
        <div style={styles.card}>
          {/* Status Badge */}
          <div style={{ ...styles.statusBadge, backgroundColor: sConf.bg, color: sConf.color }}>
            <StatusIcon size={18} />
            <span style={styles.statusText}>{sConf.label}</span>
          </div>

          {/* Order ID */}
          <div style={styles.orderIdRow}>
            <span style={styles.orderIdLabel}>Order</span>
            <span style={styles.orderIdValue}>#{order.orderId || order._id?.slice(-6)}</span>
          </div>

          {/* Cafe Name */}
          {order.cafeName && (
            <div style={styles.cafeNameRow}>
              <Coffee size={16} color="#f97316" />
              <span style={styles.cafeName}>{order.cafeName}</span>
            </div>
          )}

          {/* Customer Info */}
          {order.userName && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Customer</span>
              <span style={styles.infoValue}>{order.userName}</span>
            </div>
          )}
          {order.memberCount && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Members</span>
              <span style={styles.infoValue}>{order.memberCount}</span>
            </div>
          )}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Date & Time</span>
            <span style={styles.infoValue}>{new Date(order.createdAt).toLocaleString()}</span>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Items */}
          <h3 style={styles.sectionTitle}>Order Items</h3>
          <div style={styles.itemsList}>
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} style={styles.itemRow}>
                <div style={styles.itemLeft}>
                  <span style={styles.itemName}>{item.name || 'Item'}</span>
                  <span style={styles.itemQty}>x{item.quantity}</span>
                </div>
                <span style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Totals */}
          <div style={styles.totalsSection}>
            {order.subtotal > 0 && (
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Subtotal</span>
                <span style={styles.totalValue}>₹{order.subtotal.toFixed(2)}</span>
              </div>
            )}
            {order.cgst > 0 && (
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>CGST</span>
                <span style={styles.totalValue}>₹{order.cgst.toFixed(2)}</span>
              </div>
            )}
            {order.sgst > 0 && (
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>SGST</span>
                <span style={styles.totalValue}>₹{order.sgst.toFixed(2)}</span>
              </div>
            )}
            <div style={styles.grandTotalRow}>
              <span style={styles.grandTotalLabel}>Total</span>
              <span style={styles.grandTotalValue}>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div style={styles.paymentBadge}>
            <Package size={16} color="#16a34a" />
            <span>Payment: {order.paymentMethod || 'CASH'} at counter</span>
          </div>

          {/* Verified Stamp */}
          <div style={styles.verifiedStamp}>
            <CheckCircle size={20} color="#10b981" />
            <span>Order Verified via QR Scan</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>Powered by <strong style={{ color: '#f97316' }}>Caffelino</strong></p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #f97316',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 14,
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: 20,
  },
  errorCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    padding: 40,
    textAlign: 'center' as const,
    border: '1px solid rgba(255,255,255,0.1)',
    maxWidth: 400,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMsg: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: '1.6',
  },
  header: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '16px 20px',
  },
  headerInner: {
    maxWidth: 480,
    margin: '0 auto',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoBg: {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    padding: 8,
    borderRadius: 10,
  },
  brandName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '2px',
    margin: 0,
  },
  brandSub: {
    color: '#94a3b8',
    fontSize: 12,
    margin: 0,
  },
  cardWrapper: {
    maxWidth: 480,
    margin: '24px auto',
    padding: '0 16px',
  },
  card: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 24,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 16,
  },
  statusText: {
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  orderIdRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  orderIdLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  orderIdValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 800,
  },
  cafeNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    background: 'rgba(249,115,22,0.1)',
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid rgba(249,115,22,0.2)',
  },
  cafeName: {
    color: '#fdba74',
    fontSize: 15,
    fontWeight: 600,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 500,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.08)',
    margin: '16px 0',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 12,
    margin: '0 0 12px 0',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
    padding: '10px 12px',
    borderRadius: 10,
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 500,
  },
  itemQty: {
    color: '#94a3b8',
    fontSize: 12,
    background: 'rgba(255,255,255,0.06)',
    padding: '2px 8px',
    borderRadius: 6,
  },
  itemPrice: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 600,
  },
  totalsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  totalValue: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  grandTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: '12px 14px',
    background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.1))',
    borderRadius: 12,
    border: '1px solid rgba(249,115,22,0.2)',
  },
  grandTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
  },
  grandTotalValue: {
    color: '#fb923c',
    fontSize: 20,
    fontWeight: 800,
  },
  paymentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: '10px 14px',
    background: 'rgba(16,185,129,0.08)',
    borderRadius: 10,
    border: '1px solid rgba(16,185,129,0.15)',
    color: '#34d399',
    fontSize: 13,
    fontWeight: 500,
  },
  verifiedStamp: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: '12px',
    background: 'rgba(16,185,129,0.06)',
    borderRadius: 12,
    border: '1px dashed rgba(16,185,129,0.3)',
    color: '#6ee7b7',
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '24px 20px',
    color: '#64748b',
    fontSize: 13,
  },
};
