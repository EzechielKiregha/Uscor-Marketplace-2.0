// Enums
export enum RechargeMethod {
  MTN_MONEY = 'MTN_MONEY',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MPESA = 'MPESA',
  TOKEN = 'TOKEN'
}

export enum Country {
  DRC = 'DRC',
  KENYA = 'KENYA',
  UGANDA = 'UGANDA',
  RWANDA = 'RWANDA',
  BURUNDI = 'BURUNDI',
  TANZANIA = 'TANZANIA',
}

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum FreelanceServiceCategory {
  PLUMBER = 'PLUMBER',
  ELECTRICIAN = 'ELECTRICIAN',
  CARPENTER = 'CARPENTER',
  MECHANIC = 'MECHANIC',
  TUTOR = 'TUTOR',
  CLEANER = 'CLEANER',
  OTHER = 'OTHER'
}

export enum FreelanceStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EscrowStatus {
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
}

enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

enum PaymentMethod {
  TOKEN = 'TOKEN',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

export enum ChatStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum NegotiationType {
  REOWNERSHIP = 'REOWNERSHIP',
  FREELANCEORDER = 'FREELANCEORDER',
  PURCHASE = 'PURCHASE',
  GENERAL = 'GENERAL',
}

export enum TokenTransactionType {
  RELEASE = 'RELEASE',
  PROFIT_SHARE = 'PROFIT_SHARE',
  REPOST_COMMISSION = 'REPOST_COMMISSION',
}

export interface ClientEntity {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  address?: string;
  phone?: string;
  password: string; 
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders: OrderEntity[];
  reviews: ReviewEntity[];
  chats: ChatEntity[];
  recharges: AccountRechargeEntity[];
  freelanceOrders: FreelanceOrderEntity[];
  referralsMade: ReferralEntity[];
  referralsReceived: ReferralEntity[];
}

export interface ProductEntity {
  id: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  businessId: string;
  storeId: string;
  isPhysical: boolean;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  approvedForSale: boolean;
  medias: MediaEntity[];
  business?: BusinessEntity;
  store?: StoreEntity;
  category?: CategoryEntity;
  reviews: ReviewEntity[];
  orders: OrderProductEntity[];
  chats: ChatEntity[];
  reposts: RepostedProductEntity[];
  reowns: ReOwnedProductEntity[];
  ads: AdEntity[];
}

export interface BusinessEntity {
  id: string;
  name: string;
  email: string;
  description?: string;
  address?: string;
  phone?: string;
  avatar?: string;
  coverImage?: string;
  password: string; 
  isVerified: boolean;
  kycStatus : KycStatus;
  totalProductsSold : number;
  hasAgreedToTerms: boolean;
  isB2BEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  products: ProductEntity[];
  workers: WorkerEntity[];
  repostedItems: RepostedProductEntity[];
  reownedItems: ReOwnedProductEntity[];
  recharges: AccountRechargeEntity[];
  ads: AdEntity[];
  freelanceServices: FreelanceServiceEntity[];
  freelanceOrders: FreelanceOrderEntity[];
  referralsMade: ReferralEntity[];
  referralsReceived: ReferralEntity[];
  chats: ChatEntity[];
}

export interface WorkerEntity {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  business?: BusinessEntity;
  kyc?: KnowYourCustomerEntity;
  freelanceServices?: FreelanceServiceEntity[];
  chats: ChatEntity[];
}

export interface OrderEntity {
  id: string;
  deliveryFee: number;
  deliveryAddress?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  client: ClientEntity;
  payment?: PaymentTransactionEntity;
  products?: OrderProductEntity[];
}

export interface AccountRechargeEntity {
  id: string;
  amount: number;
  method: RechargeMethod;
  origin: Country;
  businessId?: string;
  business?: BusinessEntity;
  clientId?: string;
  client?: ClientEntity;
  tokenTransactionId?: string;
  tokenTransaction?: TokenTransactionEntity;
  createdAt: Date;
}

export interface MediaEntity {
  id: string;
  url: string;
  type: string;
  productId: string;
  createdAt: Date;
  product: ProductEntity;
}

export interface StoreEntity {
  id: string;
  businessId: string;
  business: BusinessEntity;
  name: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryEntity {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  products?: ProductEntity[];
}

export interface ReviewEntity {
  id: string;
  clientId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  client: ClientEntity;
  product: ProductEntity;
}

export interface OrderProductEntity {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  order: OrderEntity;
  product: ProductEntity;
}

export interface ChatEntity {
  id: string;
  status: ChatStatus;
  isSecure: boolean;
  negotiationType?: NegotiationType;
  productId?: string;
  product?: ProductEntity;
  serviceId?: string;
  service?: FreelanceServiceEntity;
  participants: ChatParticipantEntity[];
  messages: ChatMessageEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageEntity {
  id: string;
  chatId: string;
  message: string;
  senderId: string;
  createdAt: Date;
}

export interface ChatParticipantEntity {
  id: string;
  chatId: string;
  clientId?: string;
  client?: ClientEntity;
  businessId?: string;
  business?: BusinessEntity;
  workerId?: string;
  worker?: WorkerEntity;
  createdAt: Date;
}

export interface RepostedProductEntity {
  id: string;
  productId: string;
  product: ProductEntity;
  businessId: string;
  business: BusinessEntity;
  markupPercentage: number;
  createdAt: Date;
}

export interface ReOwnedProductEntity {
  id: string;
  newProductId: string;
  newProduct: ProductEntity;
  originalProductId: string;
  originalProduct: ProductEntity;
  oldOwnerId: string;
  newOwnerId: string;
  quantity: number;
  oldPrice: number;
  newPrice: number;
  markupPercentage: number;
  agreedViaChatId: string;
  agreementDate: Date;
  isOriginalApproved: boolean;
  isNewOwnerApproved: boolean;
  shippingId?: string;
  shipping?: ShippingEntity;
  createdAt: Date;
}

export interface ShippingEntity {
  id: string;
  reOwnedProductId: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface AdEntity {
  id: string;
  businessId: string;
  productId: string;
  price: number;
  periodDays: number;
  createdAt: Date;
  endedAt?: Date;

  business: BusinessEntity;
  product: ProductEntity;
}

export interface FreelanceServiceEntity {
  id: string;
  title: string;
  description?: string;
  isHourly: boolean;
  rate: number;
  category : FreelanceServiceCategory
  createdAt: Date;
  updatedAt: Date;
  business: BusinessEntity;
  workerServiceAssignments: WorkerServiceAssignmentEntity[];
}

export interface WorkerServiceAssignmentEntity {
  id: string;
  worker: WorkerEntity;
  role?: string;
  assignedAt: Date;
}

export interface FreelanceOrderEntity {
  id: string;
  status: FreelanceStatus;
  quantity: number;
  totalAmount: number;
  escrowAmount: number;
  commissionPercent: number;
  escrowStatus?: EscrowStatus;
  createdAt: Date;
  escrowReleasedAt: Date;
  client: ClientEntity;
  service: FreelanceServiceEntity;
  freelanceOrderBusiness: FreelanceOrderBusinessEntity[];
  payment?: PaymentTransactionEntity;
}

export interface FreelanceOrderBusinessEntity {
  id: string;
  business: BusinessEntity;
  role?: string;
  assignedAt: Date;
}

export interface ReferralEntity {
  id: string;
  affiliateBusinessId?: string;
  affiliateClientId?: string;
  referredBusinessId?: string;
  referredClientId?: string;
  verifiedPurchase: boolean;
  createdAt: Date;
  affiliateBusiness: BusinessEntity;
  affiliateClient: ClientEntity;
  referredBusiness: BusinessEntity;
  referredClient: ClientEntity;
}

export interface PaymentTransactionEntity {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionDate: Date;
  qrCode?: string;
  createdAt: Date;
  order: OrderEntity;
  PostTransaction?: PostTransactionEntity[];
}

export interface PostTransactionEntity {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
}

export interface KnowYourCustomerEntity {
  id: string;
  status: string; // KycStatus (e.g., PENDING, VERIFIED, REJECTED
  documentUrl: string;
  submittedAt: Date;
  verifiedAt?: Date;
  businessId?: string;
  clientId?: string;
  workerId?: string;
  business: BusinessEntity;
  client: ClientEntity;
  worker: WorkerEntity;
}

export interface TokenTransactionEntity {
  id: string;
  businessId: string;
  business: BusinessEntity;
  reOwnedProductId?: string;
  reOwnedProduct?: ReOwnedProductEntity;
  repostedProductId?: string;
  repostedProduct?: RepostedProductEntity;
  amount: number;
  type: TokenTransactionType;
  isRedeemed: boolean;
  isReleased: boolean;
  createdAt: Date;
}