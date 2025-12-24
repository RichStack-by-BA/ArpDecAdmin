import type { RootState, AppDispatch } from 'src/store';
import type { Policy } from 'src/store/slices/policySlice';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchPolicies } from 'src/store/slices/policySlice';
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

type PolicyRow = {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  status: string;
  originalPolicy: Policy;
};

export function PolicyView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { policies, loading, error, totalCount } = useSelector((state: RootState) => state.policy);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPolicies({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPolicy(null);
  };

  // Transform policies into rows for the table
  const tableRows: PolicyRow[] = policies.map((policy) => ({
    id: policy.id,
    name: policy.name,
    content: policy.content,
    isActive: policy.isActive,
    status: policy.isActive ? 'Active' : 'Inactive',
    originalPolicy: policy,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase().trim();

    const matchName = row.name?.toLowerCase().includes(searchLower);
    const matchContent = row.content?.toLowerCase().includes(searchLower);
    const matchStatus = row.isActive ? 'active'.includes(searchLower) : 'inactive'.includes(searchLower);

    return matchName || matchContent || matchStatus;
  });

  const columns: Column<PolicyRow>[] = [
    {
      id: 'name',
      label: 'Policy Name',
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
              handleViewPolicy(row.originalPolicy);
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/policy/edit/${row.id}`)}
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
          Policies
        </BaseTypography>
        <BaseButton
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/policy/add')}
        >
          Add Policy
        </BaseButton>
      </BaseBox>

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              placeholder="Search policies..."
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
                          bgcolor: row.isActive ? 'success.lighter' : 'error.lighter',
                          color: row.isActive ? 'success.dark' : 'error.dark',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        {row.isActive ? 'Active' : 'Inactive'}
                      </BaseBox>
                      <BaseBox sx={{ display: 'flex', gap: 0.5 }}>
                        <BaseIconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPolicy(row.originalPolicy);
                          }}
                        >
                          <Iconify icon="solar:eye-bold" width={18} />
                        </BaseIconButton>
                        <BaseIconButton
                          size="small"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/policy/edit/${row.id}`);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" width={18} />
                        </BaseIconButton>
                      </BaseBox>
                    </BaseBox>
                    <BaseTypography variant="h6" sx={{ mb: 1 }}>
                      {row.name}
                    </BaseTypography>
                    <BaseBox 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        '& p': { margin: 0 },
                        '& *': { fontSize: 'inherit !important' },
                      }}
                      dangerouslySetInnerHTML={{ __html: row.content }}
                    />
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

      {/* Policy Detail Modal */}
      <BaseDialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">Policy Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedPolicy && (
            <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Details Grid */}
              <BaseBox sx={{ display: 'grid', gap: 2 }}>
                {/* Name */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Policy Name
                  </BaseTypography>
                  <BaseTypography variant="body1" fontWeight={600}>
                    {selectedPolicy.name}
                  </BaseTypography>
                </BaseBox>

                {/* Content */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Content
                  </BaseTypography>
                  <BaseBox
                    sx={{ 
                      '& p': { margin: '0.5em 0' },
                      '& ul, & ol': { paddingLeft: '1.5em', margin: '0.5em 0' },
                      '& h1, & h2, & h3': { margin: '0.75em 0 0.5em' },
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedPolicy.content || 'No content available' }}
                  />
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
                      bgcolor: selectedPolicy.isActive ? 'success.lighter' : 'error.lighter',
                      color: selectedPolicy.isActive ? 'success.dark' : 'error.dark',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedPolicy.isActive ? 'Active' : 'Inactive'}
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
          {selectedPolicy && (
            <BaseButton
              onClick={() => {
                handleCloseModal();
                navigate(`/policy/edit/${selectedPolicy.id}`);
              }}
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit Policy
            </BaseButton>
          )}
        </BaseDialog.Actions>
      </BaseDialog>
    </DashboardContent>
  );
}
