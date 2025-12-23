import type { PolicyFormData } from 'src/validations';
import type { RootState, AppDispatch } from 'src/store';

import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { policySchema } from 'src/validations';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  createPolicy,
  updatePolicy,
  clearMessages,
  fetchPolicyById,
} from 'src/store/slices/policySlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseAlert,
  BaseButton,
  BaseSwitch,
  BaseTextField,
  BaseTypography,
  BaseRichTextEditor,
  BaseCircularProgress,
  BaseFormControlLabel,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

export function AddPolicyView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isEditMode = Boolean(id);

  const { currentPolicy, loading, error, successMessage } = useSelector(
    (state: RootState) => state.policy
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PolicyFormData>({
    resolver: yupResolver(policySchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      content: '',
      status: true,
    },
  });

  // Fetch policy data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchPolicyById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && currentPolicy) {
      reset({
        name: currentPolicy.name,
        content: currentPolicy.content,
        status: currentPolicy.status,
      });
    }
  }, [currentPolicy, isEditMode, reset]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
        navigate('/policy');
      }, 2000);
    }
  }, [successMessage, dispatch, navigate]);

  const onSubmit = async (data: PolicyFormData) => {
    try {
      const policyData = {
        name: data.name,
        content: data.content,
        status: data.status ?? true,
      };

      if (isEditMode && id) {
        await dispatch(updatePolicy({ ...policyData, id } as any)).unwrap();
      } else {
        await dispatch(createPolicy(policyData as any)).unwrap();
      }
    } catch (err: any) {
      console.error('Failed to save policy:', err);
    }
  };

  const handleCancel = () => {
    navigate('/policy');
  };

  return (
    <DashboardContent>
      {/* Header */}
      <BaseBox display="flex" alignItems="center" mb={5}>
        <BaseBox sx={{ flexGrow: 1 }}>
          <BaseTypography variant="h4" sx={{ mb: 1 }}>
            {isEditMode ? 'Edit Policy' : 'Add New Policy'}
          </BaseTypography>
          <BaseTypography variant="body2" sx={{ color: 'text.secondary' }}>
            {isEditMode
              ? 'Update policy information below'
              : 'Fill in the details to create a new policy'}
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
                Policy Information
              </BaseTypography>

              <BaseBox display="flex" flexDirection="column" gap={3}>
                {/* Policy Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Policy Name"
                      placeholder="e.g., Our Refund Policy"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                {/* Content */}
                <BaseBox>
                  <BaseTypography variant="subtitle2" sx={{ mb: 1 }}>
                    Policy Content <span style={{ color: 'red' }}>*</span>
                  </BaseTypography>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <BaseRichTextEditor
                        value={value}
                        onChange={onChange}
                        placeholder="Enter the policy details..."
                        error={!!errors.content}
                        helperText={errors.content?.message}
                        height={200}
                      />
                    )}
                  />
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
                Inactive policies will not be visible to users
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
                      ? 'Update Policy'
                      : 'Create Policy'}
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
