import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { listAuditLogs } from '@/features/audit/audit-api';
import { getProduct, type AuthorizedRequest } from '@/features/products/products-api';
import { formatCurrency, formatDateTime, formatProductStatus } from '@/lib/labels';

export function ProductDetailPage() {
  const { productId } = useParams();
  const { fetchWithAuth, user } = useAuth();
  const productQuery = useQuery({
    queryKey: ['products', productId, 'detail'],
    queryFn: () => getProduct(fetchWithAuth as AuthorizedRequest, productId ?? ''),
    enabled: Boolean(productId),
  });
  const auditQuery = useQuery({
    queryKey: ['audit-logs', 'product-detail', productId],
    queryFn: () =>
      listAuditLogs(fetchWithAuth as AuthorizedRequest, {
        page: 1,
        pageSize: 6,
        entityType: 'PRODUCT',
        ...(productId ? { entityId: productId } : {}),
      }),
    enabled: Boolean(productId),
  });

  if (productQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando detalhes do produto"
        description="Estamos reunindo as informacoes mais recentes deste item."
        testId="product-detail-loading"
      />
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ErrorState
        title="Produto indisponivel"
        description="Nao foi possivel carregar o produto selecionado."
        testId="product-detail-error"
        action={
          <Link className="primary-button button-link" to="/products">
            Voltar para produtos
          </Link>
        }
      />
    );
  }

  const product = productQuery.data;

  return (
    <section className="dashboard-grid" data-testid="product-detail-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">{product.category.name}</p>
          <h2>{product.name}</h2>
          <p className="muted">{product.shortDescription}</p>
        </div>
        <div className="action-row">
          <Link className="ghost-button button-link" to="/products">
            Voltar
          </Link>
          {user?.permissions.canManageProducts ? (
            <Link className="primary-button button-link" to={`/products/${product.id}/edit`}>
              Editar produto
            </Link>
          ) : null}
        </div>
      </div>

      <div className="panel detail-grid-panel">
        <div className="product-hero-media" data-testid="product-detail-image">
          {product.imageUrl ? (
            <img src={`http://localhost:3001${product.imageUrl}`} alt={product.name} />
          ) : (
            <div className="image-placeholder">Nenhuma imagem enviada</div>
          )}
        </div>
        <dl className="detail-grid">
          <div>
            <dt>SKU</dt>
            <dd>{product.sku}</dd>
          </div>
          <div>
            <dt>Preco regular</dt>
            <dd>{formatCurrency(product.price)}</dd>
          </div>
          <div>
            <dt>Preco promocional</dt>
            <dd>
              {product.promotionalPrice
                ? formatCurrency(product.promotionalPrice)
                : 'Nao configurado'}
            </dd>
          </div>
          <div>
            <dt>Custo</dt>
            <dd>{formatCurrency(product.cost)}</dd>
          </div>
          <div>
            <dt>Estoque</dt>
            <dd>{product.stockQuantity}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{formatProductStatus(product.status)}</dd>
          </div>
          <div>
            <dt>Fornecedor</dt>
            <dd>{product.supplier.name}</dd>
          </div>
          <div>
            <dt>Codigo de barras</dt>
            <dd>{product.barcode ?? 'Nao configurado'}</dd>
          </div>
          <div>
            <dt>Peso</dt>
            <dd>{product.weight} kg</dd>
          </div>
          <div>
            <dt>Dimensoes</dt>
            <dd>
              {product.width} x {product.height} x {product.length}
            </dd>
          </div>
          <div>
            <dt>Criado por</dt>
            <dd>{product.createdBy.name}</dd>
          </div>
          <div>
            <dt>Ultima atualizacao</dt>
            <dd>{product.lastUpdatedBy.name}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <p className="eyebrow">Descricao completa</p>
        <p className="muted">{product.longDescription}</p>
        <div className="tag-row" data-testid="product-detail-tags">
          {product.tags.map((tag) => (
            <span key={tag.id} className="tag-badge">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="detail-list-block">
          <h3>Diferenciais do produto</h3>
          <ul>
            {product.featureBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>SKUs relacionados</h3>
          <p className="muted">
            {product.relatedSkus.length > 0
              ? product.relatedSkus.join(', ')
              : 'Nenhum produto relacionado foi configurado.'}
          </p>
        </div>
      </div>

      <div className="panel detail-list-block" data-testid="product-audit-history">
        <p className="eyebrow">Historico</p>
        <h3>Ultimas alteracoes deste produto</h3>
        {auditQuery.isLoading ? <p className="muted">Carregando trilha de auditoria...</p> : null}
        {auditQuery.data?.items.length ? (
          <div className="audit-list compact-audit-list">
            {auditQuery.data.items.map((item) => (
              <article key={item.id} className="audit-item">
                <div className="audit-item-header">
                  <strong>{item.summary}</strong>
                  <span className="muted">{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="muted">
                  {item.action} por {item.actor?.name ?? 'Sistema'}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">Ainda nao existem mudancas registradas para este produto.</p>
        )}
      </div>
    </section>
  );
}
