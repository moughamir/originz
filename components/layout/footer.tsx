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
    <footer className="bg-gray-50 border-t">
      {/* Newsletter Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Stay in the Loop</h2>
            <p className="mb-6 opacity-90">
              Get exclusive offers, new product updates, and style tips delivered to your inbox.
            </p>
            <form
              action={subscribeToNewsletter}
              className="flex gap-2 max-w-md mx-auto"
            >
              <Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="bg-white text-gray-900 border-0 focus:ring-2 focus:ring-white/20"
                required
              />
              <Button 
                variant="secondary" 
                type="submit"
                className="bg-white text-primary hover:bg-gray-100 font-medium"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs mt-3 opacity-75">
              By subscribing, you agree to receive promotional emails. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-gray-600 leading-relaxed">
              Your trusted destination for premium products. We&apos;re committed to delivering 
              exceptional quality and outstanding customer service.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: APP_CONTACTS.address.office,
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{APP_CONTACTS.phone.main}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{APP_CONTACTS.email.getInTouch}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Customer Care</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
              <h3 className="font-semibold mb-4 text-gray-900">Connect With Us</h3>
              <div className="flex gap-3">
                <IconButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Facebook className="h-4 w-4" />
                  <span className="sr-only">Facebook</span>
                </IconButton>
                <IconButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </IconButton>
                <IconButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Instagram className="h-4 w-4" />
                  <span className="sr-only">Instagram</span>
                </IconButton>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Legal</h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
      <div className="container px-4 py-6 bg-white border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2024 {SITE_CONFIG.name}. All rights reserved.
          </p>
          <PaymentMethods />
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
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
