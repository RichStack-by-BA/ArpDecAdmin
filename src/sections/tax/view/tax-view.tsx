import type { Tax } from 'src/store/slices/taxSlice';
import type { RootState, AppDispatch } from 'src/store';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { fetchTaxes } from 'src/store/slices/taxSlice';
import { DashboardContent } from 'src/layouts/dashboard';
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

type TaxRow = {
  id: string;
  name: string;
  igst: number;
  cgst: number;
  sgst: number;
  status: string;
  originalTax: Tax;
};

export function TaxView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { taxes, loading, error, totalCount } = useSelector((state: RootState) => state.tax);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTaxes({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewTax = (tax: Tax) => {
    setSelectedTax(tax);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTax(null);
  };

  // Transform taxes into rows for the table
  const tableRows: TaxRow[] = taxes.map((tax) => ({
    id: tax.id,
    name: tax.name,
    igst: tax.igst,
    cgst: tax.cgst,
    sgst: tax.sgst,
    status: tax.isActive ? 'Active' : 'Inactive',
    originalTax: tax,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase().trim();

    const matchName = row.name?.toLowerCase().includes(searchLower);
    const matchIgst = row.igst?.toString().includes(searchLower);
    const matchCgst = row.cgst?.toString().includes(searchLower);
    const matchSgst = row.sgst?.toString().includes(searchLower);
    const matchStatus = row.status?.toLowerCase().includes(searchLower);

    return matchName || matchIgst || matchCgst || matchSgst || matchStatus;
  });

  const columns: Column<TaxRow>[] = [
    {
      id: 'name',
      label: 'Tax Name',
      align: 'left',
    },
    {
      id: 'igst',
      label: 'IGST (%)',
      align: 'center',
      format: (value) => (
        <BaseTypography variant="body2" fontWeight={600}>
          {value}%
        </BaseTypography>
      ),
    },
    {
      id: 'cgst',
      label: 'CGST (%)',
      align: 'center',
      format: (value) => (
        <BaseTypography variant="body2" fontWeight={600}>
          {value}%
        </BaseTypography>
      ),
    },
    {
      id: 'sgst',
      label: 'SGST (%)',
      align: 'center',
      format: (value) => (
        <BaseTypography variant="body2" fontWeight={600}>
          {value}%
        </BaseTypography>
      ),
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
              handleViewTax(row.originalTax);
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
          <BaseIconButton
            size="small"
            color="secondary"
            onClick={() => navigate(`/tax/edit/${row.id}`)}
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
          Tax Management
        </BaseTypography>
        <BaseButton
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/tax/add')}
        >
          Add Tax
        </BaseButton>
      </BaseBox>

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              placeholder="Search taxes..."
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
                            handleViewTax(row.originalTax);
                          }}
                        >
                          <Iconify icon="solar:eye-bold" width={18} />
                        </BaseIconButton>
                        <BaseIconButton
                          size="small"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tax/edit/${row.id}`);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" width={18} />
                        </BaseIconButton>
                      </BaseBox>
                    </BaseBox>
                    <BaseTypography variant="h6" sx={{ mb: 1 }}>
                      {row.name}
                    </BaseTypography>
                    <BaseBox sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <BaseTypography variant="caption" color="text.secondary">
                          IGST: <BaseTypography component="span" variant="body2" fontWeight={600} color="primary.main">{row.igst}%</BaseTypography>
                        </BaseTypography>
                        <BaseTypography variant="caption" color="text.secondary">
                          CGST: <BaseTypography component="span" variant="body2" fontWeight={600} color="primary.main">{row.cgst}%</BaseTypography>
                        </BaseTypography>
                        <BaseTypography variant="caption" color="text.secondary">
                          SGST: <BaseTypography component="span" variant="body2" fontWeight={600} color="primary.main">{row.sgst}%</BaseTypography>
                        </BaseTypography>
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

      {/* Tax Detail Modal */}
      <BaseDialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">Tax Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedTax && (
            <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Details Grid */}
              <BaseBox sx={{ display: 'grid', gap: 2 }}>
                {/* Name */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Tax Name
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedTax.name}
                  </BaseTypography>
                </BaseBox>

                {/* IGST */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    IGST Rate
                  </BaseTypography>
                  <BaseTypography variant="h6" color="primary.main">
                    {selectedTax.igst}%
                  </BaseTypography>
                </BaseBox>

                {/* CGST */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    CGST Rate
                  </BaseTypography>
                  <BaseTypography variant="h6" color="primary.main">
                    {selectedTax.cgst}%
                  </BaseTypography>
                </BaseBox>

                {/* SGST */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    SGST Rate
                  </BaseTypography>
                  <BaseTypography variant="h6" color="primary.main">
                    {selectedTax.sgst}%
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
                      bgcolor: selectedTax.isActive ? 'success.lighter' : 'error.lighter',
                      color: selectedTax.isActive ? 'success.dark' : 'error.dark',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedTax.isActive ? 'Active' : 'Inactive'}
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
        </BaseDialog.Actions>
      </BaseDialog>
    </DashboardContent>
  );
}