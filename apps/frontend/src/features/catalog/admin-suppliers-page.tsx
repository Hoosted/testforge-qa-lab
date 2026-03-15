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
        title: editingSupplier ? 'Supplier updated' : 'Supplier created',
        description: 'Supplier data is now available to the product workflow.',
      });
      setForm(emptySupplierForm);
      setEditingSupplier(null);
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to save supplier',
        description: error instanceof Error ? error.message : 'Try again shortly.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (supplierId: string) =>
      deleteSupplier(fetchWithAuth as AuthorizedRequest, supplierId),
    onSuccess: (payload) => {
      pushToast({ title: 'Supplier deleted', description: payload.message });
      setSupplierToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'metadata'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to delete supplier',
        description: error instanceof Error ? error.message : 'Try again shortly.',
        variant: 'error',
      });
    },
  });

  if (suppliersQuery.isLoading) {
    return (
      <LoadingState
        title="Loading suppliers"
        description="Preparing the supplier catalog for product operations."
        testId="suppliers-loading"
      />
    );
  }

  if (suppliersQuery.isError) {
    return (
      <ErrorState
        title="Unable to load suppliers"
        description="The supplier administration workspace is currently unavailable."
        testId="suppliers-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void suppliersQuery.refetch()}
          >
            Retry
          </button>
        }
      />
    );
  }

  return (
    <section className="dashboard-grid" data-testid="suppliers-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Manage suppliers</h2>
          <p className="muted">
            Supplier records stay connected to product sourcing and filtering.
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
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              data-testid="supplier-name-input"
            />
          </label>
          <label className="field">
            Email
            <input
              value={form.email ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              data-testid="supplier-email-input"
            />
          </label>
          <label className="field">
            Phone
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
              ? 'Saving...'
              : editingSupplier
                ? 'Save changes'
                : 'Create supplier'}
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
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {sortedSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers registered"
          description="Create the first supplier to support product sourcing."
          testId="suppliers-empty"
        />
      ) : (
        <div className="panel table-panel" data-testid="suppliers-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Products</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSuppliers.map((supplier) => (
                <tr key={supplier.id} data-testid={`supplier-row-${supplier.id}`}>
                  <td>{supplier.name}</td>
                  <td>
                    <strong>{supplier.email ?? 'No email'}</strong>
                    <div className="muted">{supplier.phone ?? 'No phone'}</div>
                  </td>
                  <td>{supplier.productCount}</td>
                  <td>{new Date(supplier.updatedAt).toLocaleString()}</td>
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
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => setSupplierToDelete(supplier)}
                        data-testid={`delete-supplier-button-${supplier.id}`}
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
        isOpen={Boolean(supplierToDelete)}
        title="Delete supplier"
        description={`Delete ${supplierToDelete?.name ?? 'this supplier'} from the catalog?`}
        confirmLabel="Delete supplier"
        isBusy={deleteMutation.isPending}
        onCancel={() => setSupplierToDelete(null)}
        onConfirm={() => {
          if (supplierToDelete) {
            deleteMutation.mutate(supplierToDelete.id);
          }
        }}
      >
        <p className="muted">Products linked to this supplier must be reassigned first.</p>
      </ConfirmModal>
    </section>
  );
}
