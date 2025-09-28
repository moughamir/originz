'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { Logo } from '../common/logo'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="z-50  flex flex-col bg-white p-4">
        <SheetHeader>
          <SheetTitle><Logo /></SheetTitle>
        </SheetHeader>
        <div className="flex-1 py-4">
          <nav className="flex flex-col gap-4">
            {NAVIGATION_ITEMS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-lg font-medium border-neutral-50 p-4',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center gap-4">
            <Link href="/search" className="flex-1">
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
