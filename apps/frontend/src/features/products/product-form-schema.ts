import { z } from 'zod';
import { isCurrencyValueValid } from '@/lib/currency';

export const productFormSchema = z
  .object({
    name: z.string().min(2, 'Provide a product name.'),
    sku: z.string().min(3, 'Provide a unique SKU.'),
    shortDescription: z.string().min(5, 'Provide a short description.').max(180),
    longDescription: z.string().min(10, 'Provide a long description.'),
    price: z.string().refine(isCurrencyValueValid, 'Use a valid price.'),
    promotionalPrice: z.string(),
    promotionEndsAt: z.string(),
    cost: z.string().refine(isCurrencyValueValid, 'Use a valid cost.'),
    stockQuantity: z.number().int().min(0, 'Stock cannot be negative.'),
    categoryId: z.string().min(1, 'Select a category.'),
    supplierId: z.string().min(1, 'Select a supplier.'),
    status: z.enum(['DRAFT', 'READY', 'ARCHIVED']),
    isActive: z.boolean(),
    deactivationReason: z.string(),
    weight: z.string().min(1, 'Use a valid weight.'),
    width: z.string().min(1, 'Use a valid width.'),
    height: z.string().min(1, 'Use a valid height.'),
    length: z.string().min(1, 'Use a valid length.'),
    tagIds: z.array(z.string()),
    barcode: z.string(),
    expirationDate: z.string(),
    featureBullets: z.array(z.string().min(3, 'Each bullet must have at least 3 characters.')),
    relatedSkus: z.array(z.string()),
  })
  .superRefine((value, ctx) => {
    if (value.promotionalPrice) {
      if (!isCurrencyValueValid(value.promotionalPrice)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Use a valid promotional price.',
          path: ['promotionalPrice'],
        });
      }

      if (!value.promotionEndsAt) {
        ctx.addIssue({
          code: 'custom',
          message: 'Provide an end date for the promotion.',
          path: ['promotionEndsAt'],
        });
      }
    }

    if (!value.isActive && !value.deactivationReason.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide a reason when the product is inactive.',
        path: ['deactivationReason'],
      });
    }

    if (value.status === 'READY' && !value.barcode.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'READY products must include a barcode.',
        path: ['barcode'],
      });
    }

    if (value.status === 'READY' && value.featureBullets.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'READY products need at least one feature bullet.',
        path: ['featureBullets'],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productFormDefaults: ProductFormValues = {
  name: '',
  sku: '',
  shortDescription: '',
  longDescription: '',
  price: '',
  promotionalPrice: '',
  promotionEndsAt: '',
  cost: '',
  stockQuantity: 0,
  categoryId: '',
  supplierId: '',
  status: 'DRAFT',
  isActive: true,
  deactivationReason: '',
  weight: '',
  width: '',
  height: '',
  length: '',
  tagIds: [],
  barcode: '',
  expirationDate: '',
  featureBullets: [''],
  relatedSkus: [],
};
