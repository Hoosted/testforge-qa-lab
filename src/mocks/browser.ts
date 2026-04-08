import { setupWorker } from 'msw/browser';
import { handlers } from '@/mocks/handlers';

const worker = setupWorker(...handlers);

export async function enableMocking() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
