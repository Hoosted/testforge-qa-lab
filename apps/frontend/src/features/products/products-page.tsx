import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductListQuery, ProductRecord } from '@testforge/shared-types';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '@/components/confirm-modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
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
};

export function ProductsPage() {
  const { fetchWithAuth } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<ProductListState>(initialQuery);
  const [productToDelete, setProductToDelete] = useState<ProductRecord | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products', query],
    queryFn: () => listProducts(fetchWithAuth as AuthorizedRequest, query),
  });

  const metadataQuery = useQuery({
    queryKey: ['products', 'metadata'],
    queryFn: () => getProductMetadata(fetchWithAuth as AuthorizedRequest),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(fetchWithAuth as AuthorizedRequest, productId),
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

  const activeTagFilter = useMemo(() => query.tagIds ?? [], [query.tagIds]);

  if (productsQuery.isLoading && !productsQuery.data) {
    return (
      <LoadingState
        title="Loading product catalog"
        description="We are preparing products, filters and summary data for this workspace."
        testId="products-loading"
      />
    );
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
          <h2>Inventory management with realistic product data</h2>
          <p className="muted">
            Search, filter, order and manage product records designed for API, UI and E2E test
            practice.
          </p>
        </div>
        <Link
          className="primary-button button-link"
          to="/products/new"
          data-testid="create-product-link"
        >
          New product
        </Link>
      </div>

      <div className="panel filters-panel" data-testid="products-filters">
        <div className="toolbar-grid">
          <label className="field">
            Search
            <input
              value={query.search ?? ''}
              onChange={(event) =>
                setQuery((current) => ({ ...current, page: 1, search: event.target.value }))
              }
              placeholder="Search by name, SKU or barcode"
              data-testid="products-search-input"
            />
          </label>
          <label className="field">
            Status
            <select
              value={query.status ?? ''}
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
              value={query.isActive ?? ''}
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
              value={query.categoryId ?? ''}
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
              value={query.supplierId ?? ''}
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
                  NonNullable<ProductListQuery['sortBy']>,
                  NonNullable<ProductListQuery['sortOrder']>,
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
                onClick={() => {
                  setQuery((current) => {
                    const currentTagIds = current.tagIds ?? [];
                    return {
                      ...current,
                      page: 1,
                      tagIds: currentTagIds.includes(tag.id)
                        ? currentTagIds.filter((item) => item !== tag.id)
                        : [...currentTagIds, tag.id],
                    };
                  });
                }}
                data-testid={`products-tag-filter-${tag.id}`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products match the current filters"
          description="Adjust the search and filters or create a new product to populate this workspace."
          testId="products-empty"
          action={
            <Link className="primary-button button-link" to="/products/new">
              Create first product
            </Link>
          }
        />
      ) : (
        <div className="products-grid" data-testid="products-list">
          {products.map((product) => (
            <article
              key={product.id}
              className="panel product-card"
              data-testid={`product-card-${product.id}`}
            >
              <div className="product-card-header">
                <div>
                  <p className="eyebrow">{product.category.name}</p>
                  <h3>{product.name}</h3>
                </div>
                <span
                  className={product.isActive ? 'status-chip' : 'status-chip status-chip-muted'}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="muted">{product.shortDescription}</p>
              <dl className="inline-metrics">
                <div>
                  <dt>SKU</dt>
                  <dd>{product.sku}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>${product.price}</dd>
                </div>
                <div>
                  <dt>Stock</dt>
                  <dd>{product.stockQuantity}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{product.status}</dd>
                </div>
              </dl>
              <div className="tag-row">
                {product.tags.map((tag) => (
                  <span key={tag.id} className="tag-badge">
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="action-row">
                <Link className="ghost-button button-link" to={`/products/${product.id}`}>
                  Details
                </Link>
                <Link className="ghost-button button-link" to={`/products/${product.id}/edit`}>
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
              </div>
            </article>
          ))}
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
                  page: Math.max(1, (current.page ?? 1) - 1),
                }))
              }
              disabled={(query.page ?? 1) <= 1}
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
                  page: Math.min(meta.totalPages, (current.page ?? 1) + 1),
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
        description={`This will permanently delete ${productToDelete?.name ?? 'this product'}. This action is intentional and requires confirmation.`}
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
