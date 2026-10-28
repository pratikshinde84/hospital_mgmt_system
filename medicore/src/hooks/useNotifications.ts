import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService';
import { STORAGE_KEYS } from '../types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setNotifications(getUserNotifications(user.id, user.role));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.NOTIFICATIONS) refresh();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    refresh();
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    markAllAsRead(user.id, user.role);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    refresh();
  };

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    refresh,
  };
}

export function useNotificationCount(): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) { setCount(0); return; }
    setCount(getUnreadCount(user.id, user.role));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.NOTIFICATIONS) refresh();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  return count;
}
