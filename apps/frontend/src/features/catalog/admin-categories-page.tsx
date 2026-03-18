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
import { formatDateTime } from '@/lib/labels';

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
        title: editingCategory ? 'Categoria atualizada' : 'Categoria criada',
        description: 'A organizacao do catalogo foi atualizada com sucesso.',
      });
      setForm(emptyCategoryForm);
      setEditingCategory(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel salvar a categoria',
        description:
          error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) =>
      deleteCategory(fetchWithAuth as AuthorizedRequest, categoryId),
    onSuccess: (payload) => {
      pushToast({ title: 'Categoria removida', description: payload.message });
      setCategoryToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel excluir a categoria',
        description:
          error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    },
  });

  if (categoriesQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando categorias"
        description="Preparando a estrutura que organiza os produtos em todo o sistema."
        testId="categories-loading"
      />
    );
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar as categorias"
        description="A area administrativa de categorias esta indisponivel no momento."
        testId="categories-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void categoriesQuery.refetch()}
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <section className="dashboard-grid" data-testid="categories-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h2>Gerencie as categorias de produtos</h2>
          <p className="muted">
            As categorias alimentam o cadastro de produtos e os filtros do inventario.
          </p>
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
            Nome
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              data-testid="category-name-input"
            />
          </label>
          <label className="field full-span">
            Descricao
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
              ? 'Salvando...'
              : editingCategory
                ? 'Salvar alteracoes'
                : 'Criar categoria'}
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
              Cancelar edicao
            </button>
          ) : null}
        </div>
      </form>

      {sortedCategories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="Crie a primeira categoria para organizar o catalogo de produtos."
          testId="categories-empty"
        />
      ) : (
        <div className="panel table-panel" data-testid="categories-table">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descricao</th>
                <th>Produtos</th>
                <th>Atualizada em</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((category) => (
                <tr key={category.id} data-testid={`category-row-${category.id}`}>
                  <td>{category.name}</td>
                  <td>{category.description ?? 'Sem descricao'}</td>
                  <td>{category.productCount}</td>
                  <td>{formatDateTime(category.updatedAt)}</td>
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
                        Editar
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => setCategoryToDelete(category)}
                        data-testid={`delete-category-button-${category.id}`}
                      >
                        Excluir
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
        title="Excluir categoria"
        description={`Deseja realmente remover ${categoryToDelete?.name ?? 'esta categoria'} do catalogo?`}
        confirmLabel="Excluir categoria"
        isBusy={deleteMutation.isPending}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
      >
        <p className="muted">
          Produtos vinculados a esta categoria precisam ser reclassificados antes.
        </p>
      </ConfirmModal>
    </section>
  );
}
