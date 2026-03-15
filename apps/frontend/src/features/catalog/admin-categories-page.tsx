import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CategoryPayload, CategoryRecord } from '@testforge/shared-types';
import { ConfirmModal } from '@/components/confirm-modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/features/catalog/catalog-api';
import { type AuthorizedRequest } from '@/features/products/products-api';
import { useToast } from '@/features/ui/toast-context';

const emptyCategoryForm: CategoryPayload = {
  name: '',
  description: '',
};

export function AdminCategoriesPage() {
  const { fetchWithAuth } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CategoryPayload>(emptyCategoryForm);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRecord | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories(fetchWithAuth as AuthorizedRequest),
  });

  const sortedCategories = useMemo(
    () =>
      [...(categoriesQuery.data ?? [])].sort((left, right) => left.name.localeCompare(right.name)),
    [categoriesQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      editingCategory
        ? updateCategory(fetchWithAuth as AuthorizedRequest, editingCategory.id, payload)
        : createCategory(fetchWithAuth as AuthorizedRequest, payload),
    onSuccess: () => {
      pushToast({
        title: editingCategory ? 'Category updated' : 'Category created',
        description: 'The product catalog taxonomy is now up to date.',
      });
      setForm(emptyCategoryForm);
      setEditingCategory(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to save category',
        description: error instanceof Error ? error.message : 'Try again shortly.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) =>
      deleteCategory(fetchWithAuth as AuthorizedRequest, categoryId),
    onSuccess: (payload) => {
      pushToast({ title: 'Category deleted', description: payload.message });
      setCategoryToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to delete category',
        description: error instanceof Error ? error.message : 'Try again shortly.',
        variant: 'error',
      });
    },
  });

  if (categoriesQuery.isLoading) {
    return (
      <LoadingState
        title="Loading categories"
        description="Preparing the catalog structure used across the product module."
        testId="categories-loading"
      />
    );
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Unable to load categories"
        description="The category administration workspace is currently unavailable."
        testId="categories-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void categoriesQuery.refetch()}
          >
            Retry
          </button>
        }
      />
    );
  }

  return (
    <section className="dashboard-grid" data-testid="categories-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Manage product categories</h2>
          <p className="muted">Categories feed the product wizard and inventory filters.</p>
        </div>
      </div>

      <form
        className="panel form-grid"
        data-testid="category-form"
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate(form);
        }}
      >
        <div className="toolbar-grid compact-grid">
          <label className="field">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              data-testid="category-name-input"
            />
          </label>
          <label className="field full-span">
            Description
            <textarea
              value={form.description ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={3}
              data-testid="category-description-input"
            />
          </label>
        </div>
        <div className="action-row">
          <button
            type="submit"
            className="primary-button"
            disabled={saveMutation.isPending}
            data-testid="category-save-button"
          >
            {saveMutation.isPending
              ? 'Saving...'
              : editingCategory
                ? 'Save changes'
                : 'Create category'}
          </button>
          {editingCategory ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setEditingCategory(null);
                setForm(emptyCategoryForm);
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {sortedCategories.length === 0 ? (
        <EmptyState
          title="No categories registered"
          description="Create the first category to support product organization."
          testId="categories-empty"
        />
      ) : (
        <div className="panel table-panel" data-testid="categories-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((category) => (
                <tr key={category.id} data-testid={`category-row-${category.id}`}>
                  <td>{category.name}</td>
                  <td>{category.description ?? 'No description'}</td>
                  <td>{category.productCount}</td>
                  <td>{new Date(category.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="action-row">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setEditingCategory(category);
                          setForm({
                            name: category.name,
                            description: category.description ?? '',
                          });
                        }}
                        data-testid={`edit-category-button-${category.id}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => setCategoryToDelete(category)}
                        data-testid={`delete-category-button-${category.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="Delete category"
        description={`Delete ${categoryToDelete?.name ?? 'this category'} from the catalog?`}
        confirmLabel="Delete category"
        isBusy={deleteMutation.isPending}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
      >
        <p className="muted">Products linked to this category must be reassigned first.</p>
      </ConfirmModal>
    </section>
  );
}
