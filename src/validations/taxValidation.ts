import * as Yup from 'yup';

export const taxSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tax name is required')
    .min(3, 'Tax name must be at least 3 characters')
    .max(100, 'Tax name must not exceed 100 characters'),
  igst: Yup.number()
    .required('IGST rate is required')
    .min(0, 'IGST rate must be greater than or equal to 0')
    .max(100, 'IGST rate must not exceed 100%')
    .typeError('IGST rate must be a valid number'),
  cgst: Yup.number()
    .required('CGST rate is required')
    .min(0, 'CGST rate must be greater than or equal to 0')
    .max(100, 'CGST rate must not exceed 100%')
    .typeError('CGST rate must be a valid number'),
  sgst: Yup.number()
    .required('SGST rate is required')
    .min(0, 'SGST rate must be greater than or equal to 0')
    .max(100, 'SGST rate must not exceed 100%')
    .typeError('SGST rate must be a valid number'),
  isActive: Yup.boolean().default(true),
});

export type TaxFormData = Yup.InferType<typeof taxSchema>;