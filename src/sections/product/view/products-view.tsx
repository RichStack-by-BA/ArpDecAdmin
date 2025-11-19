import type { RootState, AppDispatch } from 'src/store';
import type { Column } from 'src/components/baseComponents';
import type { Product } from 'src/store/slices/productSlice';

import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'src/routes/hooks';

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
  const { products, loading, error } = useSelector((state: RootState) => state.product);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('grid');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Transform products into rows for the table
  const tableRows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    status: product.isActive ? 'Active' : 'Inactive',
    category: product.categories?.[0]?.name || 'N/A',
    image: product.images?.[0] || product.coverUrl || '/assets/images/product/product-placeholder.png',
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

  const searchBar = (
    <BaseBox sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <BaseTextField
        placeholder="Search by name, category, price, stock, status..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <Iconify icon="eva:search-fill" width={20} sx={{ mr: 1 }} />
            ),
          },
        }}
        sx={{ flexGrow: 1, minWidth: 300 }}
      />
      <BaseBox sx={{ display: 'flex', gap: 1 }}>
        <BaseBox
          onClick={() => setView('table')}
          sx={{
            p: 1,
            cursor: 'pointer',
            borderRadius: 1,
            bgcolor: view === 'table' ? 'primary.main' : 'transparent',
            color: view === 'table' ? 'white' : 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              bgcolor: view === 'table' ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          <Iconify icon="ic:round-filter-list" width={24} />
        </BaseBox>
        <BaseBox
          onClick={() => setView('grid')}
          sx={{
            p: 1,
            cursor: 'pointer',
            borderRadius: 1,
            bgcolor: view === 'grid' ? 'primary.main' : 'transparent',
            color: view === 'grid' ? 'white' : 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              bgcolor: view === 'grid' ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          <Iconify icon="solar:home-angle-bold-duotone" width={24} />
        </BaseBox>
      </BaseBox>
    </BaseBox>
  );

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
      <BaseBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <BaseBox>
          <BaseTypography variant="h4">Products List</BaseTypography>
          <BaseTypography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Here you can find all of your Products
          </BaseTypography>
        </BaseBox>
        <BaseButton
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => router.push('/products/add')}
        >
          Add Product
        </BaseButton>
      </BaseBox>

      <DataTable
        columns={columns}
        rows={filteredRows}
        getRowKey={(row) => row.id}
        searchBar={searchBar}
        emptyMessage="No products found"
        view={view}
        gridItemSize={{ xs: 12, sm: 6, md: 3 }}
        renderGridItem={(row) => (
          <BaseCard
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <BaseBox
              component="img"
              src={row.image as string}
              alt={row.name}
              sx={{
                width: '100%',
                height: 200,
                borderRadius: 1.5,
                objectFit: 'cover',
                mb: 1,
              }}
            />
            <BaseTypography
              variant="subtitle2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={row.name}
            >
              {row.name}
            </BaseTypography>
            <BaseTypography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={row.category}
            >
              {row.category}
            </BaseTypography>
            <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <BaseTypography variant="h6" color="primary">
                ₹{row.price}
              </BaseTypography>
              <BaseBox
                sx={{
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: row.status === 'Active' ? '#22c55e' : '#ef4444',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {row.status}
              </BaseBox>
            </BaseBox>
            <BaseTypography variant="caption" color="text.secondary">
              Stock: {row.stock}
            </BaseTypography>
          </BaseCard>
        )}
      />
    </DashboardContent>
  );
}
