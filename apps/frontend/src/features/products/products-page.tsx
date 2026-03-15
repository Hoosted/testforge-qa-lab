import { useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductListQuery, ProductRecord } from '@testforge/shared-types';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '@/components/confirm-modal';
import { EmptyState, ErrorState, SkeletonPanel } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { featureFlags } from '@/lib/feature-flags';
import {
  deleteProduct,
  getProductMetadata,
  listProducts,
  type AuthorizedRequest,
} from '@/features/products/products-api';
import { useToast } from '@/features/ui/toast-context';

type ProductListState = {
  page: number;
  pageSize: number;
  search: string;
  status: '' | 'DRAFT' | 'READY' | 'ARCHIVED';
  isActive: '' | 'true' | 'false';
  categoryId: string;
  supplierId: string;
  tagIds: string[];
  sortBy: NonNullable<ProductListQuery['sortBy']>;
  sortOrder: NonNullable<ProductListQuery['sortOrder']>;
  simulateError: '' | '400' | '401' | '403' | '404' | '409' | '500';
};

const initialQuery: ProductListState = {
  page: 1,
  pageSize: 6,
  search: '',
  status: '',
  isActive: '',
  categoryId: '',
  supplierId: '',
  tagIds: [],
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  simulateError: '',
};

export function ProductsPage() {
  const { fetchWithAuth, user } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<ProductListState>(initialQuery);
  const [searchValue, setSearchValue] = useState('');
  const [productToDelete, setProductToDelete] = useState<ProductRecord | null>(null);
  const debouncedSearch = useDebouncedValue(searchValue, 450);

  const effectiveQuery = useMemo<ProductListQuery>(
    () => ({
      ...query,
      search: debouncedSearch,
    }),
    [debouncedSearch, query],
  );

  const productsQuery = useQuery({
    queryKey: ['products', effectiveQuery],
    queryFn: () => listProducts(fetchWithAuth as AuthorizedRequest, effectiveQuery),
    placeholderData: keepPreviousData,
  });

  const metadataQuery = useQuery({
    queryKey: ['products', 'metadata', query.simulateError],
    queryFn: () =>
      getProductMetadata(fetchWithAuth as AuthorizedRequest, query.simulateError || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) =>
      deleteProduct(
        fetchWithAuth as AuthorizedRequest,
        productId,
        query.simulateError || undefined,
      ),
    onSuccess: (payload) => {
      pushToast({ title: 'Product deleted', description: payload.message });
      setProductToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to delete product',
        description: error instanceof Error ? error.message : 'Try again in a moment.',
        variant: 'error',
      });
    },
  });

  const activeTagFilter = useMemo(() => query.tagIds, [query.tagIds]);

  if (productsQuery.isLoading && !productsQuery.data) {
    return <SkeletonPanel rows={5} testId="products-skeleton" />;
  }

  if (productsQuery.isError || metadataQuery.isError) {
    return (
      <ErrorState
        title="Unable to load products"
        description="The product workspace could not be loaded right now."
        testId="products-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void productsQuery.refetch()}
          >
            Retry
          </button>
        }
      />
    );
  }

  const metadata = metadataQuery.data;
  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;

  return (
    <section className="dashboard-grid" data-testid="products-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Products</p>
          <h2>Inventory workspace built for automation</h2>
          <p className="muted">
            Debounced search, server-side sorting and rich role-aware actions live side by side.
          </p>
        </div>
        {user?.permissions.canManageProducts ? (
          <Link
            className="primary-button button-link"
            to="/products/new"
            data-testid="create-product-link"
          >
            New product
          </Link>
        ) : (
          <div className="read-only-badge" data-testid="products-read-only-banner">
            Operator accounts can browse only.
          </div>
        )}
      </div>

      {featureFlags.automationLab ? (
        <div className="panel automation-lab" data-testid="products-automation-lab">
          <div className="section-header-inline">
            <div>
              <p className="eyebrow">Automation lab</p>
              <h3>Controlled error simulation and feature flags</h3>
            </div>
            <label className="field">
              Simulate server error
              <select
                value={query.simulateError ?? ''}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    simulateError: event.target.value as ProductListState['simulateError'],
                  }))
                }
                data-testid="simulate-error-select"
              >
                <option value="">Disabled</option>
                <option value="400">400</option>
                <option value="401">401</option>
                <option value="403">403</option>
                <option value="404">404</option>
                <option value="409">409</option>
                <option value="500">500</option>
              </select>
            </label>
          </div>
          <p className="muted">
            Use validation, role restrictions, missing records and simulated failures to exercise
            400, 401, 403, 404, 409 and 500 paths.
          </p>
        </div>
      ) : null}

      <div className="panel filters-panel" data-testid="products-filters">
        <div className="toolbar-grid">
          <label className="field">
            Search
            <input
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setQuery((current) => ({ ...current, page: 1 }));
              }}
              placeholder="Search by name, SKU or barcode"
              data-testid="products-search-input"
            />
            <span className="muted">Search waits briefly before hitting the server.</span>
          </label>
          <label className="field">
            Status
            <select
              value={query.status}
              onChange={(event) =>
                setQuery((current) => ({
                  ...current,
                  page: 1,
                  status: event.target.value as ProductListState['status'],
                }))
              }
              data-testid="products-status-filter"
            >
              <option value="">All</option>
              {metadata?.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Active state
            <select
              value={query.isActive}
              onChange={(event) =>
                setQuery((current) => ({
                  ...current,
                  page: 1,
                  isActive: event.target.value as ProductListState['isActive'],
                }))
              }
              data-testid="products-active-filter"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className="field">
            Category
            <select
              value={query.categoryId}
              onChange={(event) =>
                setQuery((current) => ({ ...current, page: 1, categoryId: event.target.value }))
              }
              data-testid="products-category-filter"
            >
              <option value="">All</option>
              {metadata?.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Supplier
            <select
              value={query.supplierId}
              onChange={(event) =>
                setQuery((current) => ({ ...current, page: 1, supplierId: event.target.value }))
              }
              data-testid="products-supplier-filter"
            >
              <option value="">All</option>
              {metadata?.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Sort by
            <select
              value={`${query.sortBy}-${query.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split('-') as [
                  ProductListState['sortBy'],
                  ProductListState['sortOrder'],
                ];
                setQuery((current) => ({ ...current, sortBy, sortOrder }));
              }}
              data-testid="products-sort-filter"
            >
              <option value="updatedAt-desc">Recently updated</option>
              <option value="createdAt-desc">Newest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="price-desc">Highest price</option>
              <option value="stockQuantity-desc">Highest stock</option>
            </select>
          </label>
        </div>
        <div className="filter-chips" data-testid="products-tag-filter-group">
          {metadata?.tags.map((tag) => {
            const isSelected = activeTagFilter.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                className={isSelected ? 'chip chip-active' : 'chip'}
                onClick={() =>
                  setQuery((current) => ({
                    ...current,
                    page: 1,
                    tagIds: current.tagIds.includes(tag.id)
                      ? current.tagIds.filter((item) => item !== tag.id)
                      : [...current.tagIds, tag.id],
                  }))
                }
                data-testid={`products-tag-filter-${tag.id}`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {productsQuery.isFetching ? (
        <div className="panel fetching-banner" data-testid="products-fetching-banner">
          Updating results from the server...
        </div>
      ) : null}

      {products.length === 0 ? (
        <EmptyState
          title="No products match the current filters"
          description="Adjust the search and filters or create a new product to populate this workspace."
          testId="products-empty"
          action={
            user?.permissions.canManageProducts ? (
              <Link className="primary-button button-link" to="/products/new">
                Create first product
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="panel table-panel" data-testid="products-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Status</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} data-testid={`product-row-${product.id}`}>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="muted">{product.shortDescription}</div>
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.status}</td>
                  <td>R$ {product.price}</td>
                  <td>{product.stockQuantity}</td>
                  <td>{product.supplier.name}</td>
                  <td>
                    <div className="action-row">
                      <Link className="ghost-button button-link" to={`/products/${product.id}`}>
                        Details
                      </Link>
                      {user?.permissions.canManageProducts ? (
                        <>
                          <Link
                            className="ghost-button button-link"
                            to={`/products/${product.id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => setProductToDelete(product)}
                            data-testid={`delete-product-button-${product.id}`}
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta ? (
        <div className="panel pagination-panel" data-testid="products-pagination">
          <div>
            <strong>{meta.total}</strong> products found across <strong>{meta.totalPages}</strong>{' '}
            pages.
          </div>
          <div className="action-row">
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                setQuery((current) => ({
                  ...current,
                  page: Math.max(1, current.page - 1),
                }))
              }
              disabled={query.page <= 1}
            >
              Previous
            </button>
            <span data-testid="products-current-page">Page {meta.page}</span>
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                setQuery((current) => ({
                  ...current,
                  page: Math.min(meta.totalPages, current.page + 1),
                }))
              }
              disabled={meta.page >= meta.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Delete product"
        description={`This will permanently delete ${productToDelete?.name ?? 'this product'}. This action requires confirmation.`}
        confirmLabel="Delete product"
        isBusy={deleteMutation.isPending}
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            deleteMutation.mutate(productToDelete.id);
          }
        }}
      >
        <p className="muted">SKU: {productToDelete?.sku}</p>
      </ConfirmModal>
    </section>
  );
}
