import type {
  AuthMessageResponse,
  PaginatedResponse,
  ProductFormPayload,
  ProductListQuery,
  ProductMetadata,
  ProductOption,
  ProductRecord,
  ProductSearchOption,
  ProductValidationResponse,
} from '@testforge/shared-types';

export type AuthorizedRequest = <TResponse>(
  path: string,
  options?: RequestInit,
) => Promise<TResponse>;

function buildProductQuery(query: ProductListQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
      return;
    }

    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function listProducts(fetchWithAuth: AuthorizedRequest, query: ProductListQuery) {
  return fetchWithAuth<PaginatedResponse<ProductRecord>>(`/products${buildProductQuery(query)}`);
}

export function getProduct(
  fetchWithAuth: AuthorizedRequest,
  productId: string,
  simulateError?: string,
) {
  const queryString = simulateError ? `?simulateError=${simulateError}` : '';
  return fetchWithAuth<ProductRecord>(`/products/${productId}${queryString}`);
}

export function getProductMetadata(fetchWithAuth: AuthorizedRequest, simulateError?: string) {
  const queryString = simulateError ? `?simulateError=${simulateError}` : '';
  return fetchWithAuth<ProductMetadata>(`/products/metadata${queryString}`);
}

export function getSuppliersForCategory(fetchWithAuth: AuthorizedRequest, categoryId?: string) {
  const queryString = categoryId ? `?categoryId=${categoryId}` : '';
  return fetchWithAuth<ProductOption[]>(`/products/metadata/suppliers${queryString}`);
}

export function validateSkuAvailability(
  fetchWithAuth: AuthorizedRequest,
  value: string,
  excludeId?: string,
  simulateError?: string,
) {
  const params = new URLSearchParams({ value });
  if (excludeId) {
    params.set('excludeId', excludeId);
  }
  if (simulateError) {
    params.set('simulateError', simulateError);
  }
  return fetchWithAuth<ProductValidationResponse>(
    `/products/validation/sku-availability?${params.toString()}`,
  );
}

export function searchRelatedProducts(
  fetchWithAuth: AuthorizedRequest,
  search: string,
  excludeSku?: string,
) {
  const params = new URLSearchParams({ search });
  if (excludeSku) {
    params.set('excludeSku', excludeSku);
  }
  return fetchWithAuth<ProductSearchOption[]>(
    `/products/validation/related-products?${params.toString()}`,
  );
}

export function createProduct(
  fetchWithAuth: AuthorizedRequest,
  payload: ProductFormPayload,
  simulateError?: string,
) {
  const queryString = simulateError ? `?simulateError=${simulateError}` : '';
  return fetchWithAuth<ProductRecord>(`/products${queryString}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProduct(
  fetchWithAuth: AuthorizedRequest,
  productId: string,
  payload: ProductFormPayload,
  simulateError?: string,
) {
  const queryString = simulateError ? `?simulateError=${simulateError}` : '';
  return fetchWithAuth<ProductRecord>(`/products/${productId}${queryString}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function uploadProductImage(
  fetchWithAuth: AuthorizedRequest,
  productId: string,
  file: File,
  simulateError?: string,
) {
  const body = new FormData();
  body.append('file', file);
  const queryString = simulateError ? `?simulateError=${simulateError}` : '';

  return fetchWithAuth<ProductRecord>(`/products/${productId}/image${queryString}`, {
    method: 'POST',
    body,
  });
}

export function deleteProduct(
  fetchWithAuth: AuthorizedRequest,
  productId: string,
  simulateError?: string,
) {
  const queryString = simulateError ? `?simulateError=${simulateError}` : '';
  return fetchWithAuth<AuthMessageResponse>(`/products/${productId}${queryString}`, {
    method: 'DELETE',
  });
}
