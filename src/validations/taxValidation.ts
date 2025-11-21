import * as Yup from 'yup';

export const taxSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tax name is required')
    .min(3, 'Tax name must be at least 3 characters')
    .max(100, 'Tax name must not exceed 100 characters'),
  rate: Yup.number()
    .required('Tax rate is required')
    .min(0, 'Tax rate must be greater than or equal to 0')
    .max(100, 'Tax rate must not exceed 100%')
    .typeError('Tax rate must be a valid number'),
  type: Yup.string()
    .required('Tax type is required')
    .oneOf(
      ['igst', 'sgst', 'cgst'],
      'Invalid tax type. Must be one of: IGST, SGST, CGST'
    ),
  status: Yup.boolean(),
});

export type TaxFormData = Yup.InferType<typeof taxSchema>;