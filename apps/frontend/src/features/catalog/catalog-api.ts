import type {
  AuthMessageResponse,
  CategoryPayload,
  CategoryRecord,
  SupplierPayload,
  SupplierRecord,
} from '@testforge/shared-types';
import type { AuthorizedRequest } from '@/features/products/products-api';

export function listCategories(fetchWithAuth: AuthorizedRequest) {
  return fetchWithAuth<CategoryRecord[]>('/categories');
}

export function createCategory(fetchWithAuth: AuthorizedRequest, payload: CategoryPayload) {
  return fetchWithAuth<CategoryRecord>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategory(
  fetchWithAuth: AuthorizedRequest,
  categoryId: string,
  payload: CategoryPayload,
) {
  return fetchWithAuth<CategoryRecord>(`/categories/${categoryId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(fetchWithAuth: AuthorizedRequest, categoryId: string) {
  return fetchWithAuth<AuthMessageResponse>(`/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export function listSuppliers(fetchWithAuth: AuthorizedRequest) {
  return fetchWithAuth<SupplierRecord[]>('/suppliers');
}

export function createSupplier(fetchWithAuth: AuthorizedRequest, payload: SupplierPayload) {
  return fetchWithAuth<SupplierRecord>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateSupplier(
  fetchWithAuth: AuthorizedRequest,
  supplierId: string,
  payload: SupplierPayload,
) {
  return fetchWithAuth<SupplierRecord>(`/suppliers/${supplierId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteSupplier(fetchWithAuth: AuthorizedRequest, supplierId: string) {
  return fetchWithAuth<AuthMessageResponse>(`/suppliers/${supplierId}`, {
    method: 'DELETE',
  });
}
