// Admin Types
export interface Admin {
  id: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  isActive: boolean;
}

export interface LoginResponse {
  admin: Admin;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  isBlocked: boolean;
  occasionsCount?: number;
  paymentsCount?: number;
  createdAt: string;
}

// Occasion Types
export interface Occasion {
  id: string;
  occasionName: string;
  occasionType: string;
  userId: string;
  userName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OccasionDetails {
  id: string;
  occasionName: string;
  occasionType: string;
  giftPrice: number;
  isCompleted: boolean;
  completionDate: string | null;
  totalPaid: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  giftName?: string;
  giftDescription?: string;
  giftImages?: string[];
  giftLink?: string;
}

export interface OccasionPayment {
  id: string;
  paymentAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId: string;
  payerName: string;
  personName: string;
  personEmail: string;
  personPhone: string;
  paymentDate: string;
  remainingPrice: number;
  createdAt: string;
}

export interface OccasionPaymentsSummary {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  remainingAmount: number;
  completionPercentage: string;
}

export interface OccasionPaymentsResponse {
  occasion: OccasionDetails;
  payments: OccasionPayment[];
  summary: OccasionPaymentsSummary;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  occasionId?: string;
  createdAt: string;
}

export interface PaymentStats {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalPayments: number;
  averagePayment: number;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  maxUsage: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

// Banner Types
export interface Banner {
  id: string;
  title: string;
  bannerName: string;
  icon?: string;
  buttonText?: string;
  imageUrl: string;
  actionUrl?: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
}

// Region & City & Quarter Types
export interface Region {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  currency: string;
  phonePrefix: string;
  isActive: boolean;
  isOperational: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  cities?: City[];
}

export interface CreateRegionData {
  code: string;
  nameAr: string;
  nameEn: string;
  currency?: string;
  phonePrefix: string;
  isActive?: boolean;
  isOperational?: boolean;
  sortOrder?: number;
}

export interface UpdateRegionData {
  code?: string;
  nameAr?: string;
  nameEn?: string;
  currency?: string;
  phonePrefix?: string;
  isActive?: boolean;
  isOperational?: boolean;
  sortOrder?: number;
}

export interface City {
  id: string;
  nameAr: string;
  nameEn: string;
  regionId: string;
  isActive: boolean;
  isOperational: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  region?: Region;
  quarters?: Quarter[];
}

export interface CreateCityData {
  nameAr: string;
  nameEn: string;
  regionId: string;
  isActive?: boolean;
  isOperational?: boolean;
  sortOrder?: number;
}

export interface UpdateCityData {
  nameAr?: string;
  nameEn?: string;
  regionId?: string;
  isActive?: boolean;
  isOperational?: boolean;
  sortOrder?: number;
}

export interface Quarter {
  id: string;
  name: string;
  cityId: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Partner Types
export interface DeliveryPartner {
  id: string;
  partnerId: string;
  name: string;
  email: string;
  phone: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  vehicleInfo: {
    color: string;
    year: number;
    insurance: string;
  };
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  isOnline: boolean;
  isAdmin: boolean;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    timestamp?: string;
  };
  deliveryZones: string[];
  lastOnlineAt?: string;
  createdAt: string;
  updatedAt: string;
  deliveryRecords?: Array<{
    id: string;
    status: string;
    deliveryDate: string;
    deliveryAddress?: string;
    recipientName?: string;
    occasion?: {
      id: string;
      occasionName: string;
      occasionType: string;
      giftPrice: number;
    };
  }>;
}

export interface DeliveryPartnerCreate {
  partnerId: string;
  name: string;
  email: string;
  phone: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  vehicleInfo: {
    color: string;
    year: number;
    insurance: string;
  };
  rating?: number;
  totalDeliveries?: number;
  isActive?: boolean;
  isOnline?: boolean;
  isAdmin?: boolean;
  status?: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryZones: string[];
}

export interface DeliveryPartnerUpdate {
  name?: string;
  email?: string;
  phone?: string;
  vehicleModel?: string;
  vehiclePlateNumber?: string;
  vehicleInfo?: {
    color?: string;
    year?: number;
    insurance?: string;
  };
  rating?: number;
  status?: 'available' | 'busy' | 'offline';
  deliveryZones?: string[];
}

export interface DeliveryPartnerStatistics {
  totalPartners: number;
  activePartners: number;
  onlinePartners: number;
  totalDeliveries: number;
  averageRating: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

export interface DeliveryPartnerResponse {
  deliveryPartners: DeliveryPartner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Withdrawal Types
export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  accountNumber: string;
  iban: string;
  paymentAccount: string;
  paymentDescription?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  processedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

// Analytics Types
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    recent: number;
  };
  occasions: {
    total: number;
  };
  payments: {
    total: number;
    totalAmount: number;
  };
  promoCodes: {
    total: number;
    active: number;
  };
  banners: {
    total: number;
    active: number;
  };
  withdrawals: {
    pending: number;
    approved: number;
    totalAmount: number;
  };
  deliveryPartners: {
    total: number;
    active: number;
    online: number;
  };
}

export interface RecentActivity {
  user: string;
  type: string;
  amount: string;
  date: string;
}

export interface RevenueAnalytics {
  total: number;
  byMonth: number[];
  byCategory: Record<string, number>;
  growth: string;
}

// Tax Types
export interface TaxConfig {
  serviceTax: string;
  deliveryTax: string;
  packagingTax: string[];
}

export interface Tax {
  id: string;
  name: string;
  category: 'service' | 'delivery' | 'custom';
  type: 'percent' | 'amount';
  amount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TaxStatistics {
  total: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
}

// Packaging Types
export interface PackagingType {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  images: string[];
  amount: number;
  giftType: 'money' | 'gift';
  packagingProvider: 'hadawi' | 'brand';
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PackagingFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  images: string[];
  amount: number;
  giftType: 'money' | 'gift';
  packagingProvider: 'hadawi' | 'brand';
  status: 'active' | 'inactive' | 'archived';
}

export interface PackagingStatistics {
  total: number;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  totalAmount: number;
}

// Notification Types
export interface BulkNotification {
  title: string;
  body: string;
  userIds: string[] | 'all';
  data?: Record<string, any>;
}

// Notification Template Types
export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  trigger: NotificationTrigger;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
  isDefault: boolean;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export type NotificationTrigger =
  | 'payment_received'
  | 'occasion_completed'
  | 'occasion_created'
  | 'payment_reminder';

export interface NotificationTemplateCreate {
  name: string;
  description: string;
  trigger: NotificationTrigger;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
  isDefault?: boolean;
  status?: 'active' | 'inactive' | 'draft';
}

export interface NotificationTemplateUpdate {
  name?: string;
  description?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  data?: Record<string, any>;
  isDefault?: boolean;
  status?: 'active' | 'inactive' | 'draft';
}

// Notification Sending Types
export interface NotificationSend {
  userIds: string[];
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
  scheduledAt?: string;
}

export interface NotificationTriggerRequest {
  userIds: string[];
  variables: Record<string, string>;
}

// Notification Analytics Types
export interface NotificationStats {
  totalTemplates: number;
  activeTemplates: number;
  defaultTemplates: number;
  triggers: Record<NotificationTrigger, number>;
}

export interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  userIds: string[];
  sentAt: string;
  status: 'sent' | 'failed' | 'pending' | 'cancelled';
  templateId?: string;
  scheduledAt?: string;
}

// Template Variables
export interface TemplateVariables {
  payment_received: {
    occasionName: string;
    amount: string;
    payerName: string;
    occasionId: string;
    occasionType: string;
  };
  occasion_completed: {
    occasionName: string;
    totalAmount: string;
    occasionId: string;
    completionDate: string;
  };
  occasion_created: {
    occasionName: string;
    occasionType: string;
    occasionId: string;
    creatorName: string;
  };
  payment_reminder: {
    occasionName: string;
    remainingAmount: string;
    occasionId: string;
    daysLeft: string;
  };
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

// Cloudinary Types
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
  original_extension: string;
  api_key: string;
}

export interface CloudinaryUploadError {
  error: {
    message: string;
    http_code: number;
  };
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  tags?: string[];
  context?: Record<string, string>;
}

export interface CloudinaryUploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  transformation: {
    width: number;
    height: number;
    crop: string;
    quality: string;
    fetch_format?: string;
  };
}

export interface CloudinaryUploadSignatureRequest {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  };
}

