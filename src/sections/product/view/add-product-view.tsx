import type { RootState, AppDispatch } from 'src/store';

import type { AddProductFormData } from 'src/validations';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { useForm, Controller } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'src/routes/hooks';
import { addProductSchema } from 'src/validations';
import { fetchTaxes } from 'src/store/slices/taxSlice';
import { DashboardContent } from 'src/layouts/dashboard';
import { addProduct } from 'src/store/slices/productSlice';
import { uploadImage } from 'src/store/slices/uploadSlice';
import { fetchPolicies } from 'src/store/slices/policySlice';
import { fetchCategories } from 'src/store/slices/categorySlice';
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

export function AddProductView() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);
  // Only active categories
  const activeCategories = categories.filter((cat) => cat.status === true || cat.status === 'Active');
  const { loading } = useSelector((state: RootState) => state.product);
  const { userDetails } = useSelector((state: RootState) => state.user);
  const { taxes } = useSelector((state: RootState) => state.tax);
  // Only active taxes
  const activeTaxes = taxes.filter((tax) => tax.status === true || tax.status === 'Active');
  const { policies } = useSelector((state: RootState) => state.policy);
  // Only active policies
  const activePolicies = policies.filter((policy) => policy.status === true || policy.status === 'Active');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [variants, setVariants] = useState<Array<{ name: string; images: File[]; imagePreviews: string[]; stock: number | string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectOpen, setSelectOpen] = useState(false);

  // Fetch categories, taxes, and policies on component mount
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 100 }));
    dispatch(fetchTaxes({ page: 1, limit: 100 }));
    dispatch(fetchPolicies({ page: 1, limit: 100 }));
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

  // Variant Management Functions
  const handleAddVariant = () => {
    const newVariant = { name: '', images: [], imagePreviews: [], stock: '' };
    setVariants([...variants, newVariant]);
  };

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
    setValue('variants', updatedVariants as any);
  };

  const handleVariantNameChange = (index: number, name: string) => {
    const updatedVariants = [...variants];
    updatedVariants[index].name = name;
    setVariants(updatedVariants);
    setValue('variants', updatedVariants as any);
  };

  const handleVariantStockChange = (index: number, stock: number | string) => {
    const updatedVariants = [...variants];
    updatedVariants[index].stock = stock;
    setVariants(updatedVariants);
    setValue('variants', updatedVariants as any);
  };

  const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Validate each file size (max 5MB)
      const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      
      if (invalidFiles.length > 0) {
        setError(`${invalidFiles.length} file(s) exceed the 5MB limit. Please select smaller files.`);
        return;
      }

      // Validate file types
      const invalidTypes = newFiles.filter(file => !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type));
      if (invalidTypes.length > 0) {
        setError('Only image files (JPEG, PNG, WEBP) are allowed');
        return;
      }

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
        setValue('variants', updatedVariants as any);
      });
      
      setError('');
    }
  };

  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].images = updatedVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
    updatedVariants[variantIndex].imagePreviews = updatedVariants[variantIndex].imagePreviews.filter((_, i) => i !== imageIndex);
    setVariants(updatedVariants);
    setValue('variants', updatedVariants as any);
  };

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

      const imageUrls: string[] = [];
      const variantsData: Array<{ name: string; images: string[]; stock: number }> = [];

      // Handle default mode - upload images
      if (data.imageMode === 'default') {
        // Validate images
        if (images.length === 0) {
          setError('Please upload at least one product image.');
          setUploading(false);
          return;
        }

        // Upload all images
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
      // Handle colors mode - upload variant images
      else if (data.imageMode === 'colors') {
        // Validate variants
        if (variants.length === 0) {
          setError('Please add at least one color variant.');
          setUploading(false);
          return;
        }

        // Validate each variant has required fields
        for (let i = 0; i < variants.length; i++) {
          if (!variants[i].name || variants[i].images.length === 0) {
            setError(`Please complete all fields for variant ${i + 1}`);
            setUploading(false);
            return;
          }
        }

        // Upload variant images
        const totalImagesToUpload = variants.reduce((sum, v) => sum + v.images.length, 0);
        let uploadedCount = 0;
        
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          const uploadedUrls: string[] = [];
          
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

      setUploadProgress('Creating product...');

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
        <BaseIconButton onClick={() => router.push('/products')} sx={{ mr: 1 }} disabled={uploading}>
          <Iconify icon="eva:arrow-ios-forward-fill" sx={{ transform: 'rotate(180deg)' }} />
        </BaseIconButton>
        <BaseTypography variant="h4">Add New Product</BaseTypography>
      </BaseBox>

      {(uploading || loading) && (
        <BaseAlert severity="info" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BaseCircularProgress size={20} />
          <BaseBox>
            <BaseTypography variant="body2" sx={{ fontWeight: 600 }}>
              Processing...
            </BaseTypography>
            {uploadProgress && (
              <BaseTypography variant="caption" color="text.secondary">
                {uploadProgress}
              </BaseTypography>
            )}
          </BaseBox>
        </BaseAlert>
      )}

      {error && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </BaseAlert>
      )}

      {Object.keys(errors).length > 0 && (
        <BaseAlert severity="warning" sx={{ mb: 3 }}>
          <BaseTypography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Please fix the following errors:
          </BaseTypography>
          {Object.entries(errors).map(([key, value]: [string, any]) => (
            <BaseTypography key={key} variant="body2" sx={{ ml: 2 }}>
              • {key}: {value?.message || 'Invalid value'}
            </BaseTypography>
          ))}
        </BaseAlert>
      )}

      {success && (
        <BaseAlert severity="success" sx={{ mb: 3 }}>
          {success}
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
                            {(selected as string[]).map((categoryId: string) => (
                              <BaseChip
                                key={categoryId}
                                label={
                                  categories.find((cat) => cat.id === categoryId)?.name || categoryId
                                }
                                size="small"
                              />
                            ))}
                          </BaseBox>
                        )}
                      >
                        {activeCategories.length === 0 ? (
                          <BaseMenuItem disabled>No active categories available</BaseMenuItem>
                        ) : (
                          activeCategories.map((category) => (
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
                  <BaseGrid size={{ xs: 12 }}>
                    <Controller
                      name="taxId"
                      control={control}
                      render={({ field }) => (
                        <BaseFormControl fullWidth required error={!!errors.taxId}>
                          <BaseInputLabel id="tax-label">Tax</BaseInputLabel>
                          <BaseSelect
                            {...field}
                            labelId="tax-label"
                            label="Tax"
                          >
                            {activeTaxes.length === 0 ? (
                              <BaseMenuItem disabled>No active taxes available</BaseMenuItem>
                            ) : (
                              activeTaxes.map((tax) => (
                                <BaseMenuItem key={tax.id} value={tax.id}>
                                  {tax.name} (IGST: {tax.igst}%, CGST: {tax.cgst}%, SGST: {tax.sgst}%)
                                </BaseMenuItem>
                              ))
                            )}
                          </BaseSelect>
                          {errors.taxId && (
                            <BaseTypography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                              {errors.taxId.message}
                            </BaseTypography>
                          )}
                        </BaseFormControl>
                      )}
                    />
                  </BaseGrid>
                </BaseGrid>

                <Controller
                  name="policy"
                  control={control}
                  render={({ field }) => (
                    <BaseFormControl fullWidth error={!!errors.policy}>
                      <BaseInputLabel id="policy-label">Policy (Optional)</BaseInputLabel>
                      <BaseSelect
                        {...field}
                        labelId="policy-label"
                        label="Policy (Optional)"
                      >
                        <BaseMenuItem value="">
                          <em>None</em>
                        </BaseMenuItem>
                        {activePolicies.length === 0 ? (
                          <BaseMenuItem disabled>No active policies available</BaseMenuItem>
                        ) : (
                          activePolicies.map((policy) => (
                            <BaseMenuItem key={policy.id} value={policy.id}>
                              {policy.name}
                            </BaseMenuItem>
                          ))
                        )}
                      </BaseSelect>
                      {errors.policy && (
                        <BaseTypography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                          {errors.policy.message}
                        </BaseTypography>
                      )}
                    </BaseFormControl>
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
                        height={120}
                      />
                    )}
                  />
                </BaseBox>
              </BaseBox>
            </BaseCard>

            {/* Images / Variants */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 2 }}>Product Images * and Stock</BaseTypography>
              
              {/* Radio Selection for Image Mode */}
              <Controller
                name="imageMode"
                control={control}
                render={({ field }) => (
                  <BaseFormControl component="fieldset" sx={{ mb: 3 }}>
                    <BaseRadioGroup
                      {...field}
                      row
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        field.onChange(selectedValue);
                        if (selectedValue === 'default') {
                          setVariants([]);
                          setValue('variants', []);
                        } else {
                          setImages([]);
                          setValue('images', []);
                        }
                      }}
                    >
                      <BaseFormControlLabel
                        value="default"
                        control={<BaseRadio />}
                        label="Default"
                      />
                      <BaseFormControlLabel
                        value="colors"
                        control={<BaseRadio />}
                        label="Add Colors"
                      />
                    </BaseRadioGroup>
                  </BaseFormControl>
                )}
              />

              {/* Default Mode - Regular Images */}
              {imageMode === 'default' && (
                <>
                  <Controller
                    name="stock"
                    control={control}
                    render={({ field }) => (
                      <BaseTextField
                        {...field}
                        fullWidth
                        label="Stock Quantity"
                        type="number"
                        required
                        error={!!errors.stock}
                        helperText={errors.stock?.message}
                        sx={{ mb: 3 }}
                      />
                    )}
                  />
                  
                  <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <BaseTypography variant="body2" color="text.secondary">
                      Upload product images
                    </BaseTypography>
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
                </>
              )}

              {/* Colors Mode - Variants */}
              {imageMode === 'colors' && (
                <>
                  <BaseBox sx={{ mb: 2 }}>
                    <BaseButton
                      size="small"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={handleAddVariant}
                    >
                      Add Color Variant
                    </BaseButton>
                  </BaseBox>
                  {errors.variants && (
                    <BaseTypography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                      {errors.variants.message}
                    </BaseTypography>
                  )}
                  <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {variants.map((variant, index) => (
                      <BaseCard key={index} sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <BaseTypography variant="subtitle2">Variant {index + 1}</BaseTypography>
                          <BaseIconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveVariant(index)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                          </BaseIconButton>
                        </BaseBox>
                        <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <BaseTextField
                            label="Color Name"
                            placeholder="e.g., Red, Blue, Black"
                            value={variant.name}
                            onChange={(e) => handleVariantNameChange(index, e.target.value)}
                            fullWidth
                            required
                          />
                          <BaseTextField
                            label="Stock"
                            type="number"
                            placeholder="0"
                            value={variant.stock}
                            onChange={(e) => handleVariantStockChange(index, e.target.value)}
                            fullWidth
                            required
                            inputProps={{ min: 0, step: 1 }}
                          />
                          <BaseBox>
                            <BaseButton
                              component="label"
                              variant="outlined"
                              fullWidth
                              startIcon={<Iconify icon="solar:upload-bold" />}
                            >
                              Upload Product Images
                              <input
                                type="file"
                                hidden
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e) => handleVariantImageChange(index, e)}
                              />
                            </BaseButton>
                            <BaseTypography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Max size: 5MB per image • Formats: JPG, PNG, WEBP
                            </BaseTypography>
                          </BaseBox>
                          
                          {/* Display uploaded images */}
                          {variant.imagePreviews.length > 0 && (
                            <BaseBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              {variant.imagePreviews.map((preview, imgIndex) => (
                                <BaseBox
                                  key={imgIndex}
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
                                    src={preview}
                                    alt={`${variant.name} ${imgIndex + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  <BaseIconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveVariantImage(index, imgIndex)}
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
                            </BaseBox>
                          )}
                          
                          {variant.imagePreviews.length === 0 && (
                            <BaseTypography variant="body2" color="text.secondary">
                              No images uploaded for this variant yet.
                            </BaseTypography>
                          )}
                        </BaseBox>
                      </BaseCard>
                    ))}
                    {variants.length === 0 && (
                      <BaseTypography variant="body2" color="text.secondary">
                        No color variants added yet. Click &quot;Add Color Variant&quot; to add different colors.
                      </BaseTypography>
                    )}
                  </BaseBox>
                </>
              )}
            </BaseCard>

            {/* Specifications */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
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
                      height={120}
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
