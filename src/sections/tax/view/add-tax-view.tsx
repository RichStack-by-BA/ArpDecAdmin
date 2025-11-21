import type { TaxFormData } from 'src/validations';
import type { RootState, AppDispatch } from 'src/store';

import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { taxSchema } from 'src/validations';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  createTax,
  updateTax,
  fetchTaxById,
  clearMessages,
} from 'src/store/slices/taxSlice';
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

const TAX_TYPES = [
  { value: 'igst', label: 'IGST - Integrated Goods and Services Tax' },
  { value: 'sgst', label: 'SGST - State Goods and Services Tax' },
  { value: 'cgst', label: 'CGST - Central Goods and Services Tax' },
];

export function AddTaxView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isEditMode = Boolean(id);

  const { currentTax, loading, error, successMessage } = useSelector(
    (state: RootState) => state.tax
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaxFormData>({
    resolver: yupResolver(taxSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      rate: 0,
      type: 'igst',
      status: true,
    },
  });

  // Fetch tax data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchTaxById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && currentTax) {
      reset({
        name: currentTax.name,
        rate: currentTax.rate,
        type: currentTax.type,
        status: currentTax.status,
      });
    }
  }, [currentTax, isEditMode, reset]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
        navigate('/tax');
      }, 2000);
    }
  }, [successMessage, dispatch, navigate]);

  const onSubmit = async (data: TaxFormData) => {
    try {
      const taxData = {
        name: data.name,
        rate: Number(data.rate),
        type: data.type as 'igst' | 'sgst' | 'cgst',
        status: data.status ?? true,
      };

      if (isEditMode && id) {
        await dispatch(updateTax({ ...taxData, id } as any)).unwrap();
      } else {
        await dispatch(createTax(taxData as any)).unwrap();
      }
    } catch (err: any) {
      console.error('Failed to save tax:', err);
    }
  };

  const handleCancel = () => {
    navigate('/tax');
  };

  return (
    <DashboardContent>
      {/* Header */}
      <BaseBox display="flex" alignItems="center" mb={5}>
        <BaseBox sx={{ flexGrow: 1 }}>
          <BaseTypography variant="h4" sx={{ mb: 1 }}>
            {isEditMode ? 'Edit Tax' : 'Add New Tax'}
          </BaseTypography>
          <BaseTypography variant="body2" sx={{ color: 'text.secondary' }}>
            {isEditMode
              ? 'Update tax information below'
              : 'Fill in the details to create a new tax'}
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
            <BaseCard sx={{ p: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Tax Information
              </BaseTypography>

              <BaseBox display="flex" flexDirection="column" gap={3}>
                {/* Tax Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Tax Name"
                      placeholder="e.g., IGST 18%"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                {/* Tax Type */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <BaseFormControl fullWidth required error={!!errors.type}>
                      <BaseInputLabel id="tax-type-label">Tax Type</BaseInputLabel>
                      <BaseSelect
                        {...field}
                        labelId="tax-type-label"
                        label="Tax Type"
                      >
                        {TAX_TYPES.map((option) => (
                          <BaseMenuItem key={option.value} value={option.value}>
                            {option.label}
                          </BaseMenuItem>
                        ))}
                      </BaseSelect>
                      {errors.type && (
                        <BaseTypography
                          variant="caption"
                          sx={{ color: 'error.main', mt: 0.5 }}
                        >
                          {errors.type.message}
                        </BaseTypography>
                      )}
                    </BaseFormControl>
                  )}
                />

                {/* Tax Rate */}
                <Controller
                  name="rate"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Tax Rate (%)"
                      placeholder="e.g., 18"
                      type="number"
                      fullWidth
                      required
                      inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.01,
                      }}
                      error={!!errors.rate}
                      helperText={errors.rate?.message || 'Enter the tax rate as a percentage (0-100)'}
                    />
                  )}
                />
              </BaseBox>
            </BaseCard>

            {/* Tax Type Information */}
            <BaseCard sx={{ p: 3, mt: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 2 }}>
                Tax Type Information
              </BaseTypography>
              
              <BaseBox display="flex" flexDirection="column" gap={2}>
                <BaseBox>
                  <BaseTypography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
                    IGST (Integrated Goods and Services Tax)
                  </BaseTypography>
                  <BaseTypography variant="body2" color="text.secondary">
                    Applied on inter-state supply of goods and services. It is levied by the Central Government.
                  </BaseTypography>
                </BaseBox>
                
                <BaseBox>
                  <BaseTypography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
                    SGST (State Goods and Services Tax)
                  </BaseTypography>
                  <BaseTypography variant="body2" color="text.secondary">
                    Applied on intra-state supply of goods and services. It is levied by the State Government.
                  </BaseTypography>
                </BaseBox>
                
                <BaseBox>
                  <BaseTypography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
                    CGST (Central Goods and Services Tax)
                  </BaseTypography>
                  <BaseTypography variant="body2" color="text.secondary">
                    Applied on intra-state supply of goods and services. It is levied by the Central Government.
                  </BaseTypography>
                </BaseBox>
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
                name="status"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <BaseFormControlLabel
                    control={
                      <BaseSwitch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label={value ? 'Active' : 'Inactive'}
                  />
                )}
              />

              <BaseTypography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                Inactive taxes will not be available for selection
              </BaseTypography>
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
                      ? 'Update Tax'
                      : 'Create Tax'}
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

            {/* Tax Rates Guide */}
            <BaseCard sx={{ p: 3, mt: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 2 }}>
                Common Tax Rates
              </BaseTypography>
              
              <BaseBox display="flex" flexDirection="column" gap={1}>
                <BaseTypography variant="body2" color="text.secondary">
                  • 0% - Essential goods
                </BaseTypography>
                <BaseTypography variant="body2" color="text.secondary">
                  • 5% - Household necessities
                </BaseTypography>
                <BaseTypography variant="body2" color="text.secondary">
                  • 12% - Processed foods
                </BaseTypography>
                <BaseTypography variant="body2" color="text.secondary">
                  • 18% - Most goods & services
                </BaseTypography>
                <BaseTypography variant="body2" color="text.secondary">
                  • 28% - Luxury items
                </BaseTypography>
              </BaseBox>
            </BaseCard>
          </BaseGrid>
        </BaseGrid>
      </form>
    </DashboardContent>
  );
}