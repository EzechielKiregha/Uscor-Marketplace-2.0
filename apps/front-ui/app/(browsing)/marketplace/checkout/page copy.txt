'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { CREATE_ORDER } from '@/graphql/order.gql'
import { useCart } from '@/hooks/use-cart'
import { useMe } from '@/lib/useMe'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { Loader2, ArrowLeft, CreditCard, Smartphone, Banknote, ShoppingCart, Plus, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/toast-provider'
import Loader from '@/components/seraui/Loader'
import ResponsiveModal from '@/app/(Business)/business/_components/responsive-modal'
import { Input } from '@/components/ui/input'
import PaymentCode from './paymentCode'

const PAYMENT_METHODS = [
  { id: 'TOKEN', label: 'Token Payment (uTn)', icon: CreditCard },
  { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
  { id: 'CASH', label: 'Cash on Delivery', icon: Banknote },
  { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
] as const

type PaymentMethodId = typeof PAYMENT_METHODS[number]['id']

type RwandaLocations = {
  status: string
  statusCode: number
  message: string
  data: Array<Record<string, Array<Record<string, Array<Record<string, Array<Record<string, string[]>>>>>>>> // Province>District>Sector>Cell>Villages
}

// Helpers: input formatting
const onlyDigits = (s: string) => s.replace(/\D/g, '')

const formatMomoPhone = (input: string) => {
  const digits = onlyDigits(input).slice(0, 12) // cap to 12
  // Group into 3-3-3-3 blocks visually
  return digits
    .replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,3}).*/, (_, a: string, b: string, c: string, d: string) =>
      [a, b, c, d].filter(Boolean).join(' ')
    )
}

const formatCardNumber = (input: string) => {
  const digits = onlyDigits(input).slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

const formatExpiry = (input: string) => {
  const digits = onlyDigits(input).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const formatCvv = (input: string) => onlyDigits(input).slice(0, 4)

// LocalStorage keys
const LS_KEYS = {
  country: 'checkoutCountry',
  province: 'checkoutProvince',
  district: 'checkoutDistrict',
  sector: 'checkoutSector',
  cell: 'checkoutCell',
  village: 'checkoutVillage',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { showToast } = useToast()
  const { user, role, id: userId, loading: userLoading } = useMe()

  const [country, setCountry] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | ''>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({
    country: '',
    mobileMoneyProvider: '',
    paymentTransactionId: '',
    mobileMoneyPhone: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '', // MM/YY
    cardCvv: '',
  })

  // Rwanda location selections
  const [rwanda, setRwanda] = useState<RwandaLocations | null>(null)
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [sector, setSector] = useState('')
  const [cell, setCell] = useState('')
  const [village, setVillage] = useState('')

  const [createOrder] = useMutation(CREATE_ORDER)

  // Restore saved country/locations
  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem(LS_KEYS.country) || ''
      const savedProvince = localStorage.getItem(LS_KEYS.province) || ''
      const savedDistrict = localStorage.getItem(LS_KEYS.district) || ''
      const savedSector = localStorage.getItem(LS_KEYS.sector) || ''
      const savedCell = localStorage.getItem(LS_KEYS.cell) || ''
      const savedVillage = localStorage.getItem(LS_KEYS.village) || ''

      if (savedCountry) setCountry(savedCountry)
      if (savedProvince) setProvince(savedProvince)
      if (savedDistrict) setDistrict(savedDistrict)
      if (savedSector) setSector(savedSector)
      if (savedCell) setCell(savedCell)
      if (savedVillage) setVillage(savedVillage)
    } catch { /* ignore */ }
  }, [])

  // Persist country/locations
  useEffect(() => {
    try { localStorage.setItem(LS_KEYS.country, country) } catch { }
  }, [country])
  useEffect(() => { try { localStorage.setItem(LS_KEYS.province, province) } catch { } }, [province])
  useEffect(() => { try { localStorage.setItem(LS_KEYS.district, district) } catch { } }, [district])
  useEffect(() => { try { localStorage.setItem(LS_KEYS.sector, sector) } catch { } }, [sector])
  useEffect(() => { try { localStorage.setItem(LS_KEYS.cell, cell) } catch { } }, [cell])
  useEffect(() => { try { localStorage.setItem(LS_KEYS.village, village) } catch { } }, [village])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/marketplace/products')
    }
  }, [items, router])

  // Load Rwanda locations on demand
  useEffect(() => {
    if (country === 'RWANDA' && !rwanda) {
      import('@/app/(browsing)/marketplace/checkout/rwandaLocations.json')
        .then((mod) => setRwanda(mod.default as unknown as RwandaLocations))
        .catch(() => showToast('error', 'Failed', 'Could not load Rwanda locations'))
    }
  }, [country, rwanda, showToast])

  // Reset Rwanda selections when country changes away from RWANDA
  useEffect(() => {
    if (country !== 'RWANDA') {
      setProvince(''); setDistrict(''); setSector(''); setCell(''); setVillage('')
      // Clear saved Rwanda selections when leaving RWANDA
      try {
        localStorage.removeItem(LS_KEYS.province)
        localStorage.removeItem(LS_KEYS.district)
        localStorage.removeItem(LS_KEYS.sector)
        localStorage.removeItem(LS_KEYS.cell)
        localStorage.removeItem(LS_KEYS.village)
      } catch { }
    }
  }, [country])

  // Reset deeper selections when parent changes
  useEffect(() => { setDistrict(''); setSector(''); setCell(''); setVillage('') }, [province])
  useEffect(() => { setSector(''); setCell(''); setVillage('') }, [district])
  useEffect(() => { setCell(''); setVillage('') }, [sector])
  useEffect(() => { setVillage('') }, [cell])

  // Calculate totals
  const subtotal = items.reduce((total, { product }) => total + product.price, 0)
  const deliveryFee = 5.0 // Fixed delivery fee
  const total = subtotal + deliveryFee

  const uTnAmount = useMemo(() => total / 10, [total]) // 1 uTn = $10

  const requiresDetails = useMemo(
    () => paymentMethod === 'MOBILE_MONEY' || paymentMethod === 'CARD',
    [paymentMethod]
  )

  const isPaymentDetailsValid = (): boolean => {
    switch (paymentMethod) {
      case 'MOBILE_MONEY': {
        const phoneDigits = onlyDigits(paymentDetails.mobileMoneyPhone)
        return (
          paymentDetails.mobileMoneyProvider.trim().length >= 2 &&
          phoneDigits.length >= 8
        )
      }
      case 'CARD': {
        const numberOnly = onlyDigits(paymentDetails.cardNumber)
        const expiryOk = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(paymentDetails.cardExpiry.trim())
        const cvvOk = /^\d{3,4}$/.test(paymentDetails.cardCvv.trim())
        return (
          paymentDetails.cardName.trim().length > 2 &&
          /^\d{12,19}$/.test(numberOnly) &&
          expiryOk &&
          cvvOk
        )
      }
      case 'TOKEN':
      case 'CASH':
        return true
      default:
        return false
    }
  }

  const openPaymentModalIfNeeded = (method: PaymentMethodId | '') => {
    if (method === 'MOBILE_MONEY' || method === 'CARD') {
      setShowPaymentModal(true)
    } else {
      setShowPaymentModal(false)
    }
  }

  const handleSelectPaymentMethod = (method: PaymentMethodId | '') => {
    setPaymentMethod(method)
    // reset previous details when method changes
    setPaymentDetails({
      mobileMoneyProvider: '',
      country: '',
      paymentTransactionId: '',
      mobileMoneyPhone: '',
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    })
    openPaymentModalIfNeeded(method)
  }

  // Rwanda options derived from data
  const provinces = useMemo(() => {
    if (!rwanda) return [] as string[]
    return rwanda.data.flatMap((p) => Object.keys(p))
  }, [rwanda])

  const districts = useMemo(() => {
    if (!rwanda || !province) return [] as string[]
    const provObj = rwanda.data.find((p) => Object.keys(p)[0] === province)
    if (!provObj) return []
    const distArr = (provObj as any)[province] as Array<Record<string, any>>
    return distArr.map((d) => Object.keys(d)[0])
  }, [rwanda, province])

  const sectors = useMemo(() => {
    if (!rwanda || !province || !district) return [] as string[]
    const provObj = rwanda.data.find((p) => Object.keys(p)[0] === province) as any
    if (!provObj) return []
    const distArr = provObj[province] as Array<Record<string, any>>
    const distObj = distArr.find((d) => Object.keys(d)[0] === district) as any
    if (!distObj) return []
    const secArr = distObj[district] as Array<Record<string, any>>
    return secArr.map((s) => Object.keys(s)[0])
  }, [rwanda, province, district])

  const cells = useMemo(() => {
    if (!rwanda || !province || !district || !sector) return [] as string[]
    const provObj = rwanda.data.find((p) => Object.keys(p)[0] === province) as any
    if (!provObj) return []
    const distArr = provObj[province] as Array<Record<string, any>>
    const distObj = distArr.find((d) => Object.keys(d)[0] === district) as any
    if (!distObj) return []
    const secArr = distObj[district] as Array<Record<string, any>>
    const secObj = secArr.find((s) => Object.keys(s)[0] === sector) as any
    if (!secObj) return []
    const cellArr = secObj[sector] as Array<Record<string, any>>
    return cellArr.map((c) => Object.keys(c)[0])
  }, [rwanda, province, district, sector])

  const villages = useMemo(() => {
    if (!rwanda || !province || !district || !sector || !cell) return [] as string[]
    const provObj = rwanda.data.find((p) => Object.keys(p)[0] === province) as any
    if (!provObj) return []
    const distArr = provObj[province] as Array<Record<string, any>>
    const distObj = distArr.find((d) => Object.keys(d)[0] === district) as any
    if (!distObj) return []
    const secArr = distObj[district] as Array<Record<string, any>>
    const secObj = secArr.find((s) => Object.keys(s)[0] === sector) as any
    if (!secObj) return []
    const cellArr = secObj[sector] as Array<Record<string, any>>
    const cellObj = cellArr.find((c) => Object.keys(c)[0] === cell) as any
    if (!cellObj) return []
    const villArr = cellObj[cell] as string[]
    return villArr
  }, [rwanda, province, district, sector, cell])

  const rwandaAddressValid = country === 'RWANDA' && province && district && sector && cell && village

  const finalDeliveryAddress = country === 'RWANDA' && rwandaAddressValid
    ? `${village}, ${cell}, ${sector}, ${district}, ${province}, Rwanda`
    : deliveryAddress.trim()

  const addressValid = country === 'RWANDA' ? rwandaAddressValid : deliveryAddress.trim().length > 0

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!country) {
      showToast('error', 'Address Required', 'Please select a delivery country')
      return
    }

    if (!addressValid) {
      showToast('error', 'Address Required', country === 'RWANDA' ? 'Please complete all Rwanda location fields' : 'Please enter a delivery address')
      return
    }

    if (!paymentMethod) {
      showToast('error', 'Payment Error', 'Please select a payment method')
      return
    }

    if (requiresDetails && !isPaymentDetailsValid()) {
      setShowPaymentModal(true)
      showToast('error', 'Payment Details', 'Please complete valid payment details')
      return
    }

    if (!userId) {
      showToast('error', 'Redirecting', 'User not authenticated')
      return
    }

    setIsProcessing(true)

    try {
      const orderProducts = items.map(({ product }) => ({
        productId: product.id,
        quantity: 1, // If quantity support is added to cart, replace this accordingly
      }))

      // Encode minimal reference for payment (optional)
      let qrCode: string | undefined
      if (paymentMethod === 'TOKEN') {
        qrCode = `uTn:${uTnAmount.toFixed(2)}`
      } else if (paymentMethod === 'MOBILE_MONEY') {
        const phoneDigits = onlyDigits(paymentDetails.mobileMoneyPhone)
        qrCode = `MOMO:${paymentDetails.mobileMoneyProvider.trim()}:${phoneDigits}`
      } else if (paymentMethod === 'CARD') {
        const last4 = onlyDigits(paymentDetails.cardNumber).slice(-4)
        qrCode = `CARD:****${last4}`
      }

      const { data } = await createOrder({
        variables: {
          input: {
            clientId: userId,
            deliveryFee,
            deliveryAddress: finalDeliveryAddress,
            qrCode,
            orderProducts,
            payment: {
              method: paymentMethod,
              status: 'PENDING',
              amount: total,
            },
          },
        },
      })

      showToast('success', 'Success', 'Order created successfully!', true, 5000)

      // Redirect to order confirmation or order details
      router.push(`/marketplace/orders/${data.createOrder.id}`)
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log('Order creation error:', error)
      showToast('error', 'Error', error.message || 'Failed to create order')
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
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="border border-border rounded-lg bg-card h-[600px] flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="bg-muted/50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">You Can't Buy Yet, You Need An Account</h2>
            <p className="text-muted-foreground mb-6">
              2 minutes processing, get an client account to begin processing transactions
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-primary hover:bg-accent text-primary-foreground"
            >
              <Plus className="h-5 w-5 mr-2" />
              Go To Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!userLoading && (user && role === 'business')) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="border border-border rounded-lg bg-card h-[600px] flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="bg-muted/50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">You Can't Buy Your Own Products</h2>
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
      </div>
    )
  }

  const detailsProvided = requiresDetails && isPaymentDetailsValid()

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
                <div className="space-y-4">
                  {/* Country */}
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <select
                      id="country"
                      className="w-full mt-1 p-2 border border-border rounded-md"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="DRC">DRC</option>
                      <option value="KENYA">Kenya</option>
                      <option value="UGANDA">Uganda</option>
                      <option value="RWANDA">Rwanda</option>
                      <option value="BURUNDI">Burundi</option>
                      <option value="TANZANIA">Tanzania</option>
                    </select>
                  </div>

                  {/* Address for Rwanda using known locations */}
                  {country === 'RWANDA' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="province">Province *</Label>
                        <select
                          id="province"
                          className="w-full mt-1 p-2 border border-border rounded-md"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          disabled={!rwanda}
                        >
                          <option value="">Select Province</option>
                          {provinces.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="district">District *</Label>
                        <select
                          id="district"
                          className="w-full mt-1 p-2 border border-border rounded-md"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          disabled={!province}
                        >
                          <option value="">Select District</option>
                          {districts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="sector">Sector *</Label>
                        <select
                          id="sector"
                          className="w-full mt-1 p-2 border border-border rounded-md"
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          disabled={!district}
                        >
                          <option value="">Select Sector</option>
                          {sectors.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="cell">Cell *</Label>
                        <select
                          id="cell"
                          className="w-full mt-1 p-2 border border-border rounded-md"
                          value={cell}
                          onChange={(e) => setCell(e.target.value)}
                          disabled={!sector}
                        >
                          <option value="">Select Cell</option>
                          {cells.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="village">Village *</Label>
                        <select
                          id="village"
                          className="w-full mt-1 p-2 border border-border rounded-md"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          disabled={!cell}
                        >
                          <option value="">Select Village</option>
                          {villages.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Payment Method</CardTitle>
                {paymentMethod === 'TOKEN' && (
                  <span className="text-xs text-muted-foreground">
                    1 uTn = $10 — You will pay <strong>{uTnAmount.toFixed(2)} uTn</strong>
                  </span>
                )}
                {detailsProvided && (
                  <span className="inline-flex items-center text-green-700 bg-green-50 border border-green-200 text-xs font-medium px-2 py-1 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Details provided
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(v) => handleSelectPaymentMethod(v as PaymentMethodId)}>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon
                        return (
                          <div key={method.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={method.id} id={method.id} />
                              <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer">
                                <Icon className="h-5 w-5 text-gray-600" />
                                <span>{method.label}</span>
                              </Label>
                            </div>
                            {['MOBILE_MONEY', 'CARD'].includes(method.id) && paymentMethod === method.id && (
                              <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(true)}>
                                {detailsProvided ? 'Edit details' : 'Enter details'}
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </RadioGroup>
                </div>
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
              disabled={
                isProcessing ||
                !country ||
                !addressValid ||
                !paymentMethod ||
                (requiresDetails && !isPaymentDetailsValid())
              }
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

      {/* Payment Details Modal */}
      <ResponsiveModal
        isOpen={showPaymentModal}
        setIsOpen={setShowPaymentModal}
        title="Enter Payment Details"
        description={paymentMethod ? `Provide details for ${paymentMethod.replace('_', ' ').toLowerCase()}` : undefined}
        size="md"
      >
        <div className="space-y-4">
          {/* {paymentMethod === 'MOBILE_MONEY' && (
            <>
              
            </>
          )} */}
          {paymentMethod === 'MOBILE_MONEY' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Mobile Money Provider</label>
                <select
                  className="w-full mt-1 p-2 border border-border rounded-md"
                  value={paymentDetails.mobileMoneyProvider || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileMoneyProvider: e.target.value })}
                >
                  <option value="">Select Provider</option>
                  <option value="MTN_MONEY">MTN Money</option>
                  <option value="AIRTEL_MONEY">Airtel Money</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="MPESA">M-Pesa</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <select
                  className="w-full mt-1 p-2 border border-border rounded-md"
                  value={paymentDetails.country || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, country: e.target.value })}
                >
                  <option value="">Select Country</option>
                  <option value="DRC">DRC</option>
                  <option value="KENYA">Kenya</option>
                  <option value="UGANDA">Uganda</option>
                  <option value="RWANDA">Rwanda</option>
                  <option value="BURUNDI">Burundi</option>
                  <option value="TANZANIA">Tanzania</option>
                </select>
              </div>
              {paymentDetails.mobileMoneyProvider && paymentDetails.country && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-2">Payment Code:</p>
                  <code className="text-lg font-mono bg-background p-2 rounded border">
                    {paymentDetails.country ? (
                      <>
                        <PaymentCode
                          productOwnerCodes={{ MTN_MOMO: '234576', AIRTEL_MONEY: '234577', ORANGE_MONEY: '234578', M_PESA: '234579' }}
                          country={paymentDetails.country}
                          provider={paymentDetails.mobileMoneyProvider}
                          amount={total.toFixed(0)} />
                        <div className="space-y-2">
                          <Label htmlFor="momoProvider">Provider</Label>
                          <input
                            id="momoProvider"
                            value={paymentDetails.mobileMoneyProvider}
                            onChange={(e) => setPaymentDetails((s) => ({ ...s, mobileMoneyProvider: e.target.value }))}
                            placeholder="e.g. MTN, Airtel"
                            className="w-full p-2 border border-border rounded-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="momoPhone">Phone number</Label>
                          <input
                            id="momoPhone"
                            value={paymentDetails.mobileMoneyPhone}
                            onChange={(e) => setPaymentDetails((s) => ({ ...s, mobileMoneyPhone: formatMomoPhone(e.target.value) }))}
                            placeholder="e.g. 078 123 4567"
                            inputMode="numeric"
                            className="w-full p-2 border border-border rounded-md" />
                        </div>
                      </>
                    ) : (
                      <span>{'We Generating code...'}</span>
                    )}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Dial this code on your mobile phone to complete payment
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Transaction ID (Optional)</label>
                <Input
                  placeholder="Enter operator transaction ID"
                  value={paymentDetails.paymentTransactionId || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentTransactionId: e.target.value })}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on card</Label>
                <input
                  id="cardName"
                  value={paymentDetails.cardName}
                  onChange={(e) => setPaymentDetails((s) => ({ ...s, cardName: e.target.value }))}
                  placeholder="Full name"
                  className="w-full p-2 border border-border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card number</Label>
                <input
                  id="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails((s) => ({ ...s, cardNumber: formatCardNumber(e.target.value) }))}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  className="w-full p-2 border border-border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry (MM/YY)</Label>
                  <input
                    id="cardExpiry"
                    value={paymentDetails.cardExpiry}
                    onChange={(e) => setPaymentDetails((s) => ({ ...s, cardExpiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    className="w-full p-2 border border-border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvv">CVV</Label>
                  <input
                    id="cardCvv"
                    value={paymentDetails.cardCvv}
                    onChange={(e) => setPaymentDetails((s) => ({ ...s, cardCvv: formatCvv(e.target.value) }))}
                    placeholder="123"
                    inputMode="numeric"
                    className="w-full p-2 border border-border rounded-md"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!isPaymentDetailsValid()) return
                setShowPaymentModal(false)
              }}
              disabled={!isPaymentDetailsValid()}
            >
              Save details
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  )
}
