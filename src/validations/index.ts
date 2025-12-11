export { taxSchema } from './taxValidation';
export { offerSchema } from './offerValidation';
export { policySchema } from './policyValidation';
export { categorySchema } from './categoryValidation';
// Central export for all validation schemas
export { addProductSchema } from './productValidation';

export type { TaxFormData } from './taxValidation';
export type { OfferFormData } from './offerValidation';
export type { PolicyFormData } from './policyValidation';
export type { CategoryFormData } from './categoryValidation';
export type { AddProductFormData } from './productValidation';

// Add more validation schemas here as you create them
// Example:
// export { loginSchema, signupSchema } from './authValidation';
// export { addCategorySchema } from './categoryValidation';
// export { addOrderSchema } from './orderValidation';
