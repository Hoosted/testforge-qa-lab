export const featureFlags = {
  advancedProductWizard: (import.meta.env.VITE_FLAG_ADVANCED_PRODUCT_WIZARD ?? 'true') === 'true',
  automationLab: (import.meta.env.VITE_FLAG_AUTOMATION_LAB ?? 'true') === 'true',
  relatedProductsSearch: (import.meta.env.VITE_FLAG_RELATED_PRODUCTS_SEARCH ?? 'true') === 'true',
};
