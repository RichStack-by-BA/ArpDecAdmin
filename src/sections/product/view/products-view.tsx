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
  BaseAlert,
  DataTable,
  BaseButton,
  BaseTextField,
  BaseTypography,
  BasePagination,
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

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  console.log(products,'===productproduct');

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
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Iconify icon={VIEW_ICONS.TABLE} />
              </BaseButton>
              <BaseButton
                variant={view === 'grid' ? 'contained' : 'outlined'}
                color="inherit"
                onClick={() => setView('grid')}
                sx={{ minWidth: 'auto', px: 2 }}
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
                      height: 200,
                      bgcolor: 'background.neutral',
                      overflow: 'hidden',
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
                      }}
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </BaseBox>
                  <BaseBox sx={{ p: 2 }}>
                    <BaseTypography variant="h6" sx={{ mb: 1 }}>
                      {row.name}
                    </BaseTypography>
                    <BaseTypography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {row.category}
                    </BaseTypography>
                    <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <BaseTypography variant="h6" color="primary">
                        ₹{row.price}
                      </BaseTypography>
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
                    </BaseBox>
                  </BaseBox>
                </BaseCard>
              ))}
            </BaseBox>
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
    </DashboardContent>
  );
}
