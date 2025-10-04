import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Admin,
  LoginResponse,
  User,
  Occasion,
  OccasionDetails,
  OccasionPayment,
  OccasionPaymentsResponse,
  Payment,
  PaymentStats,
  PromoCode,
  Banner,
  City,
  Quarter,
  DeliveryPartner,
  DeliveryPartnerCreate,
  DeliveryPartnerUpdate,
  DeliveryPartnerStatistics,
  DeliveryPartnerResponse,
  DeliveryRecord,
  DeliveryRecordCreate,
  DeliveryRecordUpdate,
  DeliveryStatistics,
  DeliveryImageUploadResponse,
  WithdrawalRequest,
  DashboardStats,
  RevenueAnalytics,
  TaxConfig,
  Tax,
  TaxStatistics,
  PackagingType,
  PackagingStatistics,
  BulkNotification,
  PaginationParams,
  PaginationResponse,
  ApiResponse,
  CloudinaryUploadSignature,
  CloudinaryUploadSignatureRequest,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AdminService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            await this.refreshToken();
            return this.api.request(error.config!);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTH ====================

  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await this.api.post<LoginResponse>('/auth/admin/login', {
      email,
      password,
    });
    
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_refresh_token', data.refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
    
    return data;
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    const { data } = await this.api.post<LoginResponse>('/auth/refresh-token', {
      refreshToken,
    });
    
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_refresh_token', data.refreshToken);
    
    return data;
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  }

  getCurrentAdmin(): Admin | null {
    const admin = localStorage.getItem('admin_user');
    return admin ? JSON.parse(admin) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  // ==================== USERS ====================

  async getUsers(params: PaginationParams = {}): Promise<User[]> {
    const { data } = await this.api.get<User[]>('/users', { params });
    return data;
  }

  async getUser(userId: string): Promise<User> {
    const { data } = await this.api.get<User>(`/users/${userId}`);
    return data;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const { data } = await this.api.put<User>(`/users/${userId}`, userData);
    return data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<User> {
    const { data } = await this.api.put<User>(`/users/${userId}/block`, {
      isBlocked,
    });
    return data;
  }

  // ==================== OCCASIONS ====================

  async getOccasions(params: PaginationParams = {}): Promise<Occasion[]> {
    const { data } = await this.api.get<Occasion[]>('/occasions', { params });
    return data;
  }

  async getOccasion(occasionId: string): Promise<Occasion> {
    const { data } = await this.api.get<Occasion>(`/occasions/${occasionId}`);
    return data;
  }

  async updateOccasion(occasionId: string, occasionData: Partial<Occasion>): Promise<Occasion> {
    const { data } = await this.api.put<Occasion>(`/occasions/${occasionId}`, occasionData);
    return data;
  }

  async deleteOccasion(occasionId: string): Promise<void> {
    await this.api.delete(`/occasions/${occasionId}`);
  }

  async getOccasionPayments(occasionId: string): Promise<OccasionPaymentsResponse> {
    const { data } = await this.api.get<OccasionPaymentsResponse>(`/payments/occasion/${occasionId}`);
    return data;
  }

  // ==================== PAYMENTS ====================

  async getPayments(params: PaginationParams = {}): Promise<Payment[]> {
    const { data } = await this.api.get<Payment[]>('/payments', { params });
    return data;
  }

  async getPaymentStats(): Promise<PaymentStats> {
    const { data } = await this.api.get<PaymentStats>('/payments/stats');
    return data;
  }

  async processRefund(paymentId: string, refundData: { amount: number; reason: string }): Promise<Payment> {
    const { data } = await this.api.post<Payment>(`/payments/${paymentId}/refund`, refundData);
    return data;
  }

  // ==================== PROMO CODES ====================

  async getPromoCodes(params: PaginationParams = {}): Promise<PromoCode[]> {
    const { data } = await this.api.get<PromoCode[]>('/promo-codes', { params });
    return data;
  }

  async createPromoCode(promoData: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'>): Promise<PromoCode> {
    const { data } = await this.api.post<PromoCode>('/promo-codes', promoData);
    return data;
  }

  async updatePromoCode(promoId: string, promoData: Partial<PromoCode>): Promise<PromoCode> {
    const { data } = await this.api.put<PromoCode>(`/promo-codes/${promoId}`, promoData);
    return data;
  }

  async deletePromoCode(promoId: string): Promise<void> {
    await this.api.delete(`/promo-codes/${promoId}`);
  }

  // ==================== BANNERS ====================

  async getBanners(): Promise<Banner[]> {
    const { data } = await this.api.get<Banner[]>('/banners');
    return data;
  }

  async createBanner(bannerData: Omit<Banner, 'id' | 'createdAt'>): Promise<Banner> {
    const { data } = await this.api.post<Banner>('/banners', bannerData);
    return data;
  }

  async updateBanner(bannerId: string, bannerData: Partial<Banner>): Promise<Banner> {
    const { data } = await this.api.put<Banner>(`/banners/${bannerId}`, bannerData);
    return data;
  }

  async deleteBanner(bannerId: string): Promise<void> {
    await this.api.delete(`/banners/${bannerId}`);
  }

  // ==================== CITIES & QUARTERS ====================

  async getCities(): Promise<City[]> {
    const { data } = await this.api.get<City[]>('/cities');
    return data;
  }

  async createCity(cityData: { name: string }): Promise<City> {
    const { data } = await this.api.post<City>('/cities', cityData);
    return data;
  }

  async getQuarters(cityId: string): Promise<Quarter[]> {
    const { data } = await this.api.get<Quarter[]>(`/cities/${cityId}/quarters`);
    return data;
  }

  async createQuarter(cityId: string, quarterData: { name: string }): Promise<Quarter> {
    const { data } = await this.api.post<Quarter>(`/cities/${cityId}/quarters`, quarterData);
    return data;
  }

  // ==================== DELIVERY PARTNERS ====================

  async getDeliveryPartners(params: PaginationParams = {}): Promise<DeliveryPartnerResponse> {
    const { data } = await this.api.get<DeliveryPartnerResponse>('/delivery-partners', { params });
    return data;
  }

  async getDeliveryPartner(id: string): Promise<DeliveryPartner> {
    const { data } = await this.api.get<DeliveryPartner>(`/delivery-partners/${id}`);
    return data;
  }

  async createDeliveryPartner(partnerData: DeliveryPartnerCreate): Promise<DeliveryPartner> {
    const { data } = await this.api.post<DeliveryPartner>('/delivery-partners', partnerData);
    return data;
  }

  async updateDeliveryPartner(id: string, partnerData: DeliveryPartnerUpdate): Promise<DeliveryPartner> {
    const { data } = await this.api.patch<DeliveryPartner>(`/delivery-partners/${id}`, partnerData);
    return data;
  }

  async toggleDeliveryPartnerActive(id: string): Promise<DeliveryPartner> {
    const { data } = await this.api.patch<DeliveryPartner>(`/delivery-partners/${id}/toggle-active`);
    return data;
  }

  async updateDeliveryPartnerOnlineStatus(id: string, isOnline: boolean): Promise<DeliveryPartner> {
    const { data } = await this.api.patch<DeliveryPartner>(`/delivery-partners/${id}/online-status`, { isOnline });
    return data;
  }

  async updateDeliveryPartnerLocation(id: string, location: { lat: number; lng: number; address: string; timestamp?: string }): Promise<DeliveryPartner> {
    const { data } = await this.api.patch<DeliveryPartner>(`/delivery-partners/${id}/location`, { location });
    return data;
  }

  async getDeliveryPartnerStatistics(): Promise<DeliveryPartnerStatistics> {
    const { data } = await this.api.get<DeliveryPartnerStatistics>('/delivery-partners/statistics');
    return data;
  }

  async getDeliveryPartnersByZone(zone: string): Promise<DeliveryPartner[]> {
    const { data } = await this.api.get<DeliveryPartner[]>(`/delivery-partners/zone/${encodeURIComponent(zone)}`);
    return data;
  }

  async deleteDeliveryPartner(id: string): Promise<void> {
    await this.api.delete(`/delivery-partners/${id}`);
  }

  // ==================== ANALYTICS ====================

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await this.api.get<DashboardStats>('/analytics/dashboard');
    return data;
  }

  async getRevenueAnalytics(params: PaginationParams = {}): Promise<RevenueAnalytics> {
    const { data } = await this.api.get<RevenueAnalytics>('/analytics/revenue', { params });
    return data;
  }

  // ==================== BALANCE/WITHDRAWALS ====================

  async getWithdrawalRequests(params: PaginationParams = {}): Promise<WithdrawalRequest[]> {
    const { data } = await this.api.get<WithdrawalRequest[]>('/balances', { params });
    return data;
  }

  async approveWithdrawal(balanceId: string, approvalData: { approvedBy: string; processedAt: string }): Promise<WithdrawalRequest> {
    const { data } = await this.api.put<WithdrawalRequest>(`/balances/${balanceId}/approve`, approvalData);
    return data;
  }

  async rejectWithdrawal(balanceId: string, reason: string): Promise<WithdrawalRequest> {
    const { data } = await this.api.put<WithdrawalRequest>(`/balances/${balanceId}/reject`, { reason });
    return data;
  }

  // ==================== TAX CONFIGURATION ====================

  async getTaxConfig(): Promise<TaxConfig> {
    const { data } = await this.api.get<TaxConfig>('/taxes');
    return data;
  }

  async updateTaxConfig(taxData: TaxConfig): Promise<TaxConfig> {
    const { data } = await this.api.put<TaxConfig>('/taxes', taxData);
    return data;
  }

  // ==================== NOTIFICATIONS ====================

  async sendBulkNotification(notificationData: BulkNotification): Promise<void> {
    await this.api.post('/notifications/send-bulk', notificationData);
  }

  // ==================== OCCASION TYPES ====================

  async getOccasionTypes(): Promise<any[]> {
    const { data } = await this.api.get<any[]>('/occasion-types');
    return data;
  }

  async getActiveOccasionTypes(): Promise<any[]> {
    const { data } = await this.api.get<any[]>('/occasion-types/active');
    return data;
  }

  async getOccasionType(id: string): Promise<any> {
    const { data } = await this.api.get<any>(`/occasion-types/${id}`);
    return data;
  }

  async getOccasionTypeByKey(key: string): Promise<any> {
    const { data } = await this.api.get<any>(`/occasion-types/key/${key}`);
    return data;
  }

  async createOccasionType(typeData: any): Promise<any> {
    const { data } = await this.api.post<any>('/occasion-types', typeData);
    return data;
  }

  async updateOccasionType(id: string, typeData: any): Promise<any> {
    const { data } = await this.api.patch<any>(`/occasion-types/${id}`, typeData);
    return data;
  }

  async toggleOccasionTypeActive(id: string): Promise<any> {
    const { data } = await this.api.patch<any>(`/occasion-types/${id}/toggle-active`);
    return data;
  }

  async getOccasionTypesStatistics(): Promise<any> {
    const { data } = await this.api.get<any>('/occasion-types/statistics');
    return data;
  }

  async deleteOccasionType(id: string): Promise<void> {
    await this.api.delete(`/occasion-types/${id}`);
  }

  // ==================== TAXES ====================

  async getTaxes(): Promise<Tax[]> {
    const { data } = await this.api.get<Tax[]>('/taxes');
    return data;
  }

  async getTaxesByType(type: string): Promise<Tax[]> {
    const { data } = await this.api.get<Tax[]>(`/taxes/type/${type}`);
    return data;
  }

  async getTax(id: string): Promise<Tax> {
    const { data } = await this.api.get<Tax>(`/taxes/${id}`);
    return data;
  }

  async createTax(taxData: Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tax> {
    const { data } = await this.api.post<Tax>('/taxes', taxData);
    return data;
  }

  async updateTax(id: string, taxData: Partial<Tax>): Promise<Tax> {
    const { data } = await this.api.patch<Tax>(`/taxes/${id}`, taxData);
    return data;
  }

  async deleteTax(id: string): Promise<void> {
    await this.api.delete(`/taxes/${id}`);
  }

  async getTaxStatistics(): Promise<TaxStatistics> {
    const { data } = await this.api.get<TaxStatistics>('/taxes/statistics');
    return data;
  }

  // ==================== PACKAGING TYPES ====================

  async getPackagingTypes(params: { status?: string } = {}): Promise<PackagingType[]> {
    const { data } = await this.api.get<PackagingType[]>('/packaging-types', { params });
    return data;
  }

  async getActivePackagingTypes(): Promise<PackagingType[]> {
    const { data } = await this.api.get<PackagingType[]>('/packaging-types/active');
    return data;
  }

  async searchPackagingTypes(query: string): Promise<PackagingType[]> {
    const { data } = await this.api.get<PackagingType[]>('/packaging-types/search', {
      params: { q: query }
    });
    return data;
  }

  async getPackagingTypesByStatus(status: string): Promise<PackagingType[]> {
    const { data } = await this.api.get<PackagingType[]>(`/packaging-types/status/${status}`);
    return data;
  }

  async getPackagingType(id: string): Promise<PackagingType> {
    const { data } = await this.api.get<PackagingType>(`/packaging-types/${id}`);
    return data;
  }

  async createPackagingType(packagingData: Omit<PackagingType, 'id' | 'createdAt' | 'updatedAt'>): Promise<PackagingType> {
    const { data } = await this.api.post<PackagingType>('/packaging-types', packagingData);
    return data;
  }

  async updatePackagingType(id: string, packagingData: Partial<PackagingType>): Promise<PackagingType> {
    const { data } = await this.api.patch<PackagingType>(`/packaging-types/${id}`, packagingData);
    return data;
  }

  async updatePackagingTypeStatus(id: string, status: PackagingType['status']): Promise<PackagingType> {
    const { data } = await this.api.patch<PackagingType>(`/packaging-types/${id}/status`, { status });
    return data;
  }

  async getPackagingStatistics(): Promise<PackagingStatistics> {
    const { data } = await this.api.get<PackagingStatistics>('/packaging-types/statistics');
    return data;
  }

  async deletePackagingType(id: string): Promise<void> {
    await this.api.delete(`/packaging-types/${id}`);
  }

  // ==================== DELIVERY RECORDS ====================

  async getDeliveryRecords(params: PaginationParams = {}): Promise<DeliveryRecord[]> {
    const { data } = await this.api.get<DeliveryRecord[]>('/delivery-records', { params });
    return data;
  }

  async getDeliveryRecord(id: string): Promise<DeliveryRecord> {
    const { data } = await this.api.get<DeliveryRecord>(`/delivery-records/${id}`);
    return data;
  }

  async createDeliveryRecord(deliveryData: DeliveryRecordCreate): Promise<DeliveryRecord> {
    const { data } = await this.api.post<DeliveryRecord>('/delivery-records', deliveryData);
    return data;
  }

  async updateDeliveryRecord(id: string, deliveryData: DeliveryRecordUpdate): Promise<DeliveryRecord> {
    const { data } = await this.api.patch<DeliveryRecord>(`/delivery-records/${id}`, deliveryData);
    return data;
  }

  async updateDeliveryStatus(id: string, status: string): Promise<DeliveryRecord> {
    const { data } = await this.api.patch<DeliveryRecord>(`/delivery-records/${id}/status`, { status });
    return data;
  }

  async uploadGiftImages(id: string, files: File[]): Promise<DeliveryImageUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const { data } = await this.api.post<DeliveryImageUploadResponse>(
      `/delivery-records/${id}/upload-gift-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  async uploadReceiptImages(id: string, files: File[]): Promise<DeliveryImageUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const { data } = await this.api.post<DeliveryImageUploadResponse>(
      `/delivery-records/${id}/upload-receipt-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  async getDeliveryStatistics(): Promise<DeliveryStatistics> {
    const { data } = await this.api.get<DeliveryStatistics>('/delivery-records/stats');
    return data;
  }

  async deleteDeliveryRecord(id: string): Promise<void> {
    await this.api.delete(`/delivery-records/${id}`);
  }

  // ==================== CLOUDINARY UPLOAD ====================

  async getCloudinaryUploadSignature(request: CloudinaryUploadSignatureRequest = {}): Promise<CloudinaryUploadSignature> {
    const { data } = await this.api.post<CloudinaryUploadSignature>('/cloudinary/upload-signature', request);
    return data;
  }
}

export default new AdminService();

