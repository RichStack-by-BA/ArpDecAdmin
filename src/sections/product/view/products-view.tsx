import type { RootState, AppDispatch } from 'src/store';
import type { Column } from 'src/components/baseComponents';
import type { Product } from 'src/store/slices/productSlice';

import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'src/routes/hooks';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchProducts } from 'src/store/slices/productSlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseAlert,
  DataTable,
  BaseButton,
  BaseDialog,
  BaseTextField,
  BaseTypography,
  BasePagination,
  BaseIconButton,
  BaseCircularProgress,
} from 'src/components/baseComponents';
// ----------------------------------------------------------------------

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  category: string;
  image: string;
  originalProduct: Product;
};

export function ProductsView() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, totalCount } = useSelector((state: RootState) => state.product);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('grid');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewProduct = (product: Product) => {
    console.log('=== Product clicked ===', product);
    console.log('Product taxId:', product.taxId);
    console.log('Product policy:', product.policy);
    console.log('Product variants:', product.variants);
    console.log('Product specifications:', product.specifications);
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };

  // Transform products into rows for the table
  const tableRows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    status: product.isActive ? 'Active' : 'Inactive',
    category: product.categories?.[0]?.name || 'N/A',
    image: product.image || product.images?.[0] || product.coverUrl || '/assets/images/product/product-placeholder.png',
    originalProduct: product,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase().trim();
    
    // Search across all relevant fields
    const matchName = row.name?.toLowerCase().includes(searchLower);
    const matchCategory = row.category?.toLowerCase().includes(searchLower);
    const matchStatus = row.status?.toLowerCase().includes(searchLower);
    const matchPrice = row.price?.toString().includes(searchLower);
    const matchStock = row.stock?.toString().includes(searchLower);
    
    return matchName || matchCategory || matchStatus || matchPrice || matchStock;
  });

  const columns: Column<ProductRow>[] = [
    {
      id: 'image',
      label: 'Image',
      align: 'left',
      format: (value) => (
        <BaseBox
          component="img"
          src={value as string}
          alt="Product"
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            objectFit: 'cover',
          }}
        />
      ),
    },
    {
      id: 'name',
      label: 'Product Name',
      align: 'left',
    },
    {
      id: 'category',
      label: 'Category',
      align: 'left',
    },
    {
      id: 'price',
      label: 'Price',
      align: 'left',
      format: (value) => `₹${value}`,
    },
    {
      id: 'stock',
      label: 'Stock',
      align: 'left',
    },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      format: (value) => (
        <BaseBox
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: value === 'Active' ? '#22c55e' : '#ef4444',
            color: 'white',
            fontWeight: 500,
            fontSize: 12,
            textTransform: 'uppercase',
          }}
        >
          {value}
        </BaseBox>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      format: (value, row) => (
        <BaseBox sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => handleViewProduct(row.originalProduct)}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => router.push(`/products/edit/${row?.originalProduct?.id}`)}
          >
            <Iconify icon="solar:pen-bold" />
          </BaseIconButton>
        </BaseBox>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardContent>
        <BaseBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <BaseCircularProgress />
        </BaseBox>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <BaseAlert severity="error">{error}</BaseAlert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <BaseBox sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <BaseTypography variant="h4" sx={{ flexGrow: 1 }}>
          Products
        </BaseTypography>
        <BaseButton
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => router.push('/products/add')}
        >
          Add Product
        </BaseButton>
      </BaseBox>

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <BaseBox sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </BaseBox>
                ),
              }}
            />

            <BaseBox sx={{ display: 'flex', gap: 1 }}>
              <BaseButton
                variant={view === 'table' ? 'contained' : 'outlined'}
                color="inherit"
                onClick={() => setView('table')}
                sx={{ width: 40, height: 40, minWidth: 0, borderRadius: 1, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Iconify icon={VIEW_ICONS.TABLE} />
              </BaseButton>
              <BaseButton
                variant={view === 'grid' ? 'contained' : 'outlined'}
                color="inherit"
                onClick={() => setView('grid')}
                sx={{ width: 40, height: 40, minWidth: 0, borderRadius: 1, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Iconify icon={VIEW_ICONS.GRID} />
              </BaseButton>
            </BaseBox>
          </BaseBox>
        </BaseBox>

        {view === 'table' ? (
          <DataTable columns={columns} rows={filteredRows} />
        ) : (
          <BaseBox sx={{ p: 3 }}>
            {filteredRows.length === 0 ? (
              <BaseBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <BaseTypography variant="body2" sx={{ color: 'text.secondary',paddingBottom: 2 }}>
                  No data available
                </BaseTypography>
              </BaseBox>
            ) : (
              <BaseBox
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                }}
              >
                {filteredRows.map((row) => (
                  <BaseCard key={row.id} sx={{ overflow: 'hidden', '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.3s' }}>
                    <BaseBox
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 180,
                        bgcolor: 'background.neutral',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BaseBox
                        component="img"
                        src={row.image as string}
                        alt={row.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          borderRadius: 0,
                          transition: 'transform 0.3s',
                        }}
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </BaseBox>
                    <BaseBox sx={{ p: 2, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <BaseBox
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 0.75,
                            display: 'inline-flex',
                            bgcolor: row.status === 'Active' ? 'success.lighter' : 'error.lighter',
                            color: row.status === 'Active' ? 'success.dark' : 'error.dark',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        >
                          {row.status}
                        </BaseBox>
                        <BaseBox sx={{ display: 'flex', gap: 0.5 }}>
                          <BaseIconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProduct(row.originalProduct);
                            }}
                          >
                            <Iconify icon="solar:eye-bold" width={18} />
                          </BaseIconButton>
                          <BaseIconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/products/edit/${row.originalProduct.id}`);
                            }}
                          >
                            <Iconify icon="solar:pen-bold" width={18} />
                          </BaseIconButton>
                        </BaseBox>
                      </BaseBox>
                      <BaseTypography variant="h6" sx={{ mb: 1 }}>
                        {row.name}
                      </BaseTypography>
                      <BaseTypography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {row.category}
                      </BaseTypography>
                      <BaseTypography variant="h6" color="primary">
                        ₹{row.price}
                      </BaseTypography>
                    </BaseBox>
                  </BaseCard>
                ))}
              </BaseBox>
            )}
          </BaseBox>
        )}

        {/* Pagination */}
        {totalCount > PAGE_LIMIT && (
          <BaseBox sx={{ display: 'flex', justifyContent: 'center', p: 3, pt: 2 }}>
            <BasePagination
              count={Math.ceil(totalCount / PAGE_LIMIT)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </BaseBox>
        )}
      </BaseCard>

      {/* Product Detail Modal */}
      <BaseDialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">Product Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedProduct && (
            <BaseGrid container spacing={3}>
                {/* Product Name & Price */}
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Product Name</BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>{selectedProduct.name}</BaseTypography>
                  </BaseBox>
                </BaseGrid>
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Price</BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>₹{selectedProduct.price}</BaseTypography>
                  </BaseBox>
                </BaseGrid>

                {/* Discount (Discount Price - Discount Percentage) */}
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Discount</BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>
                      {selectedProduct.discountPrice ? `₹${selectedProduct.discountPrice}` : 'N/A'}
                      {selectedProduct.discountPercentage ? ` (${selectedProduct.discountPercentage}%)` : ''}
                    </BaseTypography>
                  </BaseBox>
                </BaseGrid>
                {/* Status (Active-green/Inactive-red) */}
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Status</BaseTypography>
                    <BaseBox sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, bgcolor: selectedProduct.isActive ? '#22c55e' : '#ef4444', color: 'white', fontWeight: 500, fontSize: 12, textTransform: 'uppercase' }}>{selectedProduct.isActive ? 'Active' : 'Inactive'}</BaseBox>
                  </BaseBox>
                </BaseGrid>

                {/* Description (full width) */}
                <BaseGrid size={{ xs: 12 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Description</BaseTypography>
                    <BaseBox sx={{ '& p': { margin: 0 }, '& ul': { marginTop: 0.5 } }} dangerouslySetInnerHTML={{ __html: selectedProduct.description || 'No description available' }} />
                  </BaseBox>
                </BaseGrid>

                {/* Categories & Tax */}
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Categories</BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>{selectedProduct.categories?.map((cat: any) => cat.name || cat).join(', ') || 'N/A'}</BaseTypography>
                  </BaseBox>
                </BaseGrid>
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Tax</BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>{selectedProduct.taxId ? (typeof selectedProduct.taxId === 'string' ? selectedProduct.taxId : selectedProduct.taxId?.name || 'N/A') : 'N/A'}</BaseTypography>
                  </BaseBox>
                </BaseGrid>

                {/* Policy & Wishlist Count */}
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Policy</BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>{selectedProduct.policy ? (typeof selectedProduct.policy === 'string' ? selectedProduct.policy : selectedProduct.policy?.name || 'N/A') : 'N/A'}</BaseTypography>
                  </BaseBox>
                </BaseGrid>
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Wishlist Count</BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>{selectedProduct.wishlistCount || selectedProduct.totalWishlistCount || 0}</BaseTypography>
                  </BaseBox>
                </BaseGrid>

                {/* Variants (if present, with name, stock, images) (full width) */}
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <BaseGrid size={{ xs: 12 }}>
                    <BaseBox>
                      <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Variants</BaseTypography>
                      <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {selectedProduct.variants.map((variant: any, index: number) => (
                          <BaseBox key={index} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                            <BaseTypography variant="body1" fontWeight={600} sx={{ mb: 1 }}>{variant.name} - Stock: {variant.stock}</BaseTypography>
                            {variant.images && variant.images.length > 0 && (
                              <BaseBox sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {variant.images.map((img: string, imgIndex: number) => (
                                  <BaseBox key={imgIndex} component="img" src={img} alt={`${variant.name} ${imgIndex + 1}`} sx={{ width: 100, height: 100, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />
                                ))}
                              </BaseBox>
                            )}
                          </BaseBox>
                        ))}
                      </BaseBox>
                    </BaseBox>
                  </BaseGrid>
                )}

                {/* Product Images, Stock (if no variants), Rating, Specifications */}
                {(!selectedProduct.variants || selectedProduct.variants.length === 0) && (
                  <>
                    <BaseGrid size={{ xs: 12, md: 6 }}>
                      <BaseBox>
                        <BaseTypography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>Stock</BaseTypography>
                        <BaseTypography variant="body1" fontWeight={600}>{selectedProduct.stock || 0}</BaseTypography>
                      </BaseBox>
                    </BaseGrid>
                    <BaseGrid size={{ xs: 12, md: 6 }}>
                      <BaseBox>
                        <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Rating</BaseTypography>
                        <BaseTypography variant="body1" fontWeight={600}>{selectedProduct.rating || 0} ⭐ ({selectedProduct.totalReviews || 0} reviews)</BaseTypography>
                      </BaseBox>
                    </BaseGrid>
                  </>
                )}
                {/* Product Images (show only if no variants) */}
                {(!selectedProduct.variants || selectedProduct.variants.length === 0) && (
                  <BaseGrid size={{ xs: 12 }}>
                    <BaseBox>
                      <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Product Images</BaseTypography>
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        <BaseBox sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {selectedProduct.images.map((img: string, index: number) => (
                            <BaseBox key={index} component="img" src={img} alt={`${selectedProduct.name} ${index + 1}`} sx={{ width: 120, height: 120, minHeight: 120, maxHeight: 180, borderRadius: 2, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }} />
                          ))}
                        </BaseBox>
                      ) : (
                        <BaseBox sx={{ width: '100%', height: 180, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.neutral' }}>
                          <BaseBox component="img" src={selectedProduct.image || selectedProduct.coverUrl || '/assets/images/product/product-placeholder.png'} alt={selectedProduct.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </BaseBox>
                      )}
                    </BaseBox>
                  </BaseGrid>
                )}
                {/* Specifications (always very last row) */}
                <BaseGrid size={{ xs: 12 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Specifications</BaseTypography>
                    {selectedProduct.specifications ? (
                      <BaseBox sx={{ '& ul': { marginTop: 0.5, paddingLeft: 2 }, '& li': { marginBottom: 0.5 } }} dangerouslySetInnerHTML={{ __html: selectedProduct.specifications }} />
                    ) : (
                      <BaseTypography variant="body1" fontWeight={600}>N/A</BaseTypography>
                    )}
                  </BaseBox>
                </BaseGrid>
              </BaseGrid>
          )}
        </BaseDialog.Content>
        <BaseDialog.Actions>
          <BaseButton onClick={handleCloseModal} variant="outlined" color="inherit">
            Close
          </BaseButton>
          <BaseButton 
            onClick={() => {
              handleCloseModal();
              router.push(`/products/edit/${selectedProduct?.id}`);
            }} 
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit Product
          </BaseButton>
        </BaseDialog.Actions>
      </BaseDialog>
    </DashboardContent>
  );
}
