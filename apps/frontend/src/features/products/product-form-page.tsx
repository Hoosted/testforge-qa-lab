import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductFormPayload, ProductRecord } from '@testforge/shared-types';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import {
  createProduct,
  getProduct,
  getProductMetadata,
  updateProduct,
  uploadProductImage,
  type AuthorizedRequest,
} from '@/features/products/products-api';
import {
  productFormDefaults,
  productFormSchema,
  type ProductFormValues,
} from '@/features/products/product-form-schema';
import { useToast } from '@/features/ui/toast-context';

function productToFormValues(product: ProductRecord): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    price: product.price,
    promotionalPrice: product.promotionalPrice ?? '',
    cost: product.cost,
    stockQuantity: product.stockQuantity,
    categoryId: product.category.id,
    supplierId: product.supplier.id,
    status: product.status,
    isActive: product.isActive,
    weight: product.weight,
    width: product.width,
    height: product.height,
    length: product.length,
    tagIds: product.tags.map((tag) => tag.id),
    barcode: product.barcode ?? '',
    expirationDate: product.expirationDate ? product.expirationDate.slice(0, 10) : '',
  };
}

function formValuesToPayload(values: ProductFormValues): ProductFormPayload {
  return {
    ...values,
    tagIds: values.tagIds,
    ...(values.promotionalPrice ? { promotionalPrice: values.promotionalPrice } : {}),
    ...(values.barcode ? { barcode: values.barcode } : {}),
    ...(values.expirationDate ? { expirationDate: values.expirationDate } : {}),
  };
}

export function ProductFormPage() {
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
  });

  const metadataQuery = useQuery({
    queryKey: ['products', 'metadata'],
    queryFn: () => getProductMetadata(fetchWithAuth as AuthorizedRequest),
  });

  const productQuery = useQuery({
    queryKey: ['products', productId],
    queryFn: () => getProduct(fetchWithAuth as AuthorizedRequest, productId ?? ''),
    enabled: isEditing,
  });

  useEffect(() => {
    if (productQuery.data) {
      form.reset(productToFormValues(productQuery.data));
    }
  }, [form, productQuery.data]);

  const submitMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = formValuesToPayload(values);
      const product =
        isEditing && productId
          ? await updateProduct(fetchWithAuth as AuthorizedRequest, productId, payload)
          : await createProduct(fetchWithAuth as AuthorizedRequest, payload);

      if (selectedFile) {
        return uploadProductImage(fetchWithAuth as AuthorizedRequest, product.id, selectedFile);
      }

      return product;
    },
    onSuccess: async (product) => {
      pushToast({
        title: isEditing ? 'Product updated' : 'Product created',
        description: `${product.name} is ready for test scenarios.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      void navigate(`/products/${product.id}`);
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to save product',
        description: error instanceof Error ? error.message : 'Review the form and try again.',
        variant: 'error',
      });
    },
  });

  const isInitialLoading = metadataQuery.isLoading || (isEditing && productQuery.isLoading);
  const selectedTagIds = form.watch('tagIds');
  const formError = useMemo(() => {
    if (!submitMutation.error) {
      return null;
    }

    return submitMutation.error instanceof Error
      ? submitMutation.error.message
      : 'Unable to save the product right now.';
  }, [submitMutation.error]);

  if (isInitialLoading) {
    return (
      <LoadingState
        title="Preparing product form"
        description="Metadata, categories and supplier options are loading."
        testId="product-form-loading"
      />
    );
  }

  if (metadataQuery.isError || productQuery.isError) {
    return (
      <ErrorState
        title="Unable to open product form"
        description="Required product data could not be loaded."
        testId="product-form-error"
        action={
          <Link className="primary-button button-link" to="/products">
            Back to products
          </Link>
        }
      />
    );
  }

  const metadata = metadataQuery.data;

  return (
    <section className="panel form-panel" data-testid="product-form-page">
      <div className="section-header-inline">
        <div>
          <p className="eyebrow">{isEditing ? 'Edit product' : 'Create product'}</p>
          <h2>{isEditing ? 'Update product details' : 'Add a new product to the catalog'}</h2>
        </div>
        <Link className="ghost-button button-link" to="/products">
          Back
        </Link>
      </div>

      <form
        className="product-form"
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            submitMutation.mutate(values);
          })(event);
        }}
      >
        <div className="form-grid two-columns">
          <label className="field">
            Name
            <input {...form.register('name')} data-testid="product-name-input" />
            <span className="field-error">{form.formState.errors.name?.message}</span>
          </label>
          <label className="field">
            SKU
            <input {...form.register('sku')} data-testid="product-sku-input" />
            <span className="field-error">{form.formState.errors.sku?.message}</span>
          </label>
          <label className="field full-span">
            Short description
            <input
              {...form.register('shortDescription')}
              data-testid="product-short-description-input"
            />
            <span className="field-error">{form.formState.errors.shortDescription?.message}</span>
          </label>
          <label className="field full-span">
            Long description
            <textarea
              rows={5}
              {...form.register('longDescription')}
              data-testid="product-long-description-input"
            />
            <span className="field-error">{form.formState.errors.longDescription?.message}</span>
          </label>
          <label className="field">
            Price
            <input {...form.register('price')} data-testid="product-price-input" />
            <span className="field-error">{form.formState.errors.price?.message}</span>
          </label>
          <label className="field">
            Promotional price
            <input
              {...form.register('promotionalPrice')}
              data-testid="product-promotional-price-input"
            />
            <span className="field-error">{form.formState.errors.promotionalPrice?.message}</span>
          </label>
          <label className="field">
            Cost
            <input {...form.register('cost')} data-testid="product-cost-input" />
            <span className="field-error">{form.formState.errors.cost?.message}</span>
          </label>
          <label className="field">
            Stock quantity
            <input
              type="number"
              {...form.register('stockQuantity', { valueAsNumber: true })}
              data-testid="product-stock-input"
            />
            <span className="field-error">{form.formState.errors.stockQuantity?.message}</span>
          </label>
          <label className="field">
            Category
            <select {...form.register('categoryId')} data-testid="product-category-select">
              <option value="">Select</option>
              {metadata?.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="field-error">{form.formState.errors.categoryId?.message}</span>
          </label>
          <label className="field">
            Supplier
            <select {...form.register('supplierId')} data-testid="product-supplier-select">
              <option value="">Select</option>
              {metadata?.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <span className="field-error">{form.formState.errors.supplierId?.message}</span>
          </label>
          <label className="field">
            Status
            <select {...form.register('status')} data-testid="product-status-select">
              {metadata?.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="field field-checkbox">
            <span>Active</span>
            <input
              type="checkbox"
              {...form.register('isActive')}
              data-testid="product-active-toggle"
            />
          </label>
          <label className="field">
            Weight
            <input {...form.register('weight')} data-testid="product-weight-input" />
            <span className="field-error">{form.formState.errors.weight?.message}</span>
          </label>
          <label className="field">
            Width
            <input {...form.register('width')} data-testid="product-width-input" />
            <span className="field-error">{form.formState.errors.width?.message}</span>
          </label>
          <label className="field">
            Height
            <input {...form.register('height')} data-testid="product-height-input" />
            <span className="field-error">{form.formState.errors.height?.message}</span>
          </label>
          <label className="field">
            Length
            <input {...form.register('length')} data-testid="product-length-input" />
            <span className="field-error">{form.formState.errors.length?.message}</span>
          </label>
          <label className="field">
            Barcode
            <input {...form.register('barcode')} data-testid="product-barcode-input" />
          </label>
          <label className="field">
            Expiration date
            <input
              type="date"
              {...form.register('expirationDate')}
              data-testid="product-expiration-date-input"
            />
          </label>
          <label className="field full-span">
            Main image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              data-testid="product-image-input"
            />
            <span className="muted">
              Optional. The backend stores the file locally for development workflows.
            </span>
          </label>
        </div>

        <fieldset className="tag-selector" data-testid="product-tags-group">
          <legend>Tags</legend>
          <div className="tag-row">
            {metadata?.tags.map((tag) => (
              <label key={tag.id} className="tag-selector-option">
                <input
                  type="checkbox"
                  value={tag.id}
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={(event) => {
                    const current = form.getValues('tagIds');
                    form.setValue(
                      'tagIds',
                      event.target.checked
                        ? [...current, tag.id]
                        : current.filter((item) => item !== tag.id),
                      { shouldValidate: true },
                    );
                  }}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>

        {formError ? (
          <div className="form-alert" data-testid="product-form-alert">
            {formError}
          </div>
        ) : null}

        <div className="action-row">
          <button
            type="submit"
            className="primary-button"
            disabled={submitMutation.isPending}
            data-testid="product-submit-button"
          >
            {submitMutation.isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Create product'}
          </button>
          <Link className="ghost-button button-link" to="/products">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
