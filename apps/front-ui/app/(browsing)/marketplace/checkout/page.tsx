'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { CREATE_ORDER } from '@/graphql/order.gql'
import { useCart } from '@/hooks/use-cart'
import { useMe } from '@/lib/useMe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { Loader2, ArrowLeft, CreditCard, Smartphone, Banknote, ShoppingCart, Plus } from 'lucide-react'
import Link from 'next/link'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/toast-provider'
import Loader from '@/components/seraui/Loader'

const PAYMENT_METHODS = [
  { id: 'TOKEN', label: 'Token Payment', icon: CreditCard },
  { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
  { id: 'CASH', label: 'Cash on Delivery', icon: Banknote },
  { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { showToast } = useToast()
  const { user, role, id: userId, loading: userLoading } = useMe()

  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const [createOrder] = useMutation(CREATE_ORDER)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/marketplace/products')
    }
  }, [items, router])

  // Calculate totals
  const subtotal = items.reduce((total, { product }) => total + product.price, 0)
  const deliveryFee = 5.00 // Fixed delivery fee
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliveryAddress.trim()) {
      showToast("error", "Address Required", 'Please enter a delivery address')
      return
    }

    if (!paymentMethod) {
      showToast("error", "Payment Error", 'Please select a payment method')
      return
    }

    if (!userId) {
      showToast("error", "Redirecting", 'User not authenticated')
      return
    }

    setIsProcessing(true)

    try {
      const orderProducts = items.map(({ product }) => ({
        productId: product.id,
        quantity: 1, // For now, assuming quantity 1. You might want to add quantity to cart items
      }))

      const { data } = await createOrder({
        variables: {
          input: {
            clientId: userId,
            deliveryFee,
            deliveryAddress: deliveryAddress.trim(),
            orderProducts,
            payment: {
              method: paymentMethod,
              status: 'PENDING',
            },
          },
        },
      })

      showToast("success", "Success", 'Order created successfully!', true, 5000)

      // Clear cart
      clearCart()

      // Redirect to order confirmation or order details
      router.push(`/marketplace/orders/${data.createOrder.id}`)
    } catch (error: any) {
      console.log('Order creation error:', error)
      showToast("error", "Error", error.message || 'Failed to create order')
    } finally {
      setIsProcessing(false)
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader loading={true} />
      </div>
    )
  }

  if (!userLoading && (!user || role !== 'client')) {
    // showToast("error", "Redirecting", 'Please sign in as a client to checkout', false, 5000)
    return (
      <div className="border border-border rounded-lg bg-card h-[600px] flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-muted/50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">You Can't By Your Own Products</h2>
          <p className="text-muted-foreground mb-6">
            Want to buy something for a client? Create a new sale to begin processing transactions
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/business/sales')}
            className="bg-primary hover:bg-accent text-primary-foreground"
          >
            <Plus className="h-5 w-5 mr-2" />
            Go To Sales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketplace/products"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <textarea
                      id="deliveryAddress"
                      placeholder="Enter your full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full p-2 border border-border rounded-md mt-1"
                      rows={3}
                      required
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon
                      return (
                        <div key={method.id} className="flex items-center space-x-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label
                            htmlFor={method.id}
                            className="flex items-center space-x-3 cursor-pointer flex-1"
                          >
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span>{method.label}</span>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {items.map(({ product }, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.title}</p>
                          <p className="text-xs text-gray-600">Quantity: 1</p>
                        </div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || !deliveryAddress.trim() || !paymentMethod}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Order...
                </>
              ) : (
                `Place Order - ${formatPrice(total)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}