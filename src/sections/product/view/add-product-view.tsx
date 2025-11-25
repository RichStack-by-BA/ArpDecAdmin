import type { RootState, AppDispatch } from 'src/store';

import type { AddProductFormData } from 'src/validations';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { useDispatch, useSelector } from 'react-redux';

import { useForm, Controller, useFieldArray } from 'react-hook-form';

import { useRouter } from 'src/routes/hooks';
import { addProductSchema } from 'src/validations';
import { DashboardContent } from 'src/layouts/dashboard';
import { addProduct } from 'src/store/slices/productSlice';
import { uploadImage } from 'src/store/slices/uploadSlice';
import { fetchCategories } from 'src/store/slices/categorySlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseChip,
  BaseAlert,
  BaseButton,
  BaseSwitch,
  BaseSelect,
  BaseMenuItem,
  BaseTextField,
  BaseTypography,
  BaseIconButton,
  BaseInputLabel,
  BaseFormControl,
  BaseRichTextEditor,
  BaseCircularProgress,
  BaseFormControlLabel,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

export function AddProductView() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);
  const { loading } = useSelector((state: RootState) => state.product);
  const { userDetails } = useSelector((state: RootState) => state.user);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectOpen, setSelectOpen] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 100 }));
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddProductFormData>({
    resolver: yupResolver(addProductSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      thumbnail: '',
      shortDescription: '',
      description: '',
      selectedCategories: [],
      price: 0,
      discountPrice: undefined,
      images: [],
      colors: [''],
      specifications: [{ key: '', value: '' }],
      policies: {
        returnPolicy: '',
        warranty: '',
        deliveryInfo: '',
      },
      isActive: true,
    },
  });

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control,
    name: 'colors' as any,
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: 'specifications',
  });

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate each file size (max 5MB)
      const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      
      if (invalidFiles.length > 0) {
        setError(`${invalidFiles.length} file(s) exceed the 5MB limit. Please select smaller files.`);
        return;
      }
      
      const updatedImages = [...images, ...newFiles];
      setImages(updatedImages);
      setValue('images', updatedImages as any, { shouldValidate: true });
      setError('');
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        setError('Thumbnail image must be less than 1MB');
        setValue('thumbnail', '' as any);
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only image files (JPEG, PNG, WEBP) are allowed for thumbnail');
        setValue('thumbnail', '' as any);
        return;
      }

      setThumbnail(file);
      setValue('thumbnail', file as any);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue('images', newImages as any, { shouldValidate: true });
  };

  const onSubmit = async (data: AddProductFormData) => {
    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress('');

    try {
      if (!userDetails?.user?._id) {
        setError('User ID not found. Please login again.');
        setUploading(false);
        return;
      }

      // Validate thumbnail
      if (!thumbnail) {
        setError('Please upload a thumbnail image.');
        setUploading(false);
        return;
      }

      // Validate images
      if (images.length === 0) {
        setError('Please upload at least one product image.');
        setUploading(false);
        return;
      }

      // Upload thumbnail first
      setUploadProgress('Uploading thumbnail...');
      let thumbnailUrl = '';
      
      try {
        thumbnailUrl = await dispatch(
          uploadImage({
            userId: userDetails.user._id,
            file: thumbnail,
          })
        ).unwrap();
      } catch (uploadErr: any) {
        setError(`Failed to upload thumbnail: ${uploadErr}`);
        setUploading(false);
        return;
      }

      // Upload all images
      setUploadProgress(`Uploading images (0/${images.length})...`);
      const imageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        setUploadProgress(`Uploading images (${i + 1}/${images.length})...`);
        
        try {
          const uploadedUrl = await dispatch(
            uploadImage({
              userId: userDetails.user._id,
              file: images[i],
            })
          ).unwrap();
          
          imageUrls.push(uploadedUrl);
        } catch (uploadErr: any) {
          setError(`Failed to upload image ${i + 1}: ${uploadErr}`);
          setUploading(false);
          return;
        }
      }

      setUploadProgress('Creating product...');

      const payload = {
        name: data.name,
        categories: data.selectedCategories,
        price: data.price,
        discountPrice: data.discountPrice || 0,
        thumbnail: thumbnailUrl,
        description: data.description,
        images: imageUrls,
        colors: data.colors?.filter((c) => c?.trim()) || [],
        specifications: data.specifications
          ?.filter((s) => s?.key && s?.value)
          .map((s) => `${s.key}: ${s.value}`)
          .join(', ') || '',
        policies: `Return Policy: ${data.policies?.returnPolicy || ''} | Warranty: ${data.policies?.warranty || ''} | Delivery: ${data.policies?.deliveryInfo || ''}`,
        isActive: data.isActive,
        createdBy: userDetails.user._id,
      };

      const result = await dispatch(addProduct(payload));

      if (addProduct.fulfilled.match(result)) {
        setSuccess('Product added successfully!');
        setUploadProgress('');
        setTimeout(() => {
          router.push('/products');
        }, 1500);
      } else {
        setError((result.payload as string) || 'Failed to add product');
        setUploadProgress('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the product');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardContent>
      <BaseBox sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BaseIconButton onClick={() => router.push('/products')} sx={{ mr: 1 }}>
          <Iconify icon="eva:arrow-ios-forward-fill" sx={{ transform: 'rotate(180deg)' }} />
        </BaseIconButton>
        <BaseTypography variant="h4">Add New Product</BaseTypography>
      </BaseBox>

      {error && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </BaseAlert>
      )}

      {success && (
        <BaseAlert severity="success" sx={{ mb: 3 }}>
          {success}
        </BaseAlert>
      )}

      {uploadProgress && (
        <BaseAlert severity="info" sx={{ mb: 3 }}>
          {uploadProgress}
        </BaseAlert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <BaseGrid container spacing={3}>
          {/* Basic Information */}
          <BaseGrid size={{ xs: 12, md: 8 }}>
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Basic Information
              </BaseTypography>

              <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      fullWidth
                      label="Product Name"
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name="selectedCategories"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <BaseFormControl fullWidth required error={!!errors.selectedCategories}>
                      <BaseInputLabel id="categories-label">Categories</BaseInputLabel>
                      <BaseSelect
                        {...field}
                        labelId="categories-label"
                        value={value || []}
                        onChange={(e) => {
                          onChange(e.target.value);
                          setSelectOpen(false); // Close dropdown after selection
                        }}
                        open={selectOpen}
                        onOpen={() => setSelectOpen(true)}
                        onClose={() => setSelectOpen(false)}
                        multiple
                        label="Categories"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 48 * 4.5 + 8,
                              width: 250,
                            },
                          },
                        }}
                        renderValue={(selected: unknown) => (
                          <BaseBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value: string) => (
                              <BaseChip
                                key={value}
                                label={
                                  categories.find((cat) => cat.id === value)?.name || value
                                }
                                size="small"
                              />
                            ))}
                          </BaseBox>
                        )}
                      >
                        {categories.length === 0 ? (
                          <BaseMenuItem disabled>No categories available</BaseMenuItem>
                        ) : (
                          categories.map((category) => (
                            <BaseMenuItem key={category.id} value={category.id}>
                              {category.name}
                            </BaseMenuItem>
                          ))
                        )}
                      </BaseSelect>
                      {errors.selectedCategories && (
                        <BaseTypography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                          {errors.selectedCategories.message}
                        </BaseTypography>
                      )}
                    </BaseFormControl>
                  )}
                />

                <BaseGrid container spacing={2}>
                  <BaseGrid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          fullWidth
                          label="Price"
                          type="number"
                          required
                          error={!!errors.price}
                          helperText={errors.price?.message}
                        />
                      )}
                    />
                  </BaseGrid>
                  <BaseGrid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="discountPrice"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          fullWidth
                          label="Discount Price"
                          type="number"
                          error={!!errors.discountPrice}
                          helperText={errors.discountPrice?.message}
                        />
                      )}
                    />
                  </BaseGrid>
                </BaseGrid>

                <Controller
                  name="thumbnail"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <BaseBox>
                      <BaseButton
                        component="label"
                        variant="outlined"
                        fullWidth
                        startIcon={<Iconify icon="solar:upload-bold" />}
                      >
                        Upload Thumbnail
                        <input
                          {...field}
                          type="file"
                          hidden
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleThumbnailChange}
                        />
                      </BaseButton>

                      {errors.thumbnail && (
                        <BaseTypography
                          variant="caption"
                          sx={{ color: 'error.main', mt: 1, display: 'block' }}
                        >
                          {errors.thumbnail.message as string}
                        </BaseTypography>
                      )}

                      <BaseTypography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                        Max size: 1MB • Formats: JPG, PNG, WEBP
                      </BaseTypography>

                      {thumbnailPreview && (
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
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={() => setThumbnailPreview('')}
                          />
                        </BaseBox>
                      )}
                    </BaseBox>
                  )}
                />

                <Controller
                  name="shortDescription"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      fullWidth
                      label="Short Description"
                      multiline
                      rows={2}
                      error={!!errors.shortDescription}
                      helperText={errors.shortDescription?.message}
                    />
                  )}
                />

                <BaseBox>
                  <BaseTypography variant="subtitle2" sx={{ mb: 1 }}>
                    Description *
                  </BaseTypography>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <BaseRichTextEditor
                        {...field}
                        placeholder="Enter detailed product description with rich formatting..."
                        helperText={errors.description?.message || "Use the toolbar to format your text. Supports headings, bold, italic, lists, colors, and links."}
                        error={!!errors.description}
                        height={250}
                      />
                    )}
                  />
                </BaseBox>
              </BaseBox>
            </BaseCard>

            {/* Images */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <BaseTypography variant="h6">Product Images *</BaseTypography>
                <BaseButton
                  size="small"
                  component="label"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Upload Images
                  <input type="file" hidden multiple accept="image/*" onChange={handleAddImage} />
                </BaseButton>
              </BaseBox>
              {errors.images && (
                <BaseTypography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                  {errors.images.message}
                </BaseTypography>
              )}
              <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Maximum file size: 5MB per image. Supported formats: JPEG, PNG, WEBP
              </BaseTypography>
              <BaseBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {images.map((image, index) => (
                  <BaseBox
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <BaseIconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' },
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </BaseIconButton>
                  </BaseBox>
                ))}
                {images.length === 0 && (
                  <BaseTypography variant="body2" color="text.secondary">
                    No images uploaded yet. Click &quot;Upload Images&quot; to add product images.
                  </BaseTypography>
                )}
              </BaseBox>
            </BaseCard>

            {/* Colors */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <BaseTypography variant="h6">Color Options</BaseTypography>
                <BaseButton
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => appendColor('')}
                >
                  Add Color
                </BaseButton>
              </BaseBox>
              <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {colorFields.map((field, index) => (
                  <BaseBox key={field.id} sx={{ display: 'flex', gap: 1 }}>
                    <Controller
                      name={`colors.${index}`}
                      control={control}
                      render={({ field: colorField }) => (
                        <BaseTextField
                          {...colorField}
                          fullWidth
                          label={`Color URL ${index + 1}`}
                        />
                      )}
                    />
                    {colorFields.length > 1 && (
                      <BaseIconButton color="error" onClick={() => removeColor(index)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </BaseIconButton>
                    )}
                  </BaseBox>
                ))}
              </BaseBox>
            </BaseCard>

            {/* Specifications */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <BaseTypography variant="h6">Specifications</BaseTypography>
                <BaseButton
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => appendSpec({ key: '', value: '' })}
                >
                  Add Specification
                </BaseButton>
              </BaseBox>
              <BaseTypography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2, display: 'block' }}
              >
                Add product specifications as key-value pairs.
              </BaseTypography>
              <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {specFields.map((field, index) => (
                  <BaseBox key={field.id} sx={{ display: 'flex', gap: 1 }}>
                    <Controller
                      name={`specifications.${index}.key`}
                      control={control}
                      render={({ field: specField }) => (
                        <BaseTextField {...specField} label="Key" sx={{ flex: 1 }} />
                      )}
                    />
                    <Controller
                      name={`specifications.${index}.value`}
                      control={control}
                      render={({ field: specField }) => (
                        <BaseTextField {...specField} label="Value" sx={{ flex: 1 }} />
                      )}
                    />
                    {specFields.length > 1 && (
                      <BaseIconButton color="error" onClick={() => removeSpec(index)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </BaseIconButton>
                    )}
                  </BaseBox>
                ))}
              </BaseBox>
            </BaseCard>

            {/* Policies */}
            <BaseCard sx={{ p: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Policies
              </BaseTypography>
              <BaseTypography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2, display: 'block' }}
              >
                Define product policies for returns, warranty, and delivery information.
              </BaseTypography>
              <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <BaseBox>
                  <BaseTypography variant="subtitle2" sx={{ mb: 1 }}>
                    Return Policy
                  </BaseTypography>
                  <Controller
                    name="policies.returnPolicy"
                    control={control}
                    render={({ field }) => (
                      <BaseRichTextEditor
                        {...field}
                        placeholder="e.g., 10-day replacement policy from the date of delivery"
                        height={150}
                      />
                    )}
                  />
                </BaseBox>

                <BaseBox>
                  <BaseTypography variant="subtitle2" sx={{ mb: 1 }}>
                    Warranty
                  </BaseTypography>
                  <Controller
                    name="policies.warranty"
                    control={control}
                    render={({ field }) => (
                      <BaseRichTextEditor
                        {...field}
                        placeholder="e.g., 1-year manufacturer warranty"
                        height={150}
                      />
                    )}
                  />
                </BaseBox>

                <BaseBox>
                  <BaseTypography variant="subtitle2" sx={{ mb: 1 }}>
                    Delivery Info
                  </BaseTypography>
                  <Controller
                    name="policies.deliveryInfo"
                    control={control}
                    render={({ field }) => (
                      <BaseRichTextEditor
                        {...field}
                        placeholder="e.g., Delivery in 3-5 business days"
                        height={150}
                      />
                    )}
                  />
                </BaseBox>
              </BaseBox>
            </BaseCard>
          </BaseGrid>

          {/* Sidebar */}
          <BaseGrid size={{ xs: 12, md: 4 }}>
            <BaseCard sx={{ p: 3, position: 'sticky', top: 24 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Publish
              </BaseTypography>

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <BaseFormControlLabel
                    control={<BaseSwitch {...field} checked={field.value} />}
                    label="Active Status"
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <BaseBox sx={{ display: 'flex', gap: 2 }}>
                <BaseButton
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push('/products')}
                  disabled={loading || uploading}
                >
                  Cancel
                </BaseButton>
                <BaseButton fullWidth variant="contained" type="submit" disabled={loading || uploading}>
                  {loading || uploading ? <BaseCircularProgress size={24} /> : 'Add Product'}
                </BaseButton>
              </BaseBox>
            </BaseCard>
          </BaseGrid>
        </BaseGrid>
      </form>
    </DashboardContent>
  );
}
