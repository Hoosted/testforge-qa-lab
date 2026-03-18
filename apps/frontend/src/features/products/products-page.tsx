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
import { formatCurrency, formatProductStatus } from '@/lib/labels';

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
      pushToast({ title: 'Produto excluido', description: payload.message });
      setProductToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel excluir o produto',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
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
        title="Nao foi possivel carregar os produtos"
        description="O workspace de produtos esta indisponivel no momento."
        testId="products-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void productsQuery.refetch()}
          >
            Tentar novamente
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
          <p className="eyebrow">Produtos</p>
          <h2>Gerencie o inventario com filtros claros e acoes objetivas</h2>
          <p className="muted">
            Busque por SKU, nome, categoria, fornecedor e acompanhe os resultados em tempo real.
          </p>
        </div>
        {user?.permissions.canManageProducts ? (
          <Link
            className="primary-button button-link"
            to="/products/new"
            data-testid="create-product-link"
          >
            Novo produto
          </Link>
        ) : (
          <div className="read-only-badge" data-testid="products-read-only-banner">
            Contas operacionais podem apenas consultar.
          </div>
        )}
      </div>

      {featureFlags.automationLab ? (
        <div className="panel automation-lab" data-testid="products-automation-lab">
          <div className="section-header-inline">
            <div>
              <p className="eyebrow">Laboratorio de automacao</p>
              <h3>Simule erros controlados e valide comportamentos de excecao</h3>
            </div>
            <label className="field">
              Simular erro do servidor
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
                <option value="">Desativado</option>
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
            Exercite validacoes, restricoes por perfil, conflitos e falhas simuladas sem sair da
            interface.
          </p>
        </div>
      ) : null}

      <div className="panel filters-panel" data-testid="products-filters">
        <div className="toolbar-grid">
          <label className="field">
            Buscar
            <input
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setQuery((current) => ({ ...current, page: 1 }));
              }}
              placeholder="Pesquise por nome, SKU ou codigo de barras"
              data-testid="products-search-input"
            />
            <span className="muted">
              A busca aguarda alguns instantes antes de consultar o servidor.
            </span>
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
              <option value="">Todos</option>
              {metadata?.statuses.map((status) => (
                <option key={status} value={status}>
                  {formatProductStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Situacao
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
              <option value="">Todas</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>
          <label className="field">
            Categoria
            <select
              value={query.categoryId}
              onChange={(event) =>
                setQuery((current) => ({ ...current, page: 1, categoryId: event.target.value }))
              }
              data-testid="products-category-filter"
            >
              <option value="">Todas</option>
              {metadata?.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Fornecedor
            <select
              value={query.supplierId}
              onChange={(event) =>
                setQuery((current) => ({ ...current, page: 1, supplierId: event.target.value }))
              }
              data-testid="products-supplier-filter"
            >
              <option value="">Todos</option>
              {metadata?.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Ordenar por
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
              <option value="updatedAt-desc">Atualizados recentemente</option>
              <option value="createdAt-desc">Mais novos</option>
              <option value="name-asc">Nome de A a Z</option>
              <option value="price-desc">Maior preco</option>
              <option value="stockQuantity-desc">Maior estoque</option>
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
          Atualizando os resultados no servidor...
        </div>
      ) : null}

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado com os filtros atuais"
          description="Ajuste a busca, revise os filtros ou crie um novo produto para preencher este espaco."
          testId="products-empty"
          action={
            user?.permissions.canManageProducts ? (
              <Link className="primary-button button-link" to="/products/new">
                Criar primeiro produto
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="panel table-panel" data-testid="products-table">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Status</th>
                <th>Preco</th>
                <th>Estoque</th>
                <th>Fornecedor</th>
                <th>Acoes</th>
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
                  <td>{formatProductStatus(product.status)}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.stockQuantity}</td>
                  <td>{product.supplier.name}</td>
                  <td>
                    <div className="action-row">
                      <Link className="ghost-button button-link" to={`/products/${product.id}`}>
                        Detalhes
                      </Link>
                      {user?.permissions.canManageProducts ? (
                        <>
                          <Link
                            className="ghost-button button-link"
                            to={`/products/${product.id}/edit`}
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => setProductToDelete(product)}
                            data-testid={`delete-product-button-${product.id}`}
                          >
                            Excluir
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
            <strong>{meta.total}</strong> produtos encontrados em <strong>{meta.totalPages}</strong>{' '}
            paginas.
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
              Anterior
            </button>
            <span data-testid="products-current-page">Pagina {meta.page}</span>
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
              Proxima
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Excluir produto"
        description={`Esta acao removera permanentemente ${productToDelete?.name ?? 'este produto'}. Deseja continuar?`}
        confirmLabel="Excluir produto"
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