// Delivery Record Types
export interface DeliveryRecord {
  id: string;
  occasionId: string;
  deliveryPartnerId: string;
  giftImages: string[];
  receiptImages: string[];
  deliveryDate: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  notes?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  occasion?: {
    id: string;
    occasionName: string;
    occasionType: string;
    giftPrice: number;
  };
  deliveryPartner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface DeliveryRecordCreate {
  occasionId: string;
  deliveryPartnerId: string;
  deliveryDate: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  notes?: string;
  status?: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
}

export interface DeliveryRecordUpdate {
  deliveryPartnerId?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  status?: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
}

export interface DeliveryStatistics {
  total: number;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  recentDeliveries: number;
}

export interface DeliveryImageUploadResponse {
  message: string;
  deliveryRecord: {
    id: string;
    giftImages?: string[];
    receiptImages?: string[];
  };
  uploadedFiles: string[];
}

// SMS Balance Types
export interface SmsBalance {
  credits: number;
}


// Company Types
export interface Company {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Offer Types
export interface Offer {
  id: string;
  title: string;
  description?: string;
  discount: string;
  companyId: string;
  company?: Company;
  imageUrl?: string;
  promoCode?: string;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Catalog Types

// Occasion and Recipient Type Constants
export const OCCASION_TYPES = [
  'birthday',
  'wedding',
  'anniversary',
  'graduation',
  'new_baby',
  'congratulations',
  'get_well_soon',
  'thank_you',
  'love',
  'sympathy',
  'housewarming',
  'retirement',
] as const;

export const RECIPIENT_TYPES = [
  'father',
  'mother',
  'husband',
  'wife',
  'son',
  'daughter',
  'brother',
  'sister',
  'grandfather',
  'grandmother',
  'friend',
  'colleague',
  'boss',
  'teacher',
] as const;

export interface OccasionType {
  id: string;
  key: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OccasionTypeFormData {
  key: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isActive: boolean;
}

// Product Category Types
export interface ProductCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  products?: Product[];
  parent?: ProductCategory;
  children?: ProductCategory[];
  _count?: {
    products: number;
  };
}

export interface CategoryFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CategoryTree extends ProductCategory {
  children: CategoryTree[];
  level: number;
}

// Brand Types
export interface Brand {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  products?: Product[];
  _count?: {
    products: number;
  };
}

export interface BrandFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
}

// Product Types
export interface ProductCity {
  id: string;
  productId: string;
  cityId: string;
  city: City;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  images: string[];
  categoryId?: string;
  brandId?: string;
  occasionTypes: string[];
  recipientTypes: string[];
  isActive: boolean;
  isFeatured: boolean;
  isAdditionalGift: boolean;
  stock: number;
  sku?: string;
  tags: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;

  // Relations
  category?: ProductCategory;
  brand?: Brand;
  cities?: ProductCity[];
}

export interface ProductFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  images: string[];
  categoryId?: string;
  brandId?: string;
  occasionTypes: string[];
  recipientTypes: string[];
  isActive: boolean;
  isFeatured: boolean;
  isAdditionalGift: boolean;
  stock: number;
  sku?: string;
  tags: string[];
  metadata?: any;
  cityIds?: string[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  occasionType?: string;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isAdditionalGift?: boolean;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
