import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProductFormPayload,
  ProductOption,
  ProductRecord,
  ProductSearchOption,
} from '@testforge/shared-types';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmModal } from '@/components/confirm-modal';
import { ErrorState, SkeletonPanel } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { formatCurrencyInput, normalizeCurrencyInput } from '@/lib/currency';
import { featureFlags } from '@/lib/feature-flags';
import {
  createProduct,
  getProduct,
  getProductMetadata,
  getSuppliersForCategory,
  searchRelatedProducts,
  updateProduct,
  uploadProductImage,
  validateSkuAvailability,
  type AuthorizedRequest,
} from '@/features/products/products-api';
import {
  productFormDefaults,
  productFormSchema,
  type ProductFormValues,
} from '@/features/products/product-form-schema';
import { useToast } from '@/features/ui/toast-context';
import { formatProductStatus } from '@/lib/labels';

const wizardSteps = [
  { id: 'core', label: 'Dados principais' },
  { id: 'pricing', label: 'Precos e status' },
  { id: 'logistics', label: 'Estoque e logistica' },
  { id: 'automation', label: 'Relacionamentos' },
] as const;

type StepIndex = 0 | 1 | 2 | 3;

function productToFormValues(product: ProductRecord): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    price: formatCurrencyInput(product.price),
    promotionalPrice: product.promotionalPrice ? formatCurrencyInput(product.promotionalPrice) : '',
    promotionEndsAt: product.promotionEndsAt ? product.promotionEndsAt.slice(0, 10) : '',
    cost: formatCurrencyInput(product.cost),
    stockQuantity: product.stockQuantity,
    categoryId: product.category.id,
    supplierId: product.supplier.id,
    status: product.status,
    isActive: product.isActive,
    deactivationReason: product.deactivationReason ?? '',
    weight: product.weight,
    width: product.width,
    height: product.height,
    length: product.length,
    tagIds: product.tags.map((tag) => tag.id),
    barcode: product.barcode ?? '',
    expirationDate: product.expirationDate ? product.expirationDate.slice(0, 10) : '',
    featureBullets: product.featureBullets.length > 0 ? product.featureBullets : [''],
    relatedSkus: product.relatedSkus,
  };
}

function formValuesToPayload(values: ProductFormValues): ProductFormPayload {
  return {
    name: values.name,
    sku: values.sku,
    shortDescription: values.shortDescription,
    longDescription: values.longDescription,
    price: normalizeCurrencyInput(values.price),
    cost: normalizeCurrencyInput(values.cost),
    stockQuantity: values.stockQuantity,
    categoryId: values.categoryId,
    supplierId: values.supplierId,
    status: values.status,
    isActive: values.isActive,
    weight: values.weight,
    width: values.width,
    height: values.height,
    length: values.length,
    tagIds: values.tagIds,
    featureBullets: values.featureBullets.map((item) => item.trim()).filter(Boolean),
    relatedSkus: [...new Set(values.relatedSkus.filter(Boolean))],
    ...(values.promotionalPrice
      ? { promotionalPrice: normalizeCurrencyInput(values.promotionalPrice) }
      : {}),
    ...(values.promotionEndsAt ? { promotionEndsAt: values.promotionEndsAt } : {}),
    ...(values.deactivationReason.trim()
      ? { deactivationReason: values.deactivationReason.trim() }
      : {}),
    ...(values.barcode.trim() ? { barcode: values.barcode.trim() } : {}),
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
  const [selectedStep, setSelectedStep] = useState<StepIndex>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<ProductFormValues | null>(null);
  const [relatedSearch, setRelatedSearch] = useState('');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
    mode: 'onBlur',
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

  const watchedSku = form.watch('sku');
  const watchedCategoryId = form.watch('categoryId');
  const watchedIsActive = form.watch('isActive');
  const watchedPromotionalPrice = form.watch('promotionalPrice');
  const watchedRelatedSkus = form.watch('relatedSkus');
  const watchedFeatureBullets = form.watch('featureBullets');
  const debouncedSku = useDebouncedValue(watchedSku, 500);
  const debouncedRelatedSearch = useDebouncedValue(relatedSearch, 350);

  const supplierRecommendationsQuery = useQuery({
    queryKey: ['products', 'suppliers', watchedCategoryId],
    queryFn: () => getSuppliersForCategory(fetchWithAuth as AuthorizedRequest, watchedCategoryId),
    enabled: Boolean(watchedCategoryId),
  });

  const skuValidationQuery = useQuery({
    queryKey: ['products', 'sku-validation', debouncedSku, productId],
    queryFn: () =>
      validateSkuAvailability(fetchWithAuth as AuthorizedRequest, debouncedSku.trim(), productId),
    enabled: debouncedSku.trim().length >= 3,
  });

  const relatedProductsQuery = useQuery({
    queryKey: ['products', 'related-search', debouncedRelatedSearch, watchedSku],
    queryFn: () =>
      searchRelatedProducts(
        fetchWithAuth as AuthorizedRequest,
        debouncedRelatedSearch,
        watchedSku.trim() || undefined,
      ),
    enabled: featureFlags.relatedProductsSearch && debouncedRelatedSearch.trim().length >= 2,
  });

  useEffect(() => {
    if (productQuery.data) {
      form.reset(productToFormValues(productQuery.data));
    }
  }, [form, productQuery.data]);

  useEffect(() => {
    if (!watchedPromotionalPrice) {
      form.setValue('promotionEndsAt', '');
    }
  }, [form, watchedPromotionalPrice]);

  useEffect(() => {
    if (watchedIsActive) {
      form.setValue('deactivationReason', '');
    }
  }, [form, watchedIsActive]);

  useEffect(() => {
    if (!skuValidationQuery.data || !debouncedSku.trim()) {
      return;
    }

    if (!skuValidationQuery.data.available) {
      form.setError('sku', {
        type: 'validate',
        message: skuValidationQuery.data.reason ?? 'Este SKU ja esta em uso.',
      });
      return;
    }

    if (form.formState.errors.sku?.type === 'validate') {
      form.clearErrors('sku');
    }
  }, [debouncedSku, form, skuValidationQuery.data, form.formState.errors.sku?.type]);

  const submitMutation = useMutation({
    mutationFn: async ({
      values,
    }: {
      values: ProductFormValues;
      simulateError?: ProductErrorMode;
    }) => {
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
        title: isEditing ? 'Produto atualizado' : 'Produto criado',
        description: `${product.name} esta pronto para novos cenarios de teste.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsSubmitConfirmOpen(false);
      setPendingPayload(null);
      void navigate(`/products/${product.id}`);
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel salvar o produto',
        description: error instanceof Error ? error.message : 'Revise os dados e tente novamente.',
        variant: 'error',
      });
    },
  });

  const isInitialLoading = metadataQuery.isLoading || (isEditing && productQuery.isLoading);

  if (isInitialLoading) {
    return <SkeletonPanel rows={6} testId="product-form-skeleton" />;
  }

  if (metadataQuery.isError || productQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel abrir o formulario de produto"
        description="Os dados necessarios para o cadastro nao puderam ser carregados."
        testId="product-form-error"
        action={
          <Link className="primary-button button-link" to="/products">
            Voltar para produtos
          </Link>
        }
      />
    );
  }

  const metadata = metadataQuery.data;
  const selectedCategory = metadata?.categories.find(
    (category) => category.id === watchedCategoryId,
  );
  const recommendedSuppliers =
    metadata?.recommendedSuppliersByCategory.find((item) => item.categoryId === watchedCategoryId)
      ?.suppliers ?? [];
  const supplierOptions =
    supplierRecommendationsQuery.data ?? recommendedSuppliers ?? metadata?.suppliers ?? [];
  const showPromotionFields = Boolean(watchedPromotionalPrice);
  const requiresExpirationDate = selectedCategory?.name === 'Grocery';
  const availableRelatedResults = (relatedProductsQuery.data ?? []).filter(
    (option) => !watchedRelatedSkus.includes(option.sku),
  );

  const handleCurrencyChange = (field: 'price' | 'promotionalPrice' | 'cost', value: string) => {
    form.setValue(field, formatCurrencyInput(value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addRelatedSku = (option: ProductSearchOption) => {
    form.setValue('relatedSkus', [...watchedRelatedSkus, option.sku], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setRelatedSearch('');
  };

  const handleAttemptSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      pushToast({
        title: 'Revise os campos do formulario',
        description: 'Ainda existem etapas que precisam da sua atencao.',
        variant: 'error',
      });
      return;
    }

    if (requiresExpirationDate && !form.getValues('expirationDate')) {
      form.setError('expirationDate', {
        type: 'manual',
        message: 'Produtos alimenticios precisam de data de validade.',
      });
      setSelectedStep(2);
      return;
    }

    setPendingPayload(form.getValues());
    setIsSubmitConfirmOpen(true);
  };

  return (
    <section className="dashboard-grid" data-testid="product-form-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">{isEditing ? 'Edicao de produto' : 'Novo produto'}</p>
          <h2>Cadastro guiado para produtos</h2>
          <p className="muted">
            Um fluxo por etapas para tornar o preenchimento mais simples, claro e preparado para
            testes automatizados.
          </p>
        </div>
        <Link className="ghost-button button-link" to="/products">
          Voltar
        </Link>
      </div>

      <div className="panel wizard-stepper" data-testid="product-wizard-stepper">
        {wizardSteps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={selectedStep === index ? 'step-pill step-pill-active' : 'step-pill'}
            onClick={() => setSelectedStep(index as StepIndex)}
            data-testid={`wizard-step-${step.id}`}
          >
            <span>{index + 1}</span>
            {step.label}
          </button>
        ))}
      </div>

      <form
        className="panel product-wizard"
        onSubmit={(event) => {
          event.preventDefault();
          void handleAttemptSubmit();
        }}
      >
        {selectedStep === 0 ? (
          <div className="form-grid two-columns" data-testid="product-step-core">
            <label className="field">
              Nome do produto
              <input {...form.register('name')} data-testid="product-name-input" />
              <span className="field-error">{form.formState.errors.name?.message}</span>
            </label>
            <label className="field">
              SKU
              <input {...form.register('sku')} data-testid="product-sku-input" />
              <span className="field-error">{form.formState.errors.sku?.message}</span>
              {skuValidationQuery.isFetching ? (
                <span className="muted" data-testid="sku-validation-loading">
                  Validando SKU...
                </span>
              ) : null}
              {skuValidationQuery.data?.available ? (
                <span className="success-text" data-testid="sku-validation-success">
                  SKU disponivel para uso.
                </span>
              ) : null}
            </label>
            <label className="field full-span">
              Descricao curta
              <input
                {...form.register('shortDescription')}
                data-testid="product-short-description-input"
              />
              <span className="field-error">{form.formState.errors.shortDescription?.message}</span>
            </label>
            <label className="field full-span">
              Descricao completa
              <textarea
                rows={5}
                {...form.register('longDescription')}
                data-testid="product-long-description-input"
              />
              <span className="field-error">{form.formState.errors.longDescription?.message}</span>
            </label>
            <label className="field">
              Categoria
              <select {...form.register('categoryId')} data-testid="product-category-select">
                <option value="">Selecione</option>
                {metadata?.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="field-error">{form.formState.errors.categoryId?.message}</span>
            </label>
            <label className="field">
              Fornecedor
              <select {...form.register('supplierId')} data-testid="product-supplier-select">
                <option value="">Selecione</option>
                {supplierOptions.map((supplier: ProductOption) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              <span className="field-error">{form.formState.errors.supplierId?.message}</span>
              {watchedCategoryId ? (
                <span className="muted" data-testid="supplier-recommendation-hint">
                  As sugestoes mudam conforme a categoria selecionada.
                </span>
              ) : null}
            </label>
            <fieldset className="tag-selector full-span" data-testid="product-tags-group">
              <legend>Etiquetas</legend>
              <div className="tag-row">
                {metadata?.tags.map((tag) => (
                  <label key={tag.id} className="tag-selector-option">
                    <input
                      type="checkbox"
                      checked={form.watch('tagIds').includes(tag.id)}
                      onChange={(event) => {
                        const current = form.getValues('tagIds');
                        form.setValue(
                          'tagIds',
                          event.target.checked
                            ? [...current, tag.id]
                            : current.filter((item) => item !== tag.id),
                          { shouldDirty: true },
                        );
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {selectedStep === 1 ? (
          <div className="form-grid two-columns" data-testid="product-step-pricing">
            <label className="field">
              Preco
              <input
                value={form.watch('price')}
                onChange={(event) => handleCurrencyChange('price', event.target.value)}
                data-testid="product-price-input"
              />
              <span className="field-error">{form.formState.errors.price?.message}</span>
            </label>
            <label className="field">
              Preco promocional
              <input
                value={form.watch('promotionalPrice')}
                onChange={(event) => handleCurrencyChange('promotionalPrice', event.target.value)}
                data-testid="product-promotional-price-input"
              />
              <span className="field-error">{form.formState.errors.promotionalPrice?.message}</span>
            </label>
            {showPromotionFields ? (
              <label className="field">
                Data final da promocao
                <input
                  type="date"
                  {...form.register('promotionEndsAt')}
                  data-testid="product-promotion-end-date-input"
                />
                <span className="field-error">
                  {form.formState.errors.promotionEndsAt?.message}
                </span>
              </label>
            ) : null}
            <label className="field">
              Custo
              <input
                value={form.watch('cost')}
                onChange={(event) => handleCurrencyChange('cost', event.target.value)}
                data-testid="product-cost-input"
              />
              <span className="field-error">{form.formState.errors.cost?.message}</span>
            </label>
            <label className="field">
              Status
              <select {...form.register('status')} data-testid="product-status-select">
                {metadata?.statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatProductStatus(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field-checkbox">
              <span>Produto ativo</span>
              <input
                type="checkbox"
                {...form.register('isActive')}
                data-testid="product-active-toggle"
              />
            </label>
            {!watchedIsActive ? (
              <label className="field full-span">
                Motivo da inativacao
                <input
                  {...form.register('deactivationReason')}
                  data-testid="product-deactivation-reason-input"
                />
                <span className="field-error">
                  {form.formState.errors.deactivationReason?.message}
                </span>
              </label>
            ) : null}
          </div>
        ) : null}

        {selectedStep === 2 ? (
          <div className="form-grid two-columns" data-testid="product-step-logistics">
            <label className="field">
              Quantidade em estoque
              <input
                type="number"
                {...form.register('stockQuantity', { valueAsNumber: true })}
                data-testid="product-stock-input"
              />
              <span className="field-error">{form.formState.errors.stockQuantity?.message}</span>
            </label>
            <label className="field">
              Codigo de barras
              <input {...form.register('barcode')} data-testid="product-barcode-input" />
              <span className="field-error">{form.formState.errors.barcode?.message}</span>
            </label>
            <label className="field">
              Peso
              <input {...form.register('weight')} data-testid="product-weight-input" />
              <span className="field-error">{form.formState.errors.weight?.message}</span>
            </label>
            <label className="field">
              Largura
              <input {...form.register('width')} data-testid="product-width-input" />
              <span className="field-error">{form.formState.errors.width?.message}</span>
            </label>
            <label className="field">
              Altura
              <input {...form.register('height')} data-testid="product-height-input" />
              <span className="field-error">{form.formState.errors.height?.message}</span>
            </label>
            <label className="field">
              Comprimento
              <input {...form.register('length')} data-testid="product-length-input" />
              <span className="field-error">{form.formState.errors.length?.message}</span>
            </label>
            <label className="field">
              Data de validade
              <input
                type="date"
                {...form.register('expirationDate')}
                data-testid="product-expiration-date-input"
              />
              <span className="field-error">{form.formState.errors.expirationDate?.message}</span>
              {requiresExpirationDate ? (
                <span className="muted">Produtos alimenticios exigem controle de validade.</span>
              ) : null}
            </label>
            <label className="field">
              Imagem principal
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                data-testid="product-image-input"
              />
              <span className="muted">
                O upload permanece local no ambiente de desenvolvimento, ideal para automacoes.
              </span>
            </label>
          </div>
        ) : null}

        {selectedStep === 3 ? (
          <div className="dashboard-grid" data-testid="product-step-automation">
            <section className="panel inset-panel">
              <div className="section-header-inline">
                <div>
                  <p className="eyebrow">Destaques do produto</p>
                  <h3>Linhas repetiveis para argumentos de venda</h3>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    form.setValue('featureBullets', [...watchedFeatureBullets, ''], {
                      shouldDirty: true,
                    })
                  }
                  data-testid="add-feature-bullet-button"
                >
                  Adicionar destaque
                </button>
              </div>
              <div className="repeatable-stack">
                {watchedFeatureBullets.map((_, index) => (
                  <div
                    key={index}
                    className="repeatable-row"
                    data-testid={`feature-bullet-row-${index}`}
                  >
                    <input {...form.register(`featureBullets.${index}`)} />
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() =>
                        form.setValue(
                          'featureBullets',
                          watchedFeatureBullets.filter((__, itemIndex) => itemIndex !== index),
                          { shouldDirty: true },
                        )
                      }
                      disabled={watchedFeatureBullets.length === 1}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel inset-panel">
              <div className="section-header-inline">
                <div>
                  <p className="eyebrow">Produtos relacionados</p>
                  <h3>Busca dinamica para conectar SKUs</h3>
                </div>
              </div>
              <label className="field">
                Buscar produtos relacionados
                <input
                  value={relatedSearch}
                  onChange={(event) => setRelatedSearch(event.target.value)}
                  placeholder="Pesquise por SKU ou nome"
                  data-testid="related-products-search-input"
                />
              </label>
              {relatedProductsQuery.isFetching ? (
                <div className="mini-skeleton" data-testid="related-products-loading" />
              ) : null}
              <div className="search-results" data-testid="related-products-results">
                {availableRelatedResults.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="search-result-button"
                    onClick={() => addRelatedSku(option)}
                  >
                    <strong>{option.sku}</strong>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
              <div className="panel table-panel compact-table" data-testid="related-products-table">
                <table>
                  <thead>
                    <tr>
                      <th>SKU relacionado</th>
                      <th>Acao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchedRelatedSkus.length === 0 ? (
                      <tr>
                        <td colSpan={2}>Nenhum produto relacionado selecionado ainda.</td>
                      </tr>
                    ) : (
                      watchedRelatedSkus.map((sku) => (
                        <tr key={sku}>
                          <td>{sku}</td>
                          <td>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() =>
                                form.setValue(
                                  'relatedSkus',
                                  watchedRelatedSkus.filter((item) => item !== sku),
                                  { shouldDirty: true },
                                )
                              }
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {featureFlags.automationLab ? (
              <section className="panel inset-panel automation-lab">
                <p className="eyebrow">Laboratorio de automacao</p>
                <h3>Cenarios prontos para exercitar respostas do sistema</h3>
                <div className="status-grid compact-status-grid">
                  {automationScenarios.map((scenario) => (
                    <article key={scenario.code} className="status-card">
                      <h4>{scenario.code}</h4>
                      <p className="muted">{scenario.description}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        <div className="wizard-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => setSelectedStep((current) => Math.max(0, current - 1) as StepIndex)}
            disabled={selectedStep === 0}
          >
            Anterior
          </button>
          {selectedStep < wizardSteps.length - 1 ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => setSelectedStep((current) => Math.min(3, current + 1) as StepIndex)}
              data-testid="wizard-next-button"
            >
              Proxima etapa
            </button>
          ) : (
            <button type="submit" className="primary-button" data-testid="product-submit-button">
              Revisar e confirmar
            </button>
          )}
        </div>
      </form>

      <ConfirmModal
        isOpen={isSubmitConfirmOpen}
        title={isEditing ? 'Confirmar atualizacao do produto' : 'Confirmar criacao do produto'}
        description="Revise os dados abaixo antes de concluir a gravacao."
        confirmLabel={
          submitMutation.isPending
            ? 'Salvando...'
            : isEditing
              ? 'Atualizar produto'
              : 'Criar produto'
        }
        isBusy={submitMutation.isPending}
        onCancel={() => {
          setIsSubmitConfirmOpen(false);
          setPendingPayload(null);
        }}
        onConfirm={() => {
          if (pendingPayload) {
            submitMutation.mutate({ values: pendingPayload });
          }
        }}
      >
        <div className="summary-grid">
          <div>
            <strong>Nome</strong>
            <p>{pendingPayload?.name}</p>
          </div>
          <div>
            <strong>SKU</strong>
            <p>{pendingPayload?.sku}</p>
          </div>
          <div>
            <strong>Status</strong>
            <p>{pendingPayload?.status ? formatProductStatus(pendingPayload.status) : '-'}</p>
          </div>
          <div>
            <strong>SKUs relacionados</strong>
            <p>
              {pendingPayload?.relatedSkus.length
                ? pendingPayload.relatedSkus.join(', ')
                : 'Nenhum'}
            </p>
          </div>
        </div>
      </ConfirmModal>
    </section>
  );
}

type ProductErrorMode = '' | '400' | '401' | '403' | '404' | '409' | '500';

const automationScenarios: Array<{ code: string; description: string }> = [
  {
    code: '400',
    description: 'Teste combinacoes invalidas, como produto pronto sem codigo de barras.',
  },
  { code: '401', description: 'Expire a sessao ou limpe os cookies antes de enviar o formulario.' },
  {
    code: '403',
    description: 'Entre como operador e tente acessar uma mutacao exclusiva de administrador.',
  },
  { code: '404', description: 'Abra a rota de um produto inexistente para validar o tratamento.' },
  { code: '409', description: 'Reuse um SKU ja existente, como TF-HEADPHONE-001.' },
  { code: '500', description: 'Use o laboratorio da listagem para simular falhas de servidor.' },
];
