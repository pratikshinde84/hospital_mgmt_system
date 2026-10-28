import type { Notification, UserRole } from '../types';
import { STORAGE_KEYS } from '../types';
import { getStorage, setStorage, generateId } from '../storage';

export function getAllNotifications(): Notification[] {
  return getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
}

export function getUserNotifications(userId: string, role: UserRole): Notification[] {
  return getAllNotifications()
    .filter((n) => n.userId === userId && n.userRole === role)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadCount(userId: string, role: UserRole): number {
  return getUserNotifications(userId, role).filter((n) => !n.isRead).length;
}

export function markAsRead(notificationId: string): void {
  const notifications = getAllNotifications();
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    notifications[index].isRead = true;
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
}

export function markAllAsRead(userId: string, role: UserRole): void {
  const notifications = getAllNotifications();
  notifications.forEach((n) => {
    if (n.userId === userId && n.userRole === role) {
      n.isRead = true;
    }
  });
  setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function deleteNotification(notificationId: string): void {
  const notifications = getAllNotifications().filter((n) => n.id !== notificationId);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function addNotification(data: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const notification: Notification = {
    ...data,
    id: generateId('notif'),
    createdAt: new Date().toISOString(),
  };
  const notifications = getAllNotifications();
  notifications.unshift(notification);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return notification;
}
