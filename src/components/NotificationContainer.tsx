'use client';

import React from 'react';
import { useNotificationStore } from '@/lib/notification-store';
import { motion, AnimatePresence } from 'framer-motion';

const typeColors = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-warning text-dark',
};

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`${typeColors[notification.type]} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4`}
          >
            <p>{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-xl hover:opacity-80"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
