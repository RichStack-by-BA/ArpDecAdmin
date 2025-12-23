import * as Yup from 'yup';

export const policySchema = Yup.object().shape({
  name: Yup.string()
    .required('Policy name is required')
    .min(3, 'Policy name must be at least 3 characters')
    .max(100, 'Policy name must not exceed 100 characters'),
  content: Yup.string()
    .required('Policy content is required')
    .min(10, 'Policy content must be at least 10 characters'),
  isActive: Yup.boolean(),
});

export type PolicyFormData = Yup.InferType<typeof policySchema>;
