import * as Yup from 'yup';

export const policySchema = Yup.object().shape({
  name: Yup.string()
    .required('Policy name is required')
    .min(3, 'Policy name must be at least 3 characters')
    .max(100, 'Policy name must not exceed 100 characters'),
  type: Yup.string()
    .required('Policy type is required')
    .oneOf(
      ['return', 'cancellation', 'shipping', 'warranty'],
      'Invalid policy type'
    ),
  content: Yup.string()
    .required('Policy content is required')
    .min(10, 'Policy content must be at least 10 characters'),
  status: Yup.boolean(),
});

export type PolicyFormData = Yup.InferType<typeof policySchema>;
