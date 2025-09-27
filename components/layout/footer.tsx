import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { Button, IconButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/common/logo'
import { APP_CONTACTS, FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";
import { PaymentMethods } from '@/components/icons/payment-methods';
import { subscribeToNewsletter } from '@/app/api/newsletter/actions';

export function Footer() {
  return (
    <footer className="bg-gray-50 mx-auto p-0 border-t w-screen">
      {/* Newsletter Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="px-4 py-12 container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-2 font-bold text-2xl">Stay in the Loop</h2>
            <p className="opacity-90 mb-6">
              Get exclusive offers, new product updates, and style tips delivered to your inbox.
            </p>
            <form
              action={subscribeToNewsletter}
              className="flex gap-2 mx-auto max-w-md"
            >
              <Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="bg-white border-0 focus:ring-2 focus:ring-white/20 text-gray-900"
                required
              />
              <Button 
                variant="secondary" 
                type="submit"
                className="bg-white hover:bg-gray-100 font-medium text-primary"
              >
                Subscribe
              </Button>
            </form>
            <p className="opacity-75 mt-3 text-xs">
              By subscribing, you agree to receive promotional emails. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-4 py-12 container">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-600 text-sm leading-relaxed">
              Your trusted destination for premium products. We&apos;re committed to delivering 
              exceptional quality and outstanding customer service.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: APP_CONTACTS.address.office,
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{APP_CONTACTS.phone.main}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{APP_CONTACTS.email.getInTouch}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Customer Care</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Legal */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Connect With Us</h3>
              <div className="flex gap-3">
                <IconButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Facebook className="w-4 h-4" />
                  <span className="sr-only">Facebook</span>
                </IconButton>
                <IconButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Twitter className="w-4 h-4" />
                  <span className="sr-only">Twitter</span>
                </IconButton>
                <IconButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Instagram className="w-4 h-4" />
                  <span className="sr-only">Instagram</span>
                </IconButton>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Legal</h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="bg-white px-4 py-6 border-t container">
        <div className="flex md:flex-row flex-col justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2024 {SITE_CONFIG.name}. All rights reserved.
          </p>
          <PaymentMethods />
          <div className="flex flex-wrap gap-4 text-gray-600 text-xs">
            <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/returns-exchange" className="hover:text-gray-900 transition-colors">
              Returns & Exchange
            </Link>
            <Link href="/shipping-delivery" className="hover:text-gray-900 transition-colors">
              Shipping & Delivery
            </Link>
            <Link href="/rewards-terms" className="hover:text-gray-900 transition-colors">
              Rewards Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
