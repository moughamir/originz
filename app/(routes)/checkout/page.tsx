'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Lock, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { checkoutSchema } from '@/lib/validations'
import { handleCheckout } from './actions'

interface CheckoutFormData {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string
  phone?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US',
    phone: ''
  })

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const shipping = totalPrice > 50 ? 0 : 9.99
  const tax = totalPrice * 0.08 // 8% tax
  const finalTotal = totalPrice + shipping + tax

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      // Validate form data
      const validatedData = checkoutSchema.parse(formData)
      
      // Create order data
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
          price: item.variant.price
        })),
        customer: validatedData,
        totals: {
          subtotal: totalPrice,
          shipping,
          tax,
          total: finalTotal
        }
      }

      // Process checkout
      const result = await handleCheckout(orderData)
      
      if (result.success) {
        // Clear cart and redirect to success page
        clearCart()
        router.push(`/checkout/success?order=${result.orderId}`)
      } else {
        setError(result.error || 'Checkout failed. Please try again.')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="px-4 py-8 max-w-6xl container">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/cart" 
          className="inline-flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
        <h1 className="font-bold text-3xl tracking-tight">Checkout</h1>
        <p className="mt-2 text-gray-600">
          Complete your order securely
        </p>
      </div>

      <div className="gap-8 grid lg:grid-cols-2">
        {/* Checkout Form */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="gap-4 grid grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <Separator />

                {/* Shipping Address */}
                <div>
                  <h3 className="flex items-center gap-2 mb-4 font-medium">
                    <Truck className="w-4 h-4" />
                    Shipping Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street"
                        required
                      />
                    </div>

                    <div className="gap-4 grid grid-cols-2">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 p-3 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 border-white border-b-2 rounded-full w-4 h-4 animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 w-4 h-4" />
                      Complete Order - {formatPrice(finalTotal)}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Badges */}
          <div className="flex justify-center items-center gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant.id}`} className="flex gap-3">
                    <div className="relative bg-gray-100 rounded-md w-16 h-16 overflow-hidden">
                      <Image
                        src={item.image || '/web-app-manifest-512x512.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      {item.variant.title !== 'Default Title' && (
                        <p className="text-gray-600 text-xs">{item.variant.title}</p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-600 text-sm">Qty: {item.quantity}</span>
                        <span className="font-medium text-sm">
                          {formatPrice(item.variant.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="text-xs">FREE</Badge>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 p-3 border border-blue-200 rounded-md">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 text-sm">
                    Add {formatPrice(50 - totalPrice)} more for free shipping!
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">We Accept</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-2xl">💳</div>
                <div className="text-2xl">🏦</div>
                <div className="text-2xl">📱</div>
                <div className="text-gray-600 text-sm">
                  Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}