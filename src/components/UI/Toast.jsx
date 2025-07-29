// src/components/UI/Toast.jsx
import { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [message, onClose]);

  const baseStyle = "fixed top-5 left-5 p-2 rounded-lg shadow-lg text-white z-[100]";
  const typeStyle = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  if (!message) return null;

  return (
    <div className={`${baseStyle} ${typeStyle}`}>
      {message}
    </div>
  );
};

export default Toast;