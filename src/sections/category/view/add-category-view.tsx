import type { RootState, AppDispatch } from 'src/store';
import type { CategoryFormData } from 'src/validations';

import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { categorySchema } from 'src/validations';
import { DashboardContent } from 'src/layouts/dashboard';
import { uploadImage, clearUploadError } from 'src/store/slices/uploadSlice';
import {
  clearMessages,
  createCategory,
  updateCategory,
  fetchCategoryById,
} from 'src/store/slices/categorySlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseAlert,
  BaseButton,
  BaseTextField,
  BaseTypography,
  BaseCircularProgress,
  BaseSwitch,
  BaseFormControlLabel,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

export function AddCategoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isEditMode = Boolean(id);

  const { categories, currentCategory, loading, error, successMessage } = useSelector(
    (state: RootState) => state.category
  );

  const { loading: uploadLoading, error: uploadError } = useSelector(
    (state: RootState) => state.upload
  );

  const { userDetails } = useSelector((state: RootState) => state.user);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      title: '',
      description: '',
      image: '',
      isActive: true,
    },
  });

  // Clear upload errors on mount
  useEffect(() => {
    dispatch(clearUploadError());
    setUploadErrorMsg('');
  }, [dispatch]);

  // Fetch category data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchCategoryById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && currentCategory) {
      reset({
        name: currentCategory.name,
        title: currentCategory.title || '',
        description: currentCategory.description,
        image: currentCategory.image,
        isActive: currentCategory.isActive ?? true,
      });
      setImagePreview(currentCategory.image);
    }
  }, [currentCategory, isEditMode, reset]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
        navigate('/category');
      }, 2000);
    }
  }, [successMessage, dispatch, navigate]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setUploadErrorMsg('');
      let imageUrl = data.image as string;

      // If there's a new image file, upload it first
      if (imageFile) {
        if (!userDetails?.user?._id) {
          setUploadErrorMsg('User ID not found. Please login again.');
          return;
        }

        try {
          // Upload image and get URL
          imageUrl = await dispatch(
            uploadImage({
              userId: userDetails.user._id,
              file: imageFile,
            })
          ).unwrap();
        } catch (uploadErr: any) {
          setUploadErrorMsg(uploadErr || 'Error uploading image');
          return;
        }
      }

      // Proceed with create/update using the uploaded image URL
      const categoryData = {
        name: data.name,
        title: data.title,
        description: data.description,
        image: imageUrl,
        isActive: data.isActive ?? true,
      };

      if (isEditMode && id) {
        await dispatch(updateCategory({ ...categoryData, id } as any)).unwrap();
      } else {
        await dispatch(createCategory(categoryData as any)).unwrap();
      }
    } catch (err: any) {
      console.error('Failed to save category:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setValue('image', '' as any);
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setValue('image', '' as any);
        return;
      }

      setImageFile(file);
      setValue('image', file as any);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate('/category');
  };

  return (
    <DashboardContent>
      {/* Header */}
      <BaseBox display="flex" alignItems="center" mb={5}>
        <BaseBox sx={{ flexGrow: 1 }}>
          <BaseTypography variant="h4" sx={{ mb: 1 }}>
            {isEditMode ? 'Edit Category' : 'Add New Category'}
          </BaseTypography>
          <BaseTypography variant="body2" sx={{ color: 'text.secondary' }}>
            {isEditMode
              ? 'Update category information below'
              : 'Fill in the details to create a new category'}
          </BaseTypography>
        </BaseBox>
      </BaseBox>

      {/* Alert Messages */}
      {error && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </BaseAlert>
      )}

      {uploadErrorMsg && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {uploadErrorMsg}
        </BaseAlert>
      )}

      {uploadError && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {uploadError}
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
                Basic Information
              </BaseTypography>

              <BaseBox display="flex" flexDirection="column" gap={3}>
                {/* Category Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Category Name"
                      placeholder="e.g., Modern Living Room"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                {/* Website Title */}
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Website Title"
                      placeholder="e.g., Modern Living Room Ideas & Decor"
                      fullWidth
                      required
                      error={!!errors.title}
                      helperText={errors.title?.message}
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
                      placeholder="Describe this category..."
                      fullWidth
                      required
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />

                {/* Is Active */}
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <BaseFormControlLabel
                      control={
                        <BaseSwitch
                          checked={field.value ?? true}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Active Status"
                    />
                  )}
                />
              </BaseBox>
            </BaseCard>
          </BaseGrid>

          {/* Sidebar */}
          <BaseGrid size={{ xs: 12, md: 4 }}>
            {/* Image */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 2 }}>
                Category Image
              </BaseTypography>

              <Controller
                name="image"
                control={control}
                render={({ field: { value, ...field } }) => (
                  <BaseBox>
                    <BaseButton
                      component="label"
                      variant="outlined"
                      fullWidth
                      startIcon={<Iconify icon="solar:upload-bold" />}
                    >
                      Upload Image
                      <input
                        {...field}
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                      />
                    </BaseButton>

                    {errors.image && (
                      <BaseTypography
                        variant="caption"
                        sx={{ color: 'error.main', mt: 1, display: 'block' }}
                      >
                        {errors.image.message as string}
                      </BaseTypography>
                    )}

                    <BaseTypography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                      Max size: 5MB • Formats: JPG, PNG, WEBP
                    </BaseTypography>

                    {imagePreview && (
                      <BaseBox
                        sx={{
                          mt: 2,
                          width: '100%',
                          height: 200,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={() => setImagePreview('')}
                        />
                      </BaseBox>
                    )}
                  </BaseBox>
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
                  disabled={loading || uploadLoading}
                  startIcon={
                    loading || uploadLoading ? (
                      <BaseCircularProgress size={20} />
                    ) : (
                      <Iconify icon={isEditMode ? 'solar:pen-bold' : 'mingcute:add-line'} />
                    )
                  }
                >
                  {loading || uploadLoading
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                      ? 'Update Category'
                      : 'Create Category'}
                </BaseButton>

                <BaseButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleCancel}
                  disabled={loading || uploadLoading}
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
