export interface Healthcheck {
  status: 'ok';
  service: string;
  version: string;
  timestamp: string;
}

export const healthcheck: Omit<Healthcheck, 'timestamp'> = {
  status: 'ok',
  service: 'testforge-api',
  version: '0.1.0',
};

export const userRoles = ['ADMIN', 'OPERATOR'] as const;
export const userStatuses = ['ACTIVE', 'INVITED', 'DISABLED'] as const;
export const productStatuses = ['DRAFT', 'READY', 'ARCHIVED'] as const;

export type UserRole = (typeof userRoles)[number];
export type UserStatus = (typeof userStatuses)[number];
export type ProductStatus = (typeof productStatuses)[number];

export interface AuthPermissionMap {
  canAccessAdminArea: boolean;
  canAccessOperatorArea: boolean;
  canManageProducts: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: AuthPermissionMap;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthSessionResponse extends AuthTokens {
  user: AuthUser;
}

export interface AuthMessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string | string[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
}

export interface UpdateUserRequest {
  role?: UserRole;
  status?: UserStatus;
}

export interface ProductOption {
  id: string;
  name: string;
}

export interface ProductTag {
  id: string;
  name: string;
  color: string | null;
}

export interface ProductValidationResponse {
  available: boolean;
  reason: string | null;
}

export interface ProductSearchOption {
  id: string;
  sku: string;
  name: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  price: string;
  promotionalPrice: string | null;
  promotionEndsAt: string | null;
  cost: string;
  stockQuantity: number;
  category: ProductOption;
  supplier: ProductOption;
  status: ProductStatus;
  isActive: boolean;
  deactivationReason: string | null;
  weight: string;
  width: string;
  height: string;
  length: string;
  tags: ProductTag[];
  barcode: string | null;
  expirationDate: string | null;
  featureBullets: string[];
  relatedSkus: string[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  lastUpdatedBy: {
    id: string;
    name: string;
  };
}

export interface ProductMetadata {
  categories: ProductOption[];
  suppliers: ProductOption[];
  tags: ProductTag[];
  statuses: ProductStatus[];
  recommendedSuppliersByCategory: Array<{
    categoryId: string;
    suppliers: ProductOption[];
  }>;
}

export interface ProductFormPayload {
  name: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  price: string;
  promotionalPrice?: string;
  promotionEndsAt?: string;
  cost: string;
  stockQuantity: number;
  categoryId: string;
  supplierId: string;
  status: ProductStatus;
  isActive: boolean;
  deactivationReason?: string;
  weight: string;
  width: string;
  height: string;
  length: string;
  tagIds?: string[];
  barcode?: string;
  expirationDate?: string;
  featureBullets: string[];
  relatedSkus: string[];
}

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProductStatus | '';
  isActive?: '' | 'true' | 'false';
  categoryId?: string;
  supplierId?: string;
  tagIds?: string[];
  sortBy?: 'name' | 'price' | 'stockQuantity' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  simulateError?: '' | '400' | '401' | '403' | '404' | '409' | '500';
}
