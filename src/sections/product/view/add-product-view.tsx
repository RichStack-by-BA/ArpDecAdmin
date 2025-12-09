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
import { fetchTaxes } from 'src/store/slices/taxSlice';
import { fetchPolicies } from 'src/store/slices/policySlice';
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
  BaseFormControl,
  BaseRadioGroup,
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
  const { taxes } = useSelector((state: RootState) => state.tax);
  const { policies } = useSelector((state: RootState) => state.policy);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [variants, setVariants] = useState<Array<{ name: string; image: File | null; imagePreview: string; stock: number | string }>>([]);
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
      price: 0,
      discountPrice: undefined,
      stock: 0,
      taxId: '',
      imageMode: 'default',
      images: [],
      variants: [],
      specifications: [{ key: '', value: '' }],
      policy: '',
      isActive: true,
    },
  });

  const imageMode = watch('imageMode');

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: 'specifications',
  });

  // Variant Management Functions
  const handleAddVariant = () => {
    const newVariant = { name: '', image: null, imagePreview: '', stock: '' };
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
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Variant image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only image files (JPEG, PNG, WEBP) are allowed');
        return;
      }

      const updatedVariants = [...variants];
      updatedVariants[index].image = file;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedVariants[index].imagePreview = reader.result as string;
        setVariants(updatedVariants);
        setValue('variants', updatedVariants as any);
      };
      reader.readAsDataURL(file);
      setError('');
    }
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

      let imageUrls: string[] = [];
      let variantsData: Array<{ name: string; image: string; stock: number }> = [];

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
          if (!variants[i].name || !variants[i].image) {
            setError(`Please complete all fields for variant ${i + 1}`);
            setUploading(false);
            return;
          }
        }

        // Upload variant images
        setUploadProgress(`Uploading variant images (0/${variants.length})...`);
        
        for (let i = 0; i < variants.length; i++) {
          setUploadProgress(`Uploading variant images (${i + 1}/${variants.length})...`);
          
          try {
            const uploadedUrl = await dispatch(
              uploadImage({
                userId: userDetails.user._id,
                file: variants[i].image!,
              })
            ).unwrap();
            
            variantsData.push({
              name: variants[i].name,
              image: uploadedUrl,
              stock: Number(variants[i].stock) || 0,
            });
          } catch (uploadErr: any) {
            setError(`Failed to upload variant image ${i + 1}: ${uploadErr}`);
            setUploading(false);
            return;
          }
        }
      }

      setUploadProgress('Creating product...');

      // Convert specifications to HTML format
      const specificationsHtml = data.specifications
        ?.filter((s) => s?.key && s?.value)
        .map((s) => `<li>${s.key}: ${s.value}</li>`)
        .join('');
      const specificationsString = specificationsHtml ? `<ul>${specificationsHtml}</ul>` : '';

      const payload: any = {
        name: data.name,
        categories: data.selectedCategories,
        price: data.price,
        discountPrice: data.discountPrice || 0,
        taxId: data.taxId,
        description: data.description,
        specifications: specificationsString,
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
                            {taxes.length === 0 ? (
                              <BaseMenuItem disabled>No taxes available</BaseMenuItem>
                            ) : (
                              taxes.map((tax) => (
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
                  {imageMode === 'default' && (
                    <BaseGrid size={{ xs: 12 }}>
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
                          />
                        )}
                      />
                    </BaseGrid>
                  )}
                </BaseGrid>

                <Controller
                  name="taxId"
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
                        {policies.length === 0 ? (
                          <BaseMenuItem disabled>No policies available</BaseMenuItem>
                        ) : (
                          policies.map((policy) => (
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
                        height={250}
                      />
                    )}
                  />
                </BaseBox>
              </BaseBox>
            </BaseCard>

            {/* Images / Variants */}
            <BaseCard sx={{ p: 3, mb: 3 }}>
              <BaseTypography variant="h6" sx={{ mb: 2 }}>Product Images *</BaseTypography>
              
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
                        const value = e.target.value;
                        field.onChange(value);
                        if (value === 'default') {
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
                              Upload Color Image
                              <input
                                type="file"
                                hidden
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e) => handleVariantImageChange(index, e)}
                              />
                            </BaseButton>
                            <BaseTypography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Max size: 5MB • Formats: JPG, PNG, WEBP
                            </BaseTypography>
                          </BaseBox>
                          {variant.imagePreview && (
                            <BaseBox
                              sx={{
                                width: '100%',
                                height: 150,
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <img
                                src={variant.imagePreview}
                                alt={`${variant.name} preview`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </BaseBox>
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
