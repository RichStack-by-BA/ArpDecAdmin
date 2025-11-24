import type { RootState, AppDispatch } from 'src/store';

import * as yup from 'yup';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  createUser,
  updateUser,
  clearMessages,
  fetchUserById,
} from 'src/store/slices/usersSlice';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseAlert,
  BaseButton,
  BaseSelect,
  BaseMenuItem,
  BaseTextField,
  BaseInputLabel,
  BaseTypography,
  BaseFormControl,
  BaseCircularProgress,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

interface AdminFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
}

const adminSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Email must be valid'),
  phone: yup.string().optional(),
  password: yup.string().when('$isEditMode', {
    is: false,
    then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
    otherwise: (schema) => schema.optional(),
  }),
  role: yup.string().required('Role is required'),
});

export function AddAdminView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isEditMode = Boolean(id);

  const { currentUser: currentAdmin, loading, error, successMessage } = useSelector(
    (state: RootState) => state.users
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminFormData>({
    resolver: yupResolver(adminSchema) as any,
    mode: 'onChange',
    context: { isEditMode },
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'admin',
    },
  });

  // Fetch admin data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && currentAdmin) {
      reset({
        name: currentAdmin.name,
        email: currentAdmin.email,
        phone: currentAdmin.phone || '',
        role: currentAdmin.role,
      });
    }
  }, [currentAdmin, isEditMode, reset]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
        navigate('/admin');
      }, 2000);
    }
  }, [successMessage, dispatch, navigate]);

  const onSubmit = async (data: AdminFormData) => {
    try {
      const userData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: data.role,
      };

      if (isEditMode && id) {
        await dispatch(updateUser({ ...userData, id })).unwrap();
      } else {
        userData.password = data.password;
        await dispatch(createUser(userData)).unwrap();
      }
    } catch (err: any) {
      console.error('Failed to save admin:', err);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <DashboardContent>
      {/* Header */}
      <BaseBox display="flex" alignItems="center" mb={5}>
        <BaseBox sx={{ flexGrow: 1 }}>
          <BaseTypography variant="h4" sx={{ mb: 1 }}>
            {isEditMode ? 'Edit Admin' : 'Add New Admin'}
          </BaseTypography>
          <BaseTypography variant="body2" sx={{ color: 'text.secondary' }}>
            {isEditMode
              ? 'Update admin information below'
              : 'Fill in the details to create a new admin'}
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
          <BaseGrid size={{ xs: 12, md: 8 }}>
            <BaseCard>
              <BaseBox sx={{ p: 3 }}>
                <BaseTypography variant="h6" sx={{ mb: 3 }}>
                  Admin Information
                </BaseTypography>

                <BaseGrid container spacing={3}>
                  {/* Name */}
                  <BaseGrid size={{ xs: 12 }}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          fullWidth
                          label="Name"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                      )}
                    />
                  </BaseGrid>

                  {/* Email */}
                  <BaseGrid size={{ xs: 12 }}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                      )}
                    />
                  </BaseGrid>

                  {/* Phone */}
                  <BaseGrid size={{ xs: 12 }}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          fullWidth
                          label="Phone (Optional)"
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                      )}
                    />
                  </BaseGrid>

                  {/* Password (only for create) */}
                  {!isEditMode && (
                    <BaseGrid size={{ xs: 12 }}>
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <BaseTextField
                            {...field}
                            fullWidth
                            label="Password"
                            type="password"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            slotProps={{
                              inputLabel: { shrink: true },
                            }}
                          />
                        )}
                      />
                    </BaseGrid>
                  )}

                  {/* Role */}
                  <BaseGrid size={{ xs: 12 }}>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <BaseFormControl fullWidth error={!!errors.role}>
                          <BaseInputLabel shrink>Role</BaseInputLabel>
                          <BaseSelect {...field} label="Role" notched>
                            <BaseMenuItem value="admin">Admin</BaseMenuItem>
                            <BaseMenuItem value="superadmin">Super Admin</BaseMenuItem>
                            <BaseMenuItem value="moderator">Moderator</BaseMenuItem>
                          </BaseSelect>
                          {errors.role && (
                            <BaseTypography
                              variant="caption"
                              sx={{ color: 'error.main', mt: 0.5, ml: 2 }}
                            >
                              {errors.role.message}
                            </BaseTypography>
                          )}
                        </BaseFormControl>
                      )}
                    />
                  </BaseGrid>
                </BaseGrid>
              </BaseBox>
            </BaseCard>
          </BaseGrid>

          {/* Actions */}
          <BaseGrid size={{ xs: 12, md: 4 }}>
            <BaseCard>
              <BaseBox sx={{ p: 3 }}>
                <BaseTypography variant="h6" sx={{ mb: 3 }}>
                  Actions
                </BaseTypography>

                <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <BaseButton
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                      loading ? <BaseCircularProgress size={20} /> : undefined
                    }
                  >
                    {loading ? 'Saving...' : isEditMode ? 'Update Admin' : 'Create Admin'}
                  </BaseButton>

                  <BaseButton
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="inherit"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </BaseButton>
                </BaseBox>
              </BaseBox>
            </BaseCard>
          </BaseGrid>
        </BaseGrid>
      </form>
    </DashboardContent>
  );
}
