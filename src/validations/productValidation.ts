import * as yup from 'yup';

// Add Product Form Validation Schema
export const addProductSchema = yup.object({
  name: yup
    .string()
    .required('Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters'),

  thumbnail: yup
    .string()
    .url('Must be a valid URL')
    .optional(),

  shortDescription: yup
    .string()
    .max(200, 'Short description must not exceed 200 characters')
    .optional(),

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
    .test('less-than-price', 'Discount price must be less than regular price', function (value) {
      const { price } = this.parent;
      if (!value || !price) return true;
      return value < price;
    })
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError('Discount price must be a valid number')
    .optional(),

  images: yup
    .array()
    .min(1, 'Upload at least one product image')
    .required('Product images are required')
    .default([]),

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

  policies: yup
    .object({
      returnPolicy: yup.string().optional(),
      warranty: yup.string().optional(),
      deliveryInfo: yup.string().optional(),
    })
    .optional(),

  isActive: yup.boolean().default(true),
});

export type AddProductFormData = {
  name: string;
  thumbnail?: string;
  shortDescription?: string;
  description: string;
  selectedCategories: string[];
  price: number;
  discountPrice?: number;
  images: any[];
  colors?: string[];
  specifications?: Array<{ key: string; value: string }>;
  policies?: {
    returnPolicy?: string;
    warranty?: string;
    deliveryInfo?: string;
  };
  isActive: boolean;
};
