import * as yup from 'yup';

// Add Product Form Validation Schema
export const addProductSchema = yup.object({
  name: yup
    .string()
    .required('Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters'),

  thumbnail: yup
    .mixed()
    .required('Thumbnail image is required')
    .test('fileSize', 'Thumbnail must be less than 1MB', (value) => {
      if (!value) return false;
      if (typeof value === 'string') return true; // For edit mode with existing URL
      return (value as File).size <= 1 * 1024 * 1024;
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return false;
      if (typeof value === 'string') return true; // For edit mode with existing URL
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
        (value as File).type
      );
    }),

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

  stock: yup
    .number()
    .required('Stock is required')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .typeError('Stock must be a valid number'),

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
  thumbnail: File | string;
  description: string;
  selectedCategories: string[];
  price: number;
  discountPrice?: number;
  stock: number;
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
