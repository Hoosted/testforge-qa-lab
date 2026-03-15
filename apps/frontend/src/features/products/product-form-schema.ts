import { z } from 'zod';

const decimalPattern = /^\d+(\.\d{1,2})?$/;

export const productFormSchema = z
  .object({
    name: z.string().min(2, 'Provide a product name.'),
    sku: z.string().min(3, 'Provide a unique SKU.'),
    shortDescription: z.string().min(5, 'Provide a short description.').max(180),
    longDescription: z.string().min(10, 'Provide a long description.'),
    price: z.string().regex(decimalPattern, 'Use a valid price.'),
    promotionalPrice: z.union([
      z.literal(''),
      z.string().regex(decimalPattern, 'Use a valid price.'),
    ]),
    cost: z.string().regex(decimalPattern, 'Use a valid cost.'),
    stockQuantity: z.number().int().min(0, 'Stock cannot be negative.'),
    categoryId: z.string().min(1, 'Select a category.'),
    supplierId: z.string().min(1, 'Select a supplier.'),
    status: z.enum(['DRAFT', 'READY', 'ARCHIVED']),
    isActive: z.boolean(),
    weight: z.string().regex(decimalPattern, 'Use a valid weight.'),
    width: z.string().regex(decimalPattern, 'Use a valid width.'),
    height: z.string().regex(decimalPattern, 'Use a valid height.'),
    length: z.string().regex(decimalPattern, 'Use a valid length.'),
    tagIds: z.array(z.string()),
    barcode: z.string(),
    expirationDate: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.promotionalPrice && Number(value.promotionalPrice) >= Number(value.price)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Promotional price must be lower than the regular price.',
        path: ['promotionalPrice'],
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
  cost: '',
  stockQuantity: 0,
  categoryId: '',
  supplierId: '',
  status: 'DRAFT',
  isActive: true,
  weight: '',
  width: '',
  height: '',
  length: '',
  tagIds: [],
  barcode: '',
  expirationDate: '',
};
