import { useState, useEffect } from 'react';
import CodeHighlight from '../../CodeHighlight';

const CodeSnippetModal = ({ code, language, darkMode, isOpen, onClose }) => {
  const [fontSize, setFontSize] = useState(14);
  const [show, setShow] = useState(false);

  // This effect handles the enter/exit animations
  useEffect(() => {
    if (isOpen) {
      // Use a timeout to allow the component to mount before starting the transition
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  // This effect handles closing the modal with the Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Don't render the modal if it's not open and the exit animation is complete
  if (!isOpen && !show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      // Add a semi-transparent background and the backdrop-blur effect
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      <div
        className={`relative flex flex-col rounded-lg shadow-xl w-full h-full max-w-4xl max-h-[90vh] ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } transition-all duration-300 transform ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        // Prevent modal from closing when clicking inside it
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{language}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFontSize(Math.max(8, fontSize - 1))}
                className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                A-
              </button>
              <span className={`text-sm w-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                A+
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-auto">
          <CodeHighlight
            codeString={code}
            language={language}
            darkMode={darkMode}
            fontSize={fontSize}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
