import { z } from 'zod';
import { isCurrencyValueValid } from '@/lib/currency';

export const productFormSchema = z
  .object({
    name: z.string().min(2, 'Informe o nome do produto.'),
    sku: z.string().min(3, 'Informe um SKU unico.'),
    shortDescription: z.string().min(5, 'Informe uma descricao curta.').max(180),
    longDescription: z.string().min(10, 'Informe uma descricao completa.'),
    price: z.string().refine(isCurrencyValueValid, 'Use um preco valido.'),
    promotionalPrice: z.string(),
    promotionEndsAt: z.string(),
    cost: z.string().refine(isCurrencyValueValid, 'Use um custo valido.'),
    stockQuantity: z.number().int().min(0, 'O estoque nao pode ser negativo.'),
    categoryId: z.string().min(1, 'Selecione uma categoria.'),
    supplierId: z.string().min(1, 'Selecione um fornecedor.'),
    status: z.enum(['DRAFT', 'READY', 'ARCHIVED']),
    isActive: z.boolean(),
    deactivationReason: z.string(),
    weight: z.string().min(1, 'Informe um peso valido.'),
    width: z.string().min(1, 'Informe uma largura valida.'),
    height: z.string().min(1, 'Informe uma altura valida.'),
    length: z.string().min(1, 'Informe um comprimento valido.'),
    tagIds: z.array(z.string()),
    barcode: z.string(),
    expirationDate: z.string(),
    featureBullets: z.array(z.string().min(3, 'Cada destaque precisa ter ao menos 3 caracteres.')),
    relatedSkus: z.array(z.string()),
  })
  .superRefine((value, ctx) => {
    if (value.promotionalPrice) {
      if (!isCurrencyValueValid(value.promotionalPrice)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Use um preco promocional valido.',
          path: ['promotionalPrice'],
        });
      }

      if (!value.promotionEndsAt) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe a data final da promocao.',
          path: ['promotionEndsAt'],
        });
      }
    }

    if (!value.isActive && !value.deactivationReason.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Explique o motivo da inativacao do produto.',
        path: ['deactivationReason'],
      });
    }

    if (value.status === 'READY' && !value.barcode.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Produtos prontos precisam ter codigo de barras.',
        path: ['barcode'],
      });
    }

    if (value.status === 'READY' && value.featureBullets.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Produtos prontos precisam ter pelo menos um destaque.',
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
