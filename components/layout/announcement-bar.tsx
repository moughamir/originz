'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

const ANNOUNCEMENTS = [
  "🎉 Free shipping on orders over $50 - Limited time offer!",
  "💰 Save 20% with code SAVE2025 - Valid until midnight",
  "✨ New arrivals now available - Shop the latest trends",
]

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-primary text-primary-foreground border-b">
      <div className="overflow-hidden">
        <div className="animate-slide-up duration-1000 flex">
          {ANNOUNCEMENTS.map((announcement, index) => (
            <div
              key={index}
              className="flex min-w-full items-center justify-center px-4 py-2 text-sm font-medium"
            >
              {announcement}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 hover:bg-primary-foreground/20"
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
