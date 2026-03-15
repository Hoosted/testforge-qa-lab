import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { getProduct, type AuthorizedRequest } from '@/features/products/products-api';

export function ProductDetailPage() {
  const { productId } = useParams();
  const { fetchWithAuth } = useAuth();
  const productQuery = useQuery({
    queryKey: ['products', productId, 'detail'],
    queryFn: () => getProduct(fetchWithAuth as AuthorizedRequest, productId ?? ''),
    enabled: Boolean(productId),
  });

  if (productQuery.isLoading) {
    return (
      <LoadingState
        title="Loading product details"
        description="We are collecting the latest state for this product."
        testId="product-detail-loading"
      />
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ErrorState
        title="Product unavailable"
        description="The selected product could not be loaded."
        testId="product-detail-error"
        action={
          <Link className="primary-button button-link" to="/products">
            Back to products
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
            Back
          </Link>
          <Link className="primary-button button-link" to={`/products/${product.id}/edit`}>
            Edit product
          </Link>
        </div>
      </div>

      <div className="panel detail-grid-panel">
        <div className="product-hero-media" data-testid="product-detail-image">
          {product.imageUrl ? (
            <img src={`http://localhost:3001${product.imageUrl}`} alt={product.name} />
          ) : (
            <div className="image-placeholder">No image uploaded</div>
          )}
        </div>
        <dl className="detail-grid">
          <div>
            <dt>SKU</dt>
            <dd>{product.sku}</dd>
          </div>
          <div>
            <dt>Regular price</dt>
            <dd>${product.price}</dd>
          </div>
          <div>
            <dt>Promotional price</dt>
            <dd>{product.promotionalPrice ? `$${product.promotionalPrice}` : 'Not configured'}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>${product.cost}</dd>
          </div>
          <div>
            <dt>Stock</dt>
            <dd>{product.stockQuantity}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{product.status}</dd>
          </div>
          <div>
            <dt>Supplier</dt>
            <dd>{product.supplier.name}</dd>
          </div>
          <div>
            <dt>Barcode</dt>
            <dd>{product.barcode ?? 'Not configured'}</dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{product.weight} kg</dd>
          </div>
          <div>
            <dt>Dimensions</dt>
            <dd>
              {product.width} x {product.height} x {product.length}
            </dd>
          </div>
          <div>
            <dt>Created by</dt>
            <dd>{product.createdBy.name}</dd>
          </div>
          <div>
            <dt>Last updated by</dt>
            <dd>{product.lastUpdatedBy.name}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <p className="eyebrow">Description</p>
        <p className="muted">{product.longDescription}</p>
        <div className="tag-row" data-testid="product-detail-tags">
          {product.tags.map((tag) => (
            <span key={tag.id} className="tag-badge">
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
