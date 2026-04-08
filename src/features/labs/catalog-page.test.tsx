import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { CatalogPage } from '@/features/labs/catalog-page';

describe('CatalogPage', () => {
  it('renders the lab catalog headlines', () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /escolha um lab/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /abrir experiencia/i })).toHaveLength(4);
    expect(screen.getByText(/advanced form lab/i)).toBeInTheDocument();
  });
});
