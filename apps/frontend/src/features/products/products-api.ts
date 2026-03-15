import type {
  AuthMessageResponse,
  PaginatedResponse,
  ProductFormPayload,
  ProductListQuery,
  ProductMetadata,
  ProductRecord,
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

export function getProduct(fetchWithAuth: AuthorizedRequest, productId: string) {
  return fetchWithAuth<ProductRecord>(`/products/${productId}`);
}

export function getProductMetadata(fetchWithAuth: AuthorizedRequest) {
  return fetchWithAuth<ProductMetadata>('/products/metadata');
}

export function createProduct(fetchWithAuth: AuthorizedRequest, payload: ProductFormPayload) {
  return fetchWithAuth<ProductRecord>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProduct(
  fetchWithAuth: AuthorizedRequest,
  productId: string,
  payload: ProductFormPayload,
) {
  return fetchWithAuth<ProductRecord>(`/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function uploadProductImage(
  fetchWithAuth: AuthorizedRequest,
  productId: string,
  file: File,
) {
  const body = new FormData();
  body.append('file', file);

  return fetchWithAuth<ProductRecord>(`/products/${productId}/image`, {
    method: 'POST',
    body,
  });
}

export function deleteProduct(fetchWithAuth: AuthorizedRequest, productId: string) {
  return fetchWithAuth<AuthMessageResponse>(`/products/${productId}`, {
    method: 'DELETE',
  });
}
