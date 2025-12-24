import type { RootState, AppDispatch } from 'src/store';

import type { AddProductFormData } from 'src/validations';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { yupResolver } from '@hookform/resolvers/yup';

import { useForm, Controller } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'src/routes/hooks';
import { addProductSchema } from 'src/validations';
import { fetchTaxes } from 'src/store/slices/taxSlice';
import { DashboardContent } from 'src/layouts/dashboard';
import { uploadImage } from 'src/store/slices/uploadSlice';
import { fetchPolicies } from 'src/store/slices/policySlice';
import { fetchCategories } from 'src/store/slices/categorySlice';
import { updateProduct, fetchProductById, clearSelectedProduct } from 'src/store/slices/productSlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseChip,
  BaseAlert,
  BaseRadio,
  BaseButton,
  BaseSwitch,
  BaseSelect,
  BaseMenuItem,
  BaseTextField,
  BaseTypography,
  BaseIconButton,
  BaseInputLabel,
  BaseRadioGroup,
  BaseFormControl,
  BaseRichTextEditor,
  BaseCircularProgress,
  BaseFormControlLabel,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

export function EditProductView() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);
  const { loading, selectedProduct, productLoading } = useSelector((state: RootState) => state.product);
  const { userDetails } = useSelector((state: RootState) => state.user);
  const { taxes } = useSelector((state: RootState) => state.tax);
  const { policies } = useSelector((state: RootState) => state.policy);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Array<{ name: string; images: File[]; imagePreviews: string[]; stock: number | string; existingImages?: string[] }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectOpen, setSelectOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Reset dataLoaded when productId changes
  useEffect(() => {
    setDataLoaded(false);
  }, [productId]);

  // Fetch product data on mount
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
    dispatch(fetchCategories({ page: 1, limit: 100 }));
    dispatch(fetchTaxes({ page: 1, limit: 100 }));
    dispatch(fetchPolicies({ page: 1, limit: 100 }));

    return () => {
      dispatch(clearSelectedProduct());
      setDataLoaded(false); // Reset dataLoaded when component unmounts
    };
  }, [dispatch, productId]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<AddProductFormData>({
    resolver: yupResolver(addProductSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      selectedCategories: [],
      price: undefined,
      discountPrice: undefined,
      stock: undefined,
      taxId: '',
      imageMode: 'default',
      images: [],
      variants: [],
      specifications: '',
      policy: '',
      isActive: true,
    },
  });

  const imageMode = watch('imageMode');

  // Sync form's images and variants fields with local state for validation
  useEffect(() => {
    if (imageMode === 'default') {
      // Combine new and existing images for validation
      setValue('images', [...images, ...existingImages]);
    } else if (imageMode === 'colors') {
      // For validation, pass both new and existing images as 'images' and 'existingImages', cast as any for react-hook-form
      setValue(
        'variants',
        variants.map(v => ({
          name: v.name,
          images: v.images,
          existingImages: v.existingImages,
          stock: typeof v.stock === 'string' ? Number(v.stock) : v.stock,
        })) as any
      );
    }
  }, [imageMode, images, existingImages, variants, setValue]);

  // Sync variants state with form data
  useEffect(() => {
    // Only clear images and existingImages on mode change
    setImages([]);
    setExistingImages([]);
    if (imageMode === 'colors') {
      // Prefill variants from product data if available
      if (selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0) {
        const loadedVariants = selectedProduct.variants.map((variant: any) => ({
          name: variant.name || '',
          images: [],
          imagePreviews: [],
          stock: variant.stock || 0,
          existingImages: variant.images || [],
        }));
        setVariants(loadedVariants);
      } else {
        setVariants([]);
      }
    } else if (imageMode === 'default') {
      setVariants([]);
      setValue('variants', []);
      // If switching from variants to default, set existingImages from selectedProduct.images if available
      if (selectedProduct && selectedProduct.images) {
        setExistingImages(selectedProduct.images);
      }
    }
  }, [imageMode, setValue, selectedProduct]);

  // Populate form when product data is loaded
  useEffect(() => {
    if (selectedProduct && !dataLoaded && policies.length > 0) {
      // Determine image mode based on variants
      const hasVariants = selectedProduct.variants && selectedProduct.variants.length > 0;
      const mode: 'default' | 'colors' = hasVariants ? 'colors' : 'default';

      const formData: Partial<AddProductFormData> = {
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        selectedCategories: Array.isArray(selectedProduct.categories) 
          ? selectedProduct.categories.map((cat) => typeof cat === 'string' ? cat : cat._id)
          : [],
        price: selectedProduct.price,
        discountPrice: selectedProduct.discountPrice || undefined,
        stock: selectedProduct.stock || undefined,
        taxId: selectedProduct.taxId || '',
        imageMode: mode,
        images: [],
        variants: [],
        specifications: selectedProduct.specifications || '',
        policy: selectedProduct.policy || '',
        isActive: selectedProduct.isActive,
      };

      reset(formData);

      // Also explicitly set policy value to ensure it's selected
      if (selectedProduct.policy) {
        setValue('policy', selectedProduct.policy);
      }

      // Set existing images for default mode
      if (!hasVariants && selectedProduct.images) {
        setExistingImages(selectedProduct.images);
      }

      // Set existing variants for colors mode
      if (hasVariants && selectedProduct.variants) {
        const loadedVariants = selectedProduct.variants.map((variant: any) => ({
          name: variant.name || '',
          images: [],
          imagePreviews: [],
          stock: variant.stock || 0,
          existingImages: variant.images || [],
        }));
        setVariants(loadedVariants);
      }

      setDataLoaded(true);
    }
  }, [selectedProduct, dataLoaded, policies, reset, setValue]);

  // Add variant
  const handleAddVariant = () => {
    setVariants([...variants, { name: '', images: [], imagePreviews: [], stock: 0, existingImages: [] }]);
  };

  // Remove variant
  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  // Handle variant field change
  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Handle variant image change
  const handleVariantImageChange = (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    if (newFiles.length === 0) return;

    const updatedVariants = [...variants];
    updatedVariants[index].images = [...updatedVariants[index].images, ...newFiles];

    // Create previews for all new files
    const previewPromises = newFiles.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }));

    Promise.all(previewPromises).then(previews => {
      updatedVariants[index].imagePreviews = [...updatedVariants[index].imagePreviews, ...previews];
      setVariants(updatedVariants);
    });
  };

  // Remove variant image
  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].images.splice(imageIndex, 1);
    updated[variantIndex].imagePreviews.splice(imageIndex, 1);
    setVariants(updated);
  };

  // Remove existing variant image
  const handleRemoveExistingVariantImage = (variantIndex: number, imageIndex: number) => {
    const updated = [...variants];
    if (Array.isArray(updated[variantIndex].existingImages)) {
      updated[variantIndex].existingImages = updated[variantIndex].existingImages.filter((_, i) => i !== imageIndex);
    }
    setVariants(updated);
  };

  // Remove existing image for default mode
  const handleRemoveExistingImage = (index: number) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const onSubmit = async (data: AddProductFormData) => {
    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress('Starting update...');

    try {
      // Validate images for default mode
      if (imageMode === 'default') {
        // Combine new and existing images for validation
        setValue('images', [...images, ...existingImages]);
      } else if (imageMode === 'colors') {
        // For react-hook-form, setValue must match the type expected in AddProductFormData
        // The schema expects { name, image, stock }, but for validation, we need to pass images and existingImages
        // So, for validation, we can cast to any to satisfy TypeScript, since the schema will handle the check
        setValue(
          'variants',
          variants.map(v => ({
            name: v.name,
            images: v.images,
            existingImages: v.existingImages,
            stock: typeof v.stock === 'string' ? Number(v.stock) : v.stock,
          })) as any
        );
        for (const variant of variants) {
          if (!variant.name || variant.name.trim() === '') {
            setError('All variants must have a name.');
            setUploading(false);
            return;
          }
          if (variant.images.length === 0 && (!variant.existingImages || variant.existingImages.length === 0)) {
            setError(`Variant "${variant.name}" must have at least one image.`);
            setUploading(false);
            return;
          }
        }
      }

      const imageUrls: string[] = [];
      const variantsData: Array<{ name: string; images: string[]; stock: number }> = [];

      // Handle default mode - upload new images
      if (data.imageMode === 'default') {
        // Keep existing images
        imageUrls.push(...existingImages);

        // Upload new images
        if (images.length > 0) {
          setUploadProgress(`Uploading images (0/${images.length})...`);
          
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
        }
      } 
      // Handle colors mode - upload variant images
      else if (data.imageMode === 'colors') {
        // Upload variant images
        const totalImagesToUpload = variants.reduce((sum, v) => sum + v.images.length, 0);
        let uploadedCount = 0;
        
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          const uploadedUrls: string[] = [];
          
          // Keep existing images
          if (variant.existingImages) {
            uploadedUrls.push(...variant.existingImages);
          }

          // Upload new images
          for (let j = 0; j < variant.images.length; j++) {
            uploadedCount++;
            setUploadProgress(`Uploading variant images (${uploadedCount}/${totalImagesToUpload})...`);
            
            try {
              const uploadedUrl = await dispatch(
                uploadImage({
                  userId: userDetails.user._id,
                  file: variant.images[j],
                })
              ).unwrap();
              
              uploadedUrls.push(uploadedUrl);
            } catch (uploadErr: any) {
              setError(`Failed to upload variant ${i + 1} image ${j + 1}: ${uploadErr}`);
              setUploading(false);
              return;
            }
          }
          
          variantsData.push({
            name: variant.name,
            images: uploadedUrls,
            stock: Number(variant.stock) || 0,
          });
        }
      }

      setUploadProgress('Updating product...');

      const payload: any = {
        name: data.name,
        categories: data.selectedCategories,
        price: data.price,
        discountPrice: data.discountPrice || 0,
        taxId: data.taxId,
        description: data.description,
        specifications: data.specifications || '',
        isActive: data.isActive,
      };

      // Add stock and images for default mode
      if (data.imageMode === 'default') {
        payload.stock = data.stock;
        payload.images = imageUrls;
      } 
      // Add variants for colors mode
      else if (data.imageMode === 'colors') {
        payload.variants = variantsData;
      }

      // Add policy only if selected
      if (data.policy) {
        payload.policy = data.policy;
      }

      const result = await dispatch(updateProduct({ productId, productData: payload }));

      if (updateProduct.fulfilled.match(result)) {
        setSuccess('Product updated successfully!');
        setUploadProgress('');
        setTimeout(() => {
          router.push('/products');
        }, 1500);
      } else {
        setError(result.payload as string || 'Failed to update product');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  if (productLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <BaseBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <BaseCircularProgress />
        </BaseBox>
      </DashboardContent>
    );
  }

  if (!selectedProduct) {
    return (
      <DashboardContent maxWidth="xl">
        <BaseAlert severity="error">Product not found</BaseAlert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <BaseBox sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <BaseIconButton onClick={() => router.push('/products')} sx={{ mr: 1 }} disabled={uploading}>
          <Iconify icon="eva:arrow-ios-forward-fill" sx={{ transform: 'rotate(180deg)' }} />
        </BaseIconButton>
        <BaseTypography variant="h4">Edit Product</BaseTypography>
      </BaseBox>

      {uploading && (
        <BaseAlert severity="info" sx={{ mb: 3 }} icon={<BaseCircularProgress size={20} />}>
          {uploadProgress || 'Processing...'}
        </BaseAlert>
      )}

      {error && (
        <BaseAlert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </BaseAlert>
      )}

      {success && (
        <BaseAlert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </BaseAlert>
      )}

      <form 
        onSubmit={(e) => {
          handleSubmit(onSubmit, (validationErrors) => {
            // Show specific variant image error if present
            let errorMsg = 'Please fix the validation errors before submitting.';
            if (validationErrors?.variants && Array.isArray(validationErrors.variants)) {
              for (let i = 0; i < validationErrors.variants.length; i++) {
                const variantError = validationErrors.variants[i];
                if (variantError && variantError.message) {
                  errorMsg = variantError.message;
                  break;
                }
              }
            }
            setError(errorMsg);
          })(e);
        }}
      >
        <BaseGrid container spacing={3}>
          {/* Main Product Information */}
          <BaseGrid size={{ xs: 12, md: 8 }}>
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Product Information
              </BaseTypography>

              <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Product Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <BaseTextField
                      {...field}
                      label="Product Name"
                      placeholder="Enter product name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={uploading}
                      fullWidth
                    />
                  )}
                />

                {/* Description */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <BaseBox>
                      <BaseInputLabel sx={{ mb: 1 }}>Description</BaseInputLabel>
                      <BaseRichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter product description..."
                      />
                      {errors.description && (
                        <BaseTypography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                          {errors.description.message}
                        </BaseTypography>
                      )}
                    </BaseBox>
                  )}
                />

                {/* Categories */}
                <Controller
                  name="selectedCategories"
                  control={control}
                  render={({ field }) => (
                    <BaseFormControl fullWidth error={!!errors.selectedCategories}>
                      <BaseInputLabel>Categories</BaseInputLabel>
                      <BaseSelect
                        {...field}
                        multiple
                        label="Categories"
                        disabled={uploading}
                        open={selectOpen}
                        onOpen={() => setSelectOpen(true)}
                        onClose={() => setSelectOpen(false)}
                        renderValue={(selected) => (
                          <BaseBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => {
                              const category = categories.find((c) => c.id === value);
                              return <BaseChip key={value} label={category?.name || value} size="small" />;
                            })}
                          </BaseBox>
                        )}
                      >
                        {categories.map((category) => (
                          <BaseMenuItem key={category.id} value={category.id}>
                            {category.name}
                          </BaseMenuItem>
                        ))}
                      </BaseSelect>
                      {errors.selectedCategories && (
                        <BaseTypography color="error" variant="caption" sx={{ mt: 0.5 }}>
                          {errors.selectedCategories.message}
                        </BaseTypography>
                      )}
                    </BaseFormControl>
                  )}
                />
              </BaseBox>
            </BaseCard>

            {/* Pricing */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Pricing
              </BaseTypography>

              <BaseGrid container spacing={2}>
                <BaseGrid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <BaseTextField
                        {...field}
                        label="Regular Price"
                        type="number"
                        placeholder="0.00"
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        disabled={uploading}
                        fullWidth
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
                        label="Discount Price"
                        type="number"
                        placeholder="0.00"
                        error={!!errors.discountPrice}
                        helperText={errors.discountPrice?.message}
                        disabled={uploading}
                        fullWidth
                      />
                    )}
                  />
                </BaseGrid>

                <BaseGrid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="taxId"
                    control={control}
                    render={({ field }) => (
                      <BaseFormControl fullWidth error={!!errors.taxId}>
                        <BaseInputLabel>Tax</BaseInputLabel>
                        <BaseSelect {...field} label="Tax" disabled={uploading}>
                          {taxes.map((tax) => (
                            <BaseMenuItem key={tax.id} value={tax.id}>
                              {tax.name} (IGST: {tax.igst}%, CGST: {tax.cgst}%, SGST: {tax.sgst}%)
                            </BaseMenuItem>
                          ))}
                        </BaseSelect>
                        {errors.taxId && (
                          <BaseTypography color="error" variant="caption" sx={{ mt: 0.5 }}>
                            {errors.taxId.message}
                          </BaseTypography>
                        )}
                      </BaseFormControl>
                    )}
                  />
                </BaseGrid>

                <BaseGrid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="policy"
                    control={control}
                    render={({ field }) => (
                      <BaseFormControl fullWidth error={!!errors.policy}>
                        <BaseInputLabel>Policy (Optional)</BaseInputLabel>
                        <BaseSelect {...field} label="Policy (Optional)" disabled={uploading}>
                          <BaseMenuItem value="">
                            <em>None</em>
                          </BaseMenuItem>
                          {policies.map((policy) => (
                            <BaseMenuItem key={policy.id} value={policy.id}>
                              {policy.name}
                            </BaseMenuItem>
                          ))}
                        </BaseSelect>
                      </BaseFormControl>
                    )}
                  />
                </BaseGrid>
              </BaseGrid>
            </BaseCard>

            {/* Images & Variants */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Images & Variants
              </BaseTypography>

              <Controller
                name="imageMode"
                control={control}
                render={({ field }) => (
                  <BaseFormControl component="fieldset" sx={{ mb: 3 }}>
                    <BaseRadioGroup {...field} row>
                      <BaseFormControlLabel
                        value="default"
                        control={<BaseRadio />}
                        label="Default (Multiple Images)"
                        disabled={uploading}
                      />
                      <BaseFormControlLabel
                        value="colors"
                        control={<BaseRadio />}
                        label="Add Colors (Variants)"
                        disabled={uploading}
                      />
                    </BaseRadioGroup>
                  </BaseFormControl>
                )}
              />

              {/* Default Mode - Images */}
              {imageMode === 'default' && (
                <BaseBox>
                  <BaseBox sx={{ mb: 2 }}>
                    <Controller
                      name="stock"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          {...field}
                          label="Stock Quantity"
                          type="number"
                          placeholder="0"
                          error={!!errors.stock}
                          helperText={errors.stock?.message}
                          disabled={uploading}
                          fullWidth
                          sx={{ maxWidth: 300 }}
                        />
                      )}
                    />
                  </BaseBox>

                  <BaseButton
                    variant="outlined"
                    component="label"
                    disabled={uploading}
                    startIcon={<Iconify icon="mingcute:add-line" />}
                  >
                    Upload New Images
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          setImages(Array.from(files));
                        }
                      }}
                    />
                  </BaseButton>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <BaseBox sx={{ mt: 2 }}>
                      <BaseTypography variant="subtitle2" sx={{ mb: 1 }}>
                        Existing Images
                      </BaseTypography>
                      <BaseBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                        {existingImages.map((url, idx) => (
                          <BaseBox
                            key={idx}
                            sx={{
                              position: 'relative',
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              aspectRatio: '1',
                            }}
                          >
                            <BaseBox
                              component="img"
                              src={url}
                              alt={`Existing ${idx + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <BaseIconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveExistingImage(idx)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'error.lighter' },
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                            </BaseIconButton>
                          </BaseBox>
                        ))}
                      </BaseBox>
                    </BaseBox>
                  )}

                  {/* New Images Preview */}
                  {images.length > 0 && (
                    <BaseBox sx={{ mt: 2 }}>
                      <BaseTypography variant="subtitle2" sx={{ mb: 1 }}>
                        New Images ({images.length})
                      </BaseTypography>
                      <BaseBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                        {images.map((file, idx) => (
                          <BaseBox
                            key={idx}
                            sx={{
                              position: 'relative',
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              aspectRatio: '1',
                            }}
                          >
                            <BaseBox
                              component="img"
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <BaseIconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const updated = images.filter((_, i) => i !== idx);
                                setImages(updated);
                              }}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'error.lighter' },
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                            </BaseIconButton>
                          </BaseBox>
                        ))}
                      </BaseBox>
                    </BaseBox>
                  )}
                </BaseBox>
              )}

              {/* Colors Mode - Variants */}
              {imageMode === 'colors' && (
                <BaseBox>
                  <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <BaseTypography variant="subtitle2">Color Variants</BaseTypography>
                    <BaseButton
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={handleAddVariant}
                      disabled={uploading}
                    >
                      Add Variant
                    </BaseButton>
                  </BaseBox>

                  {variants.map((variant, variantIndex) => (
                    <BaseBox
                      key={variantIndex}
                      sx={{
                        mb: 3,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <BaseTypography variant="subtitle2">Variant {variantIndex + 1}</BaseTypography>
                        <BaseIconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveVariant(variantIndex)}
                          disabled={uploading}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </BaseIconButton>
                      </BaseBox>

                      <BaseGrid container spacing={2}>
                        <BaseGrid size={{ xs: 12, sm: 6 }}>
                          <BaseTextField
                            label="Color Name"
                            value={variant.name}
                            onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                            placeholder="e.g., Black, White"
                            disabled={uploading}
                            fullWidth
                          />
                        </BaseGrid>

                        <BaseGrid size={{ xs: 12, sm: 6 }}>
                          <BaseTextField
                            label="Stock Quantity"
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(variantIndex, 'stock', e.target.value)}
                            placeholder="0"
                            disabled={uploading}
                            fullWidth
                          />
                        </BaseGrid>

                        <BaseGrid size={{ xs: 12 }}>
                          <BaseButton
                            variant="outlined"
                            component="label"
                            disabled={uploading}
                            size="small"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                          >
                            Upload New Images for this variant
                            <input
                              type="file"
                              hidden
                              multiple
                              accept="image/*"
                              onChange={(e) => handleVariantImageChange(variantIndex, e.target.files)}
                            />
                          </BaseButton>

                          {/* Existing variant images */}
                          {variant.existingImages && variant.existingImages.length > 0 && (
                            <BaseBox sx={{ mt: 2 }}>
                              <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Existing Images
                              </BaseTypography>
                              <BaseBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
                                {variant.existingImages.map((url, imgIdx) => (
                                  <BaseBox
                                    key={imgIdx}
                                    sx={{
                                      position: 'relative',
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      aspectRatio: '1',
                                    }}
                                  >
                                    <BaseBox
                                      component="img"
                                      src={url}
                                      alt={`Existing ${imgIdx + 1}`}
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                    <BaseIconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveExistingVariantImage(variantIndex, imgIdx)}
                                      sx={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        bgcolor: 'background.paper',
                                        '&:hover': { bgcolor: 'error.lighter' },
                                      }}
                                    >
                                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                    </BaseIconButton>
                                  </BaseBox>
                                ))}
                              </BaseBox>
                            </BaseBox>
                          )}

                          {/* New variant images preview */}
                          {variant.imagePreviews.length > 0 && (
                            <BaseBox sx={{ mt: 2 }}>
                              <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                New Images ({variant.images.length})
                              </BaseTypography>
                              <BaseBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
                                {variant.imagePreviews.map((preview, imgIdx) => (
                                  <BaseBox
                                    key={imgIdx}
                                    sx={{
                                      position: 'relative',
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      aspectRatio: '1',
                                    }}
                                  >
                                    <BaseBox
                                      component="img"
                                      src={preview}
                                      alt={`Preview ${imgIdx + 1}`}
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                    <BaseIconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveVariantImage(variantIndex, imgIdx)}
                                      sx={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        bgcolor: 'background.paper',
                                        '&:hover': { bgcolor: 'error.lighter' },
                                      }}
                                    >
                                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                    </BaseIconButton>
                                  </BaseBox>
                                ))}
                              </BaseBox>
                            </BaseBox>
                          )}
                        </BaseGrid>
                      </BaseGrid>
                    </BaseBox>
                  ))}
                </BaseBox>
              )}
            </BaseCard>

            {/* Specifications */}
            <BaseCard sx={{ p: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Specifications
              </BaseTypography>

              <Controller
                name="specifications"
                control={control}
                render={({ field }) => (
                  <BaseBox>
                    <BaseRichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter product specifications..."
                    />
                    {errors.specifications && (
                      <BaseTypography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                        {errors.specifications.message}
                      </BaseTypography>
                    )}
                  </BaseBox>
                )}
              />
            </BaseCard>
          </BaseGrid>

          {/* Sidebar */}
          <BaseGrid size={{ xs: 12, md: 4 }}>
            <BaseCard sx={{ p: 3, position: 'sticky', top: 24 }}>
              <BaseTypography variant="h6" sx={{ mb: 3 }}>
                Publish
              </BaseTypography>

              <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <BaseFormControlLabel
                      control={<BaseSwitch {...field} checked={field.value} disabled={uploading} />}
                      label="Active"
                    />
                  )}
                />

                <BaseBox sx={{ pt: 2, display: 'flex', gap: 2 }}>
                  <BaseButton
                    variant="outlined"
                    color="inherit"
                    onClick={() => router.push('/products')}
                    disabled={uploading}
                    fullWidth
                  >
                    Cancel
                  </BaseButton>
                  <BaseButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={uploading}
                    fullWidth
                  >
                    Update Product
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
