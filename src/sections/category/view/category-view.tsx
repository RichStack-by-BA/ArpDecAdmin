import type { RootState, AppDispatch } from 'src/store';
import type { Column } from 'src/components/baseComponents';
import type { Category } from 'src/store/slices/categorySlice';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchCategories } from 'src/store/slices/categorySlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
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

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  image: string;
  description: string;
  originalCategory: Category;
};

export function CategoryView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error, totalCount, currentPage } = useSelector((state: RootState) => state.category);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCategories({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategory(null);
  };

  // Transform categories into rows for the table
  const tableRows: CategoryRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    status: category.isActive ? 'Active' : 'Inactive',
    image: category.image || '/assets/images/category/category-placeholder.png',
    description: category.description || 'No description',
    originalCategory: category,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase().trim();

    const matchName = row.name?.toLowerCase().includes(searchLower);
    const matchSlug = row.slug?.toLowerCase().includes(searchLower);
    const matchStatus = row.status?.toLowerCase().includes(searchLower);
    const matchDescription = row.description?.toLowerCase().includes(searchLower);

    return matchName || matchSlug || matchStatus || matchDescription;
  });

  const columns: Column<CategoryRow>[] = [
    {
      id: 'image',
      label: 'Image',
      align: 'left',
      format: (value) => (
        <BaseBox
          component="img"
          src={value as string}
          alt="Category"
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
      label: 'Category Name',
      align: 'left',
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      format: (value) => (
        <BaseBox
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 0.75,
            display: 'inline-flex',
            bgcolor: value === 'Active' ? 'success.lighter' : 'error.lighter',
            color: value === 'Active' ? 'success.dark' : 'error.dark',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          {value}
        </BaseBox>
      ),
    },
    {
      id: 'id',
      label: 'Actions',
      align: 'center',
      format: (value, row) => (
        <BaseBox sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => {
              handleViewCategory(row.originalCategory);
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => {
              navigate(`/category/edit/${row.id}`);
            }}
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
        <BaseBox
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
          }}
        >
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
          Categories
        </BaseTypography>
        <BaseButton
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/category/add')}
        >
          Add Category
        </BaseButton>
      </BaseBox>

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              placeholder="Search categories..."
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
                    <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
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
                            handleViewCategory(row.originalCategory);
                          }}
                        >
                          <Iconify icon="solar:eye-bold" width={18} />
                        </BaseIconButton>
                        <BaseIconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/category/edit/${row.id}`);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" width={18} />
                        </BaseIconButton>
                      </BaseBox>
                    </BaseBox>
                    <BaseTypography variant="h6">
                      {row.name}
                    </BaseTypography>
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

      {/* Category Detail Modal */}
      <BaseDialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">Category Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedCategory && (
            <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Image */}
              <BaseBox
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BaseBox
                  component="img"
                  src={selectedCategory.image}
                  alt={selectedCategory.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              </BaseBox>

              {/* Details Grid */}
              <BaseBox sx={{ display: 'grid', gap: 2 }}>
                {/* Name */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Category Name
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedCategory.name}
                  </BaseTypography>
                </BaseBox>

                {/* Title */}
                {selectedCategory.title && (
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Website Title
                    </BaseTypography>
                    <BaseTypography variant="body1">
                      {selectedCategory.title}
                    </BaseTypography>
                  </BaseBox>
                )}

                {/* Description */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Description
                  </BaseTypography>
                  <BaseTypography variant="body1">
                    {selectedCategory.description || 'No description available'}
                  </BaseTypography>
                </BaseBox>

                {/* Status */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Status
                  </BaseTypography>
                  <BaseBox
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0.75,
                      display: 'inline-flex',
                      bgcolor: selectedCategory.isActive ? 'success.lighter' : 'error.lighter',
                      color: selectedCategory.isActive ? 'success.dark' : 'error.dark',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedCategory.isActive ? 'Active' : 'Inactive'}
                  </BaseBox>
                </BaseBox>
              </BaseBox>
            </BaseBox>
          )}
        </BaseDialog.Content>
        <BaseDialog.Actions>
          <BaseButton onClick={handleCloseModal} variant="outlined" color="inherit">
            Close
          </BaseButton>
          <BaseButton 
            onClick={() => {
              handleCloseModal();
              navigate(`/category/edit/${selectedCategory?.id}`);
            }} 
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit Category
          </BaseButton>
        </BaseDialog.Actions>
      </BaseDialog>
    </DashboardContent>
  );
}