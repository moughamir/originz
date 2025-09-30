"use client";

import { useEffect } from 'react';
import 'devtools-detect';

type DevToolsChangeDetail = {
  isOpen: boolean;
  orientation?: 'vertical' | 'horizontal';
};

type DevToolsChangeEvent = CustomEvent<DevToolsChangeDetail>;

const DevToolsBlocker = () => {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
      }

      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    const handleDevToolsChange = (e: Event) => {
      const detail = (e as DevToolsChangeEvent).detail;
      if (detail?.isOpen) {
        console.clear();
        console.log('%cHold Up!', 'color: #FF6B6B; font-size: 48px; font-weight: bold;');
        console.log('%cThis area is for developers only. Please do not attempt to manipulate the application.', 'font-size: 18px;');
      }
    };

    window.addEventListener('devtoolschange', handleDevToolsChange as EventListener);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('devtoolschange', handleDevToolsChange as EventListener);
    };
  }, []);

  return null;
};

export default DevToolsBlocker;
