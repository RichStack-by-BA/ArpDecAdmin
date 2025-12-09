import * as yup from 'yup';

// Add Product Form Validation Schema
export const addProductSchema = yup.object({
  name: yup
    .string()
    .required('Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters'),

  description: yup
    .string()
    .required('Description is required')
    .test('min-length', 'Description must be at least 50 characters', (value) => {
      if (!value) return false;
      // Strip HTML tags to check actual text length
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      return textContent.length >= 50;
    }),

  selectedCategories: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one category')
    .required('Category selection is required'),

  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be greater than 0')
    .typeError('Price must be a valid number'),

  discountPrice: yup
    .number()
    .positive('Discount price must be greater than 0')
    .test('less-than-price', 'Discount price must be less than regular price', function validateDiscountPrice(value) {
      const { price } = this.parent;
      if (!value || !price) return true;
      return value < price;
    })
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError('Discount price must be a valid number')
    .optional(),

  stock: yup
    .number()
    .when('imageMode', {
      is: 'default',
      then: (schema) => schema.required('Stock is required').integer('Stock must be a whole number').min(0, 'Stock cannot be negative'),
      otherwise: (schema) => schema.notRequired().nullable(),
    })
    .typeError('Stock must be a valid number'),

  taxId: yup
    .string()
    .required('Tax is required'),

  imageMode: yup
    .string()
    .oneOf(['default', 'colors'], 'Invalid image mode')
    .default('default'),

  images: yup
    .array()
    .when('imageMode', {
      is: 'default',
      then: (schema) => schema.min(1, 'Upload at least one product image').required('Product images are required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    })
    .default([]),

  variants: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required('Color name is required'),
        image: yup.mixed().required('Color image is required'),
        stock: yup.number().required('Stock is required').integer().min(0, 'Stock cannot be negative'),
      })
    )
    .when('imageMode', {
      is: 'colors',
      then: (schema) => schema.min(1, 'Add at least one color variant').required('Variants are required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  colors: yup
    .array()
    .of(yup.string().required())
    .optional(),

  specifications: yup
    .array()
    .of(
      yup.object({
        key: yup.string().required(),
        value: yup.string().required(),
      })
    )
    .optional(),

  policy: yup
    .string()
    .optional(),

  isActive: yup.boolean().default(true),
});

export type AddProductFormData = {
  name: string;
  description: string;
  selectedCategories: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  taxId: string;
  imageMode: 'default' | 'colors';
  images: any[];
  variants?: Array<{ name: string; image: File | string; stock: number }>;
  colors?: string[];
  specifications?: Array<{ key: string; value: string }>;
  policy?: string;
  isActive: boolean;
};
