import type { OfferFormData } from 'src/validations';
import type { RootState, AppDispatch } from 'src/store';

import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { offerSchema } from 'src/validations';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchProducts } from 'src/store/slices/productSlice';
import { fetchCategories } from 'src/store/slices/categorySlice';
import {
  createOffer,
  updateOffer,
  clearMessages,
  fetchOfferById,
} from 'src/store/slices/offerSlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseAlert,
  BaseButton,
  BaseSelect,
  BaseSwitch,
  BaseMenuItem,
  BaseTextField,
  BaseInputLabel,
  BaseTypography,
  BaseFormControl,
  BaseCircularProgress,
  BaseFormControlLabel,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

export function AddOfferView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isEditMode = Boolean(id);

  const { currentOffer, loading, error, successMessage } = useSelector(
    (state: RootState) => state.offer
  );

  const { products } = useSelector((state: RootState) => state.product);
  const { categories } = useSelector((state: RootState) => state.category);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<OfferFormData>({
    resolver: yupResolver(offerSchema) as any,
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      offerCode: '',
      discountType: 'percentage',
      discountValue: null,
      minPurchaseAmount: null,
      maxDiscountAmount: null,
      validFrom: new Date(),
      validTill: new Date(),
      usageLimitPerUser: null,
      totalUsageLimit: null,
      applicableTo: 'all',
      applicableProducts: [],
      applicableCategories: [],
      isActive: true,
    },
  });

  const discountType = watch('discountType');
  const applicableTo = watch('applicableTo');
  const validFrom = watch('validFrom');

  // Clear maxDiscountAmount when discount type is not percentage
  useEffect(() => {
    if (discountType === 'flat') {
      setValue('maxDiscountAmount', null);
    }
  }, [discountType, setValue]);

  // Fetch products and categories on mount
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 1000 }));
    dispatch(fetchCategories({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch offer data in edit mode
  useEffect(() => {
    if (isEditMode && id && id !== 'undefined') {
      dispatch(fetchOfferById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && currentOffer) {
      reset({
        title: currentOffer.title,
        description: currentOffer.description,
        offerCode: currentOffer.offerCode || '',
        discountType: (currentOffer.discountType as 'percentage' | 'flat') || 'percentage',
        discountValue: currentOffer.discountValue ?? null,
        minPurchaseAmount: currentOffer.minPurchaseAmount || null,
        maxDiscountAmount: currentOffer.maxDiscountAmount || null,
        validFrom: currentOffer.startDate ? new Date(currentOffer.startDate) : new Date(),
        validTill: currentOffer.endDate ? new Date(currentOffer.endDate) : new Date(),
        usageLimitPerUser: currentOffer.usageLimitPerUser || null,
        totalUsageLimit: currentOffer.totalUsageLimit || null,
        applicableTo: (currentOffer.applicableTo as 'all' | 'products' | 'categories') || 'all',
        applicableProducts: currentOffer.applicableProducts || [],
        applicableCategories: currentOffer.applicableCategories || [],
        isActive: currentOffer.isActive ?? true,
      });
    }
  }, [currentOffer, isEditMode, reset]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
        navigate('/offer');
      }, 2000);
    }
  }, [successMessage, dispatch, navigate]);

  const onSubmit = async (data: OfferFormData) => {
    try {
      const offerData: any = {
        title: data.title,
        description: data.description,
        offerCode: data.offerCode,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchaseAmount: data.minPurchaseAmount,
        validFrom: new Date(data.validFrom).toISOString().split('T')[0],
        validTill: new Date(data.validTill).toISOString().split('T')[0],
        usageLimitPerUser: data.usageLimitPerUser,
        totalUsageLimit: data.totalUsageLimit,
        applicableTo: data.applicableTo,
        isActive: data.isActive,
      };

      // Only include maxDiscountAmount for percentage discount type
      if (data.discountType === 'percentage') {
        offerData.maxDiscountAmount = data.maxDiscountAmount;
      }

      // Handle applicable products/categories based on selection
      if (data.applicableTo === 'all') {
        offerData.applicableProducts = [];
        offerData.applicableCategories = [];
      } else if (data.applicableTo === 'products') {
        offerData.applicableProducts = data.applicableProducts || [];
        offerData.applicableCategories = [];
      } else if (data.applicableTo === 'categories') {
        offerData.applicableProducts = [];
        offerData.applicableCategories = data.applicableCategories || [];
      }

      if (isEditMode && id) {
        await dispatch(updateOffer({ ...offerData, id } as any)).unwrap();
      } else {
        await dispatch(createOffer(offerData as any)).unwrap();
      }
    } catch (err: any) {
      console.error('Failed to save offer:', err);
    }
  };

  const handleCancel = () => {
    navigate('/offer');
  };

  // Show loading state when fetching offer data in edit mode
  if (isEditMode && loading && !currentOffer) {
    return (
      <DashboardContent>
        <BaseBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <BaseCircularProgress />
        </BaseBox>
      </DashboardContent>
    );
  }

  // Ensure discountValue is null by default (not 0)
  // If using useForm, set defaultValues.discountValue = null
  // If using useState, setState(null) for discountValue
  // Find the form initialization and update default value for discountValue

  // ...existing code...

  // Find the useForm or useState initialization
  // Example for useForm:
  // const { control, ... } = useForm({
  //   defaultValues: {
  //     ...,
  //     discountValue: null,
  //     ...
  //   }
  // });

  // If already present, update discountValue: 0 to discountValue: null

  // ...existing code...
  return (
    <DashboardContent>
      {/* Header */}
      <BaseBox display="flex" alignItems="center" mb={5}>
        <BaseBox sx={{ flexGrow: 1 }}>
          <BaseTypography variant="h4" sx={{ mb: 1 }}>
            {isEditMode ? 'Edit Offer' : 'Add New Offer'}
          </BaseTypography>
          <BaseTypography variant="body2" sx={{ color: 'text.secondary' }}>
            {isEditMode
              ? 'Update offer information below'
              : 'Fill in the details to create a new offer'}
          </BaseTypography>
        </BaseBox>
      </BaseBox>

      {/* Alert Messages */}
      {error && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </BaseAlert>
      )}

      {successMessage && (
        <BaseAlert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </BaseAlert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <BaseGrid container spacing={3}>
          {/* Main Content */}
          <BaseGrid size={{ xs: 12, md: 8 }}>
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Basic Information
              </BaseTypography>

              <BaseBox display="flex" flexDirection="column" gap={3}>
                {/* Offer Title */}
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Offer Title"
                      placeholder="e.g., Christmas Sale"
                      fullWidth
                      required
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />

                {/* Offer Code */}
                <Controller
                  name="offerCode"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Offer Code"
                      placeholder="e.g., XMAS10"
                      fullWidth
                      required
                      error={!!errors.offerCode}
                      helperText={errors.offerCode?.message}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  )}
                />

                {/* Description */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Description"
                      placeholder="Describe this offer..."
                      fullWidth
                      required
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </BaseBox>
            </BaseCard>

            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Discount Details
              </BaseTypography>

              <BaseBox display="flex" flexDirection="column" gap={3}>
                {/* Discount Type */}
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <BaseFormControl fullWidth required error={!!errors.discountType}>
                      <BaseInputLabel>Discount Type</BaseInputLabel>
                      <BaseSelect {...field} label="Discount Type">
                        <BaseMenuItem value="percentage">Percentage</BaseMenuItem>
                        <BaseMenuItem value="flat">Flat Amount</BaseMenuItem>
                      </BaseSelect>
                      {errors.discountType && (
                        <BaseTypography variant="caption" color="error">
                          {errors.discountType.message}
                        </BaseTypography>
                      )}
                    </BaseFormControl>
                  )}
                />

                {/* Discount Value */}
                <Controller
                  name="discountValue"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Discount Value"
                      placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                      type="number"
                      fullWidth
                      required
                      error={!!errors.discountValue}
                      helperText={errors.discountValue?.message}
                      InputProps={{
                        startAdornment: discountType === 'flat' ? '₹' : undefined,
                        endAdornment: discountType === 'percentage' ? '%' : undefined,
                      }}
                    />
                  )}
                />

                <BaseGrid container spacing={2}>
                  {/* Min Purchase Amount */}
                  <BaseGrid size={{ xs: 12, md: discountType === 'percentage' ? 6 : 12 }}>
                    <Controller
                      name="minPurchaseAmount"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          label="Minimum Purchase Amount"
                          placeholder="e.g., 500"
                          type="number"
                          fullWidth
                          required
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : Number(value));
                          }}
                          error={!!errors.minPurchaseAmount}
                          helperText={errors.minPurchaseAmount?.message}
                          InputProps={{
                            startAdornment: '₹',
                          }}
                        />
                      )}
                    />
                  </BaseGrid>

                  {/* Max Discount Amount - Only for percentage discount */}
                  {discountType === 'percentage' && (
                    <BaseGrid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name="maxDiscountAmount"
                        control={control}
                        render={({ field }) => (
                          <BaseTextField
                            {...field}
                            label="Maximum Discount Amount"
                            placeholder="e.g., 200"
                            type="number"
                            fullWidth
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? null : Number(value));
                            }}
                            error={!!errors.maxDiscountAmount}
                            helperText={errors.maxDiscountAmount?.message || 'Optional'}
                            InputProps={{
                              startAdornment: '₹',
                            }}
                          />
                        )}
                      />
                    </BaseGrid>
                  )}
                </BaseGrid>
              </BaseBox>
            </BaseCard>

            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Validity & Usage
              </BaseTypography>

              <BaseBox display="flex" flexDirection="column" gap={3}>
                <BaseGrid container spacing={2}>
                  {/* Valid From */}
                  <BaseGrid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="validFrom"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          label="Valid From"
                          type="date"
                          fullWidth
                          required
                          value={
                            field.value
                              ? new Date(field.value).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? new Date(value) : null);
                          }}
                          error={!!errors.validFrom}
                          helperText={errors.validFrom?.message}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            min: new Date().toISOString().split('T')[0],
                          }}
                        />
                      )}
                    />
                  </BaseGrid>

                  {/* Valid Till */}
                  <BaseGrid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="validTill"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          label="Valid Till"
                          type="date"
                          fullWidth
                          required
                          value={
                            field.value
                              ? new Date(field.value).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? new Date(value) : null);
                          }}
                          error={!!errors.validTill}
                          helperText={errors.validTill?.message}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            min: validFrom
                              ? new Date(validFrom).toISOString().split('T')[0]
                              : new Date().toISOString().split('T')[0],
                          }}
                        />
                      )}
                    />
                  </BaseGrid>
                </BaseGrid>

                <BaseGrid container spacing={2}>
                  {/* Usage Limit Per User */}
                  <BaseGrid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="usageLimitPerUser"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          label="Usage Limit Per User"
                          placeholder="e.g., 1"
                          type="number"
                          fullWidth
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : Number(value));
                          }}
                          error={!!errors.usageLimitPerUser}
                          helperText={errors.usageLimitPerUser?.message}
                        />
                      )}
                    />
                  </BaseGrid>

                  {/* Total Usage Limit */}
                  <BaseGrid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="totalUsageLimit"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          label="Total Usage Limit"
                          placeholder="e.g., 500"
                          type="number"
                          fullWidth
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : Number(value));
                          }}
                          error={!!errors.totalUsageLimit}
                          helperText={errors.totalUsageLimit?.message}
                        />
                      )}
                    />
                  </BaseGrid>
                </BaseGrid>
              </BaseBox>
            </BaseCard>

            <BaseCard sx={{ p: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Applicability
              </BaseTypography>

              <BaseBox display="flex" flexDirection="column" gap={3}>
                {/* Applicable To */}
                <Controller
                  name="applicableTo"
                  control={control}
                  render={({ field }) => (
                    <BaseFormControl fullWidth required error={!!errors.applicableTo}>
                      <BaseInputLabel>Applicable To</BaseInputLabel>
                      <BaseSelect {...field} label="Applicable To">
                        <BaseMenuItem value="all">All Products & Categories</BaseMenuItem>
                        <BaseMenuItem value="products">Specific Products</BaseMenuItem>
                        <BaseMenuItem value="categories">Specific Categories</BaseMenuItem>
                      </BaseSelect>
                      {errors.applicableTo && (
                        <BaseTypography variant="caption" color="error">
                          {errors.applicableTo.message}
                        </BaseTypography>
                      )}
                    </BaseFormControl>
                  )}
                />

                {/* Applicable Products */}
                {applicableTo === 'products' && (
                  <Controller
                    name="applicableProducts"
                    control={control}
                    render={({ field }) => (
                      <BaseFormControl fullWidth required error={!!errors.applicableProducts}>
                        <BaseInputLabel>Select Products</BaseInputLabel>
                        <BaseSelect
                          {...field}
                          multiple
                          label="Select Products"
                          value={field.value || []}
                        >
                          {products.map((product) => (
                            <BaseMenuItem key={product.id} value={product.id}>
                              {product.name}
                            </BaseMenuItem>
                          ))}
                        </BaseSelect>
                        {errors.applicableProducts && (
                          <BaseTypography variant="caption" color="error">
                            {errors.applicableProducts.message}
                          </BaseTypography>
                        )}
                      </BaseFormControl>
                    )}
                  />
                )}

                {/* Applicable Categories */}
                {applicableTo === 'categories' && (
                  <Controller
                    name="applicableCategories"
                    control={control}
                    render={({ field }) => (
                      <BaseFormControl fullWidth required error={!!errors.applicableCategories}>
                        <BaseInputLabel>Select Categories</BaseInputLabel>
                        <BaseSelect
                          {...field}
                          multiple
                          label="Select Categories"
                          value={field.value || []}
                        >
                          {categories.map((category) => (
                            <BaseMenuItem key={category.id} value={category.id}>
                              {category.name}
                            </BaseMenuItem>
                          ))}
                        </BaseSelect>
                        {errors.applicableCategories && (
                          <BaseTypography variant="caption" color="error">
                            {errors.applicableCategories.message}
                          </BaseTypography>
                        )}
                      </BaseFormControl>
                    )}
                  />
                )}
              </BaseBox>
            </BaseCard>
          </BaseGrid>

          {/* Sidebar */}
          <BaseGrid size={{ xs: 12, md: 4 }}>
            {/* Status */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 2 }}>
                Status
              </BaseTypography>

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <BaseFormControlLabel
                    control={
                      <BaseSwitch
                        checked={field.value !== undefined ? field.value : true}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Active Status"
                  />
                )}
              />
            </BaseCard>

            {/* Action Buttons */}
            <BaseCard sx={{ p: 3 }}>
              <BaseBox display="flex" flexDirection="column" gap={2}>
                <BaseButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <BaseCircularProgress size={20} />
                    ) : (
                      <Iconify icon={isEditMode ? 'solar:pen-bold' : 'mingcute:add-line'} />
                    )
                  }
                >
                  {loading
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                      ? 'Update Offer'
                      : 'Create Offer'}
                </BaseButton>

                <BaseButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleCancel}
                  disabled={loading}
                  startIcon={<Iconify icon="mingcute:close-line" />}
                >
                  Cancel
                </BaseButton>
              </BaseBox>
            </BaseCard>
          </BaseGrid>
        </BaseGrid>
      </form>
    </DashboardContent>
  );
}
