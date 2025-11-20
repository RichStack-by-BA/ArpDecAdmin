import * as yup from 'yup';

// Add/Edit Category Form Validation Schema
export const categorySchema = yup.object({
  name: yup
    .string()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters'),

  title: yup
    .string()
    .required('Website title is required')
    .min(5, 'Website title must be at least 5 characters')
    .max(150, 'Website title must not exceed 150 characters'),

  description: yup
    .string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters'),

  image: yup
    .mixed()
    .required('Category image is required')
    .test('fileSize', 'Image must be less than 5MB', (value) => {
      if (!value) return false;
      if (typeof value === 'string') return true; // For edit mode with existing URL
      return (value as File).size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return false;
      if (typeof value === 'string') return true; // For edit mode with existing URL
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
        (value as File).type
      );
    }),
});

export type CategoryFormData = {
  name: string;
  title: string;
  description: string;
  image: File | string;
};
