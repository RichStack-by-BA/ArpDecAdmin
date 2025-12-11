import * as yup from 'yup';

// Add/Edit Offer Form Validation Schema
export const offerSchema = yup.object({
  title: yup
    .string()
    .required('Offer title is required')
    .min(5, 'Offer title must be at least 5 characters')
    .max(150, 'Offer title must not exceed 150 characters'),

  description: yup
    .string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters'),

  offerCode: yup
    .string()
    .required('Offer code is required')
    .min(3, 'Offer code must be at least 3 characters')
    .max(20, 'Offer code must not exceed 20 characters')
    .matches(/^[A-Z0-9]+$/, 'Offer code must be uppercase letters and numbers only'),

  discountType: yup
    .string()
    .required('Discount type is required')
    .oneOf(['percentage', 'flat'], 'Invalid discount type'),

  discountValue: yup
    .number()
    .required('Discount value is required')
    .min(0, 'Discount value must be at least 0')
    .when('discountType', {
      is: 'percentage',
      then: (schema) => schema.max(100, 'Percentage cannot exceed 100%'),
    }),

  minPurchaseAmount: yup
    .number()
    .required('Minimum purchase amount is required')
    .min(0, 'Minimum purchase amount must be at least 0'),

  maxDiscountAmount: yup
    .number()
    .min(0, 'Maximum discount amount must be at least 0')
    .when('discountType', {
      is: 'percentage',
      then: (schema) => schema.nullable().transform((value, originalValue) => 
        originalValue === '' ? null : value
      ),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),

  validFrom: yup
    .date()
    .required('Valid from date is required')
    .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Valid from date must be today or in the future'),

  validTill: yup
    .date()
    .required('Valid till date is required')
    .min(yup.ref('validFrom'), 'Valid till cannot be before valid from date'),

  usageLimitPerUser: yup
    .number()
    .min(1, 'Usage limit per user must be at least 1')
    .optional()
    .nullable()
    .transform((value, originalValue) => 
      originalValue === '' ? null : value
    ),

  totalUsageLimit: yup
    .number()
    .min(1, 'Total usage limit must be at least 1')
    .optional()
    .nullable()
    .transform((value, originalValue) => 
      originalValue === '' ? null : value
    ),

  applicableTo: yup
    .string()
    .required('Applicable to is required')
    .oneOf(['all', 'products', 'categories'], 'Invalid selection'),

  applicableProducts: yup
    .array()
    .when('applicableTo', {
      is: 'products',
      then: (schema) => schema.min(1, 'Select at least one product').required('Products are required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  applicableCategories: yup
    .array()
    .when('applicableTo', {
      is: 'categories',
      then: (schema) => schema.min(1, 'Select at least one category').required('Categories are required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  isActive: yup
    .boolean()
    .default(true),
});

export type OfferFormData = {
  title: string;
  description: string;
  offerCode: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  validFrom: Date;
  validTill: Date;
  usageLimitPerUser?: number | null;
  totalUsageLimit?: number | null;
  applicableTo: 'all' | 'products' | 'categories';
  applicableProducts?: string[];
  applicableCategories?: string[];
  isActive?: boolean;
};
