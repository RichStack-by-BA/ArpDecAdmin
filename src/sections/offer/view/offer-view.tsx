import type { RootState, AppDispatch } from 'src/store';
import type { Offer } from 'src/store/slices/offerSlice';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchOffers } from 'src/store/slices/offerSlice';
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

type OfferRow = {
  id: string;
  offerCode: string;
  title: string;
  validity: string;
  isActive: string;
  originalOffer: Offer;
};

export function OfferView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { offers, loading, error, totalCount } = useSelector((state: RootState) => state.offer);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchOffers({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOffer(null);
  };

  // Transform offers into rows for the table
  const tableRows: OfferRow[] = offers.map((offer) => ({
    id: offer.id,
    offerCode: offer.offerCode || 'N/A',
    title: offer.title,
    validity: `${offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'N/A'} - ${offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'N/A'}`,
    isActive: offer.isActive ? 'Active' : 'Inactive',
    originalOffer: offer,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase().trim();

    const matchOfferCode = row.offerCode?.toLowerCase().includes(searchLower);
    const matchTitle = row.title?.toLowerCase().includes(searchLower);

    return matchOfferCode || matchTitle;
  });

  const columns: Column<OfferRow>[] = [
    {
      id: 'offerCode',
      label: 'Offer Code',
      align: 'left',
    },
    {
      id: 'title',
      label: 'Title',
      align: 'left',
    },
    {
      id: 'validity',
      label: 'Validity',
      align: 'center',
    },
    {
      id: 'isActive',
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
              handleViewOffer(row.originalOffer);
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => {
              navigate(`/offer/edit/${row.id || row.originalOffer.id}`);
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
          Offers
        </BaseTypography>
        <BaseButton
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/offer/add')}
        >
          Add Offer
        </BaseButton>
      </BaseBox>

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              placeholder="Search offers..."
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
                      src={row.originalOffer.image || '/assets/images/offer/offer-placeholder.png'}
                      alt={row.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {row.originalOffer.discountPercentage && (
                      <BaseBox
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1,
                          bgcolor: 'error.main',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: 1,
                        }}
                      >
                        {row.originalOffer.discountPercentage}% OFF
                      </BaseBox>
                    )}
                  </BaseBox>
                  <BaseBox sx={{ p: 2 }}>
                    <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <BaseBox
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 0.75,
                          display: 'inline-flex',
                          bgcolor: row.originalOffer.isActive ? 'success.lighter' : 'error.lighter',
                          color: row.originalOffer.isActive ? 'success.dark' : 'error.dark',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        {row.originalOffer.isActive ? 'Active' : 'Inactive'}
                      </BaseBox>
                      <BaseBox sx={{ display: 'flex', gap: 0.5 }}>
                        <BaseIconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOffer(row.originalOffer);
                          }}
                        >
                          <Iconify icon="solar:eye-bold" width={18} />
                        </BaseIconButton>
                        <BaseIconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/offer/edit/${row.id || row.originalOffer.id}`);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" width={18} />
                        </BaseIconButton>
                      </BaseBox>
                    </BaseBox>
                    <BaseTypography variant="h6" sx={{ mb: 0.5 }}>
                      {row.title}
                    </BaseTypography>
                    <BaseTypography variant="caption" color="text.secondary">
                      Code: {row.offerCode}
                    </BaseTypography>
                    <BaseBox sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <BaseTypography variant="caption" color="text.secondary">
                        {row.validity}
                      </BaseTypography>
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

      {/* Offer Detail Modal */}
      <BaseDialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">Offer Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedOffer && (
            <BaseGrid container spacing={3}>
              {/* First Row: Title & Offer Code */}
              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Offer Title
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.title}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Offer Code
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                    {selectedOffer.offerCode || 'N/A'}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              {/* Second Row: Discount Type & Discount Value */}
              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Discount Type
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {selectedOffer.discountType || 'N/A'}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Discount Value
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.discountType === 'percentage' 
                      ? `${selectedOffer.discountValue || 0}%`
                      : `₹${selectedOffer.discountValue || 0}`}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              {/* Third Row: Description (full width) */}
              <BaseGrid size={{ xs: 12 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Description
                  </BaseTypography>
                  <BaseTypography variant="body2">
                    {selectedOffer.description || 'No description available'}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              {/* Fourth Row: Usage Per User & Total Usage Limit */}
              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Usage Per User
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.usageLimitPerUser || 'Unlimited'}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Total Usage Limit
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.totalUsageLimit || 'Unlimited'}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              {/* Rest of the fields */}
              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Minimum Purchase Amount
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.minPurchaseAmount ? `₹${selectedOffer.minPurchaseAmount}` : 'N/A'}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              {selectedOffer.maxDiscountAmount && (
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Max Discount Amount
                    </BaseTypography>
                    <BaseTypography variant="body1" fontWeight={600}>
                      ₹{selectedOffer.maxDiscountAmount}
                    </BaseTypography>
                  </BaseBox>
                </BaseGrid>
              )}

              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Validity Period
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.startDate && new Date(selectedOffer.startDate).toLocaleDateString()} 
                    {selectedOffer.startDate && selectedOffer.endDate && ' - '}
                    {selectedOffer.endDate && new Date(selectedOffer.endDate).toLocaleDateString()}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Used Count
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.usedCount || 0}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Applicable To
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {selectedOffer.applicableTo || 'All'}
                  </BaseTypography>
                </BaseBox>
              </BaseGrid>

              {selectedOffer.applicableProducts && selectedOffer.applicableProducts.length > 0 && (
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Applicable Products
                    </BaseTypography>
                    <BaseTypography variant="body2">
                      {selectedOffer.applicableProducts.length} product(s) selected
                    </BaseTypography>
                  </BaseBox>
                </BaseGrid>
              )}

              {selectedOffer.applicableCategories && selectedOffer.applicableCategories.length > 0 && (
                <BaseGrid size={{ xs: 12, md: 6 }}>
                  <BaseBox>
                    <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Applicable Categories
                    </BaseTypography>
                    <BaseTypography variant="body2">
                      {selectedOffer.applicableCategories.length} categor(y/ies) selected
                    </BaseTypography>
                  </BaseBox>
                </BaseGrid>
              )}

              <BaseGrid size={{ xs: 12, md: 6 }}>
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Status
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedOffer.isActive ? 'Active' : 'Inactive'}
                  </BaseTypography>
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
              navigate(`/offer/edit/${selectedOffer?.id}`);
            }} 
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit Offer
          </BaseButton>
        </BaseDialog.Actions>
      </BaseDialog>
    </DashboardContent>
  );
}
