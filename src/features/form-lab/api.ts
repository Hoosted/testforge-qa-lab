import { apiRequest } from '@/lib/api';
import type {
  AdvancedFormPayload,
  AdvancedFormScenarioId,
  SlugValidationResponse,
  SubmissionResponse,
} from '@/types/playground';

interface AdvancedFormRequestOptions {
  scenario: AdvancedFormScenarioId;
  token: string | null;
}

export function validateSlug(slug: string, scenario: AdvancedFormScenarioId) {
  return apiRequest<SlugValidationResponse>('/api/labs/advanced-form/validate-slug', {
    method: 'POST',
    json: { slug },
    scenario,
  });
}

export function submitAdvancedForm(
  payload: AdvancedFormPayload,
  { scenario, token }: AdvancedFormRequestOptions,
) {
  return apiRequest<SubmissionResponse>('/api/labs/advanced-form/submissions', {
    method: 'POST',
    json: payload,
    scenario,
    token,
  });
}
