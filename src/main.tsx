import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/app/styles.css';

async function bootstrap() {
  const enableMocks = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW !== 'false';

  if (enableMocks) {
    const { enableMocking } = await import('@/mocks/browser');
    await enableMocking();
  }

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root container not found');
  }

  createRoot(container).render(<App />);
}

void bootstrap();
