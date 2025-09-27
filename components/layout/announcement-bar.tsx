'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const ANNOUNCEMENTS = [
  "🎉 Free shipping on orders over $80 - Limited time offer!",
  "💰 Save 40% with code SAVE2025 - Valid until midnight",
  "✨ New arrivals now available - Shop the latest trends",
]

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="z-20 relative bg-primary border-b text-primary-foreground">
      <div className="flex justify-center items-center h-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="min-w-full font-medium text-sm text-center"
          >
            {ANNOUNCEMENTS[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="top-1/2 right-2 absolute hover:bg-primary-foreground/20 p-1 rounded-sm -translate-y-1/2"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
