import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SupabaseService } from '@/lib/supabase-service';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'assessment_created' | 'grade_posted' | 'attendance_alert' | 'class_update' | 'system' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  data?: any;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load notifications on component mount
  useEffect(() => {
    const initializeNotifications = async () => {
      loadNotifications();
      loadUnreadCount();

      // Set up real-time subscription
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const subscription = SupabaseService.subscribeToNotifications(
            user.id,
            handleNewNotification
          );

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (error) {
        console.error('Error getting user for notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await SupabaseService.getUserNotifications(20);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await SupabaseService.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNewNotification = (payload: any) => {
    const newNotification = payload.new as Notification;

    // Add to notifications list
    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);

    // Update unread count
    setUnreadCount(prev => prev + 1);

    // Show toast for high priority notifications
    if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
      toast({
        title: newNotification.title,
        description: newNotification.message,
        duration: 5000,
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const success = await SupabaseService.markNotificationRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await SupabaseService.markNotificationRead(notification.id);
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-500' :
                     priority === 'high' ? 'text-orange-500' :
                     'text-blue-500';

    switch (type) {
      case 'assessment_created':
        return <Info className={`w-4 h-4 ${iconClass}`} />;
      case 'grade_posted':
        return <CheckCircle className={`w-4 h-4 ${iconClass}`} />;
      case 'attendance_alert':
        return <AlertCircle className={`w-4 h-4 ${iconClass}`} />;
      case 'class_update':
        return <Bell className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <Info className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      !notification.read
                        ? 'bg-blue-50 hover:bg-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {index < notifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={loadNotifications}
            >
              Refresh notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
