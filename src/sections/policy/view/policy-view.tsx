import type { RootState, AppDispatch } from 'src/store';
import type { Policy } from 'src/store/slices/policySlice';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { VIEW_ICONS } from 'src/constant';
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
  BaseIconButton,
  BaseCircularProgress,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

type PolicyRow = {
  id: string;
  name: string;
  type: string;
  content: string;
  status: string;
  originalPolicy: Policy;
};

export function PolicyView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { policies, loading, error } = useSelector((state: RootState) => state.policy);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPolicies());
  }, [dispatch]);

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
    type: policy.type,
    content: policy.content,
    status: policy.status ? 'Active' : 'Inactive',
    originalPolicy: policy,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase().trim();

    const matchName = row.name?.toLowerCase().includes(searchLower);
    const matchType = row.type?.toLowerCase().includes(searchLower);
    const matchContent = row.content?.toLowerCase().includes(searchLower);
    const matchStatus = row.status?.toLowerCase().includes(searchLower);

    return matchName || matchType || matchContent || matchStatus;
  });

  const columns: Column<PolicyRow>[] = [
    {
      id: 'name',
      label: 'Policy Name',
      align: 'left',
    },
    {
      id: 'type',
      label: 'Type',
      align: 'left',
      format: (value) => (
        <BaseBox
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 0.75,
            display: 'inline-flex',
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'capitalize',
          }}
        >
          {value as string}
        </BaseBox>
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
              handleViewPolicy(row.originalPolicy);
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
          <BaseIconButton
            size="small"
            color="secondary"
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
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 0.75,
                        display: 'inline-flex',
                        bgcolor: 'primary.lighter',
                        color: 'primary.dark',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {row.type}
                    </BaseBox>
                  </BaseBox>
                </BaseCard>
              ))}
            </BaseBox>
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

                {/* Type */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Type
                  </BaseTypography>
                  <BaseBox
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0.75,
                      display: 'inline-flex',
                      bgcolor: 'primary.lighter',
                      color: 'primary.dark',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {selectedPolicy.type}
                  </BaseBox>
                </BaseBox>

                {/* Content */}
                <BaseBox>
                  <BaseTypography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Content
                  </BaseTypography>
                  <BaseTypography variant="body1">
                    {selectedPolicy.content || 'No content available'}
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
                      bgcolor: selectedPolicy.status ? 'success.lighter' : 'error.lighter',
                      color: selectedPolicy.status ? 'success.dark' : 'error.dark',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedPolicy.status ? 'Active' : 'Inactive'}
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
