"use client"

import { useQuery } from '@apollo/client'
import { GET_ORDER_BY_ID } from '@/graphql/order.gql'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Clock, Package, Truck, CreditCard } from 'lucide-react'
import Loader from '@/components/seraui/Loader'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const orderId = params?.id
  const { clearCart } = useCart()


  const { data, loading, error } = useQuery(GET_ORDER_BY_ID, {
    variables: { id: orderId },
    skip: !orderId,
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader loading={true} />
      </div>
    )
  }

  clearCart()

  if (error || !data?.order) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/marketplace/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Order not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">We couldn't find this order. It may have been removed or the link is invalid.</p>
            <div className="mt-4">
              <Button onClick={() => router.push('/marketplace/products')}>Browse products</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const order = data.order
  const paymentStatus: string = order?.payment?.status || 'PENDING'
  const statusBadge = paymentStatus === 'COMPLETED' ? (
    <span className="inline-flex items-center text-green-700 bg-green-50 border border-green-200 text-xs font-medium px-2 py-1 rounded">
      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200 text-xs font-medium px-2 py-1 rounded">
      <Clock className="h-3.5 w-3.5 mr-1" /> Pending
    </span>
  )

  const subtotal = order.products.reduce((sum: number, p: any) => sum + p.product.price * p.quantity, 0)
  const deliveryFee = order.deliveryFee || 0
  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/marketplace/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmation</h1>
          <p className="text-sm text-gray-600 mt-1">Order ID: <span className="font-mono">{order.id}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items
                </CardTitle>
                {statusBadge}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.products.map((op: any) => (
                    <div key={op.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{op.product.title}</p>
                        <p className="text-xs text-gray-600">Quantity: {op.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(op.product.price * op.quantity)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="mt-1">{order.deliveryAddress || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="uppercase">{order.payment?.method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span>{paymentStatus}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Button className="w-full mt-6" asChild>
                  <Link href="/marketplace/products">Continue shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}