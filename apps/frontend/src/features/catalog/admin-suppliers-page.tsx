import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupplierPayload, SupplierRecord } from '@testforge/shared-types';
import { ConfirmModal } from '@/components/confirm-modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
} from '@/features/catalog/catalog-api';
import { type AuthorizedRequest } from '@/features/products/products-api';
import { useToast } from '@/features/ui/toast-context';
import { formatDateTime } from '@/lib/labels';

const emptySupplierForm: SupplierPayload = {
  name: '',
  email: '',
  phone: '',
};

export function AdminSuppliersPage() {
  const { fetchWithAuth } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SupplierPayload>(emptySupplierForm);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRecord | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierRecord | null>(null);

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => listSuppliers(fetchWithAuth as AuthorizedRequest),
  });

  const sortedSuppliers = useMemo(
    () =>
      [...(suppliersQuery.data ?? [])].sort((left, right) => left.name.localeCompare(right.name)),
    [suppliersQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: SupplierPayload) =>
      editingSupplier
        ? updateSupplier(fetchWithAuth as AuthorizedRequest, editingSupplier.id, payload)
        : createSupplier(fetchWithAuth as AuthorizedRequest, payload),
    onSuccess: () => {
      pushToast({
        title: editingSupplier ? 'Fornecedor atualizado' : 'Fornecedor criado',
        description: 'Os dados do fornecedor ja estao disponiveis para o fluxo de produtos.',
      });
      setForm(emptySupplierForm);
      setEditingSupplier(null);
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel salvar o fornecedor',
        description:
          error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (supplierId: string) =>
      deleteSupplier(fetchWithAuth as AuthorizedRequest, supplierId),
    onSuccess: (payload) => {
      pushToast({ title: 'Fornecedor removido', description: payload.message });
      setSupplierToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel excluir o fornecedor',
        description:
          error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    },
  });

  if (suppliersQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando fornecedores"
        description="Preparando o cadastro de parceiros ligados aos produtos."
        testId="suppliers-loading"
      />
    );
  }

  if (suppliersQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar os fornecedores"
        description="A area administrativa de fornecedores esta indisponivel no momento."
        testId="suppliers-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void suppliersQuery.refetch()}
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <section className="dashboard-grid" data-testid="suppliers-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h2>Gerencie os fornecedores</h2>
          <p className="muted">
            Os fornecedores conectam origem, contato e abastecimento aos produtos cadastrados.
          </p>
        </div>
      </div>

      <form
        className="panel form-grid"
        data-testid="supplier-form"
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
              data-testid="supplier-name-input"
            />
          </label>
          <label className="field">
            E-mail
            <input
              value={form.email ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              data-testid="supplier-email-input"
            />
          </label>
          <label className="field">
            Telefone
            <input
              value={form.phone ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              data-testid="supplier-phone-input"
            />
          </label>
        </div>
        <div className="action-row">
          <button
            type="submit"
            className="primary-button"
            disabled={saveMutation.isPending}
            data-testid="supplier-save-button"
          >
            {saveMutation.isPending
              ? 'Salvando...'
              : editingSupplier
                ? 'Salvar alteracoes'
                : 'Criar fornecedor'}
          </button>
          {editingSupplier ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setEditingSupplier(null);
                setForm(emptySupplierForm);
              }}
            >
              Cancelar edicao
            </button>
          ) : null}
        </div>
      </form>

      {sortedSuppliers.length === 0 ? (
        <EmptyState
          title="Nenhum fornecedor cadastrado"
          description="Cadastre o primeiro fornecedor para enriquecer o fluxo de abastecimento."
          testId="suppliers-empty"
        />
      ) : (
        <div className="panel table-panel" data-testid="suppliers-table">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Produtos</th>
                <th>Atualizado em</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {sortedSuppliers.map((supplier) => (
                <tr key={supplier.id} data-testid={`supplier-row-${supplier.id}`}>
                  <td>{supplier.name}</td>
                  <td>
                    <strong>{supplier.email ?? 'Sem e-mail'}</strong>
                    <div className="muted">{supplier.phone ?? 'Sem telefone'}</div>
                  </td>
                  <td>{supplier.productCount}</td>
                  <td>{formatDateTime(supplier.updatedAt)}</td>
                  <td>
                    <div className="action-row">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setEditingSupplier(supplier);
                          setForm({
                            name: supplier.name,
                            email: supplier.email ?? '',
                            phone: supplier.phone ?? '',
                          });
                        }}
                        data-testid={`edit-supplier-button-${supplier.id}`}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => setSupplierToDelete(supplier)}
                        data-testid={`delete-supplier-button-${supplier.id}`}
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
        isOpen={Boolean(supplierToDelete)}
        title="Excluir fornecedor"
        description={`Deseja realmente remover ${supplierToDelete?.name ?? 'este fornecedor'} do catalogo?`}
        confirmLabel="Excluir fornecedor"
        isBusy={deleteMutation.isPending}
        onCancel={() => setSupplierToDelete(null)}
        onConfirm={() => {
          if (supplierToDelete) {
            deleteMutation.mutate(supplierToDelete.id);
          }
        }}
      >
        <p className="muted">
          Produtos vinculados a este fornecedor precisam ser reassociados antes.
        </p>
      </ConfirmModal>
    </section>
  );
}
