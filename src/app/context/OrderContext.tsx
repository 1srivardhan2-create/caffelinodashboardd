import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from './AuthContext';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderId?: string;
  cafeId: string;
  userName?: string;
  items: OrderItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed';
  paymentMode: string;
  createdAt: Date;
  completedAt?: Date;
  isDeleted?: boolean;
}

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  foodType: 'Veg' | 'Non-Veg';
  available: boolean;
}

interface OrderContextType {
  orders: Order[];
  menuItems: MenuItem[];
  acceptOrder: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  addMenuItem: (formData: FormData) => Promise<void>;
  updateMenuItem: (id: string, formData: FormData) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  restoreOrder: (orderId: string) => Promise<void>;
  getEarnings: () => {
    totalAmount: number;
    commission: number;
    finalAmount: number;
    completedOrders: Order[];
  };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          api.get('/api/cafe/orders/cafe').catch(() => []),
          api.get('/api/cafe/items').catch(() => [])
        ]);

        if (Array.isArray(ordersRes)) {
          const mappedOrders = ordersRes.map((o: any) => {
             // Normalize status from both mobile (lowercase / 'token_paid') and web (UPPERCASE)
             const rawStatus = (o.orderStatus || 'PENDING').toUpperCase();
             let status: 'pending' | 'confirmed' | 'completed' = 'pending';
             if (rawStatus === 'COMPLETED') status = 'completed';
             else if (rawStatus !== 'PENDING') status = 'confirmed';

             return {
               id: o._id,
               orderId: o.orderId || undefined,
               cafeId: o.cafe || o.cafeId,
               userName: o.userName || o.user?.name || undefined,
               items: (o.items || []).map((i: any) => ({
                 id: i.menuItem?._id || i._id || Math.random().toString(),
                 name: i.name || i.menuItem?.item_name || 'Item',
                 price: i.price || 0,
                 quantity: i.quantity || 1
               })),
               subtotal: o.subtotal || 0,
               cgst: o.cgst || 0,
               sgst: o.sgst || 0,
               totalAmount: o.totalAmount || 0,
               status,
               paymentMode: o.paymentMethod || 'CASH',
               createdAt: new Date(o.createdAt),
               completedAt: o.updatedAt ? new Date(o.updatedAt) : undefined,
               isDeleted: o.isDeleted || false
             };
          });
          setOrders(mappedOrders);
        }

        if (Array.isArray(menuRes)) {
          const mappedMenu = menuRes.map((m: any) => ({
            id: m._id,
            cafeId: m.cafe_owner?._id || m.cafe_owner,
            name: m.item_name,
            description: m.description_food,
            price: m.price,
            image: m.image_url || 'https://via.placeholder.com/400',
            category: m.Category,
            foodType: m.food_type || 'Veg',
            available: m.available !== false
          }));
          setMenuItems(mappedMenu);
        }
      } catch (err) {
        console.error("Error fetching Order/Menu data", err);
      }
    };
    fetchData();
  }, [isAuthenticated]);


  const acceptOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/cafe/orders/${orderId}/status`, { status: "ACCEPTED" });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'confirmed' as const } : order
        )
      );
    } catch(e) { console.error(e) }
  };

  const completeOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/cafe/orders/${orderId}/status`, { status: "COMPLETED" });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'completed' as const, completedAt: new Date() }
            : order
        )
      );
    } catch(e) { console.error(e) }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/cafe/orders/${orderId}/delete`, {});
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDeleted: true } : o));
    } catch(e) { console.error(e) }
  };

  const restoreOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/cafe/orders/${orderId}/restore`, {});
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDeleted: false } : o));
    } catch(e) { console.error(e) }
  };

  const addMenuItem = async (formData: FormData) => {
    const res = await api.postForm('/api/cafe/menuItem/cafe', formData);
    if (!res.data) {
      throw new Error(res.message || 'Failed to add menu item');
    }
    const m = res.data;
    const newItem: MenuItem = {
      id: m._id,
      cafeId: m.cafe_owner,
      name: m.item_name,
      description: m.description_food,
      price: m.price,
      image: m.image_url || 'https://via.placeholder.com/400',
      category: m.Category,
      foodType: m.food_type || 'Veg',
      available: m.available !== false
    };
    setMenuItems(prev => [newItem, ...prev]);
  };

  const updateMenuItem = async (id: string, formData: FormData) => {
    const res = await api.putForm(`/api/cafe/menuItem/edit/${id}`, formData);
    if (!res.data) {
      throw new Error(res.message || 'Failed to update menu item');
    }
    const m = res.data;
    setMenuItems(prev =>
      prev.map(item => (item.id === id ? {
        ...item,
        name: m.item_name,
        description: m.description_food,
        price: m.price,
        image: m.image_url || 'https://via.placeholder.com/400',
        category: m.Category,
        foodType: m.food_type || 'Veg',
        available: m.available !== false
      } : item))
    );
  };

  const deleteMenuItem = async (id: string) => {
    await api.delete(`/api/cafe/delete/item/${id}`);
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const getEarnings = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const totalAmount = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const commission = totalAmount * 0.06;
    const finalAmount = totalAmount - commission;

    return {
      totalAmount,
      commission,
      finalAmount,
      completedOrders
    };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        menuItems,
        acceptOrder,
        completeOrder,
        deleteOrder,
        restoreOrder,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        getEarnings
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}