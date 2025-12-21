import type { RootState, AppDispatch } from 'src/store';
import type { User } from 'src/store/slices/usersSlice';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchUsers } from 'src/store/slices/usersSlice';
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

type AdminRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  originalAdmin: User;
};

export function AdminView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { users: admins, loading, error, totalCount } = useSelector((state: RootState) => state.users);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: PAGE_LIMIT, role: 'admin' }));
  }, [dispatch, page]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (search) {
      setPage(1);
    }
  }, [search]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewAdmin = (admin: User) => {
    setSelectedAdmin(admin);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAdmin(null);
  };

  // Transform admins into rows for the table
  const tableRows: AdminRow[] = admins.map((admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone || 'N/A',
    role: admin.role,
    status: admin.status ? 'Active' : 'Inactive',
    originalAdmin: admin,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase().trim();

    const matchName = row.name?.toLowerCase().includes(searchLower);
    const matchEmail = row.email?.toLowerCase().includes(searchLower);
    const matchPhone = row.phone?.toLowerCase().includes(searchLower);
    const matchRole = row.role?.toLowerCase().includes(searchLower);
    const matchStatus = row.status?.toLowerCase().includes(searchLower);

    return matchName || matchEmail || matchPhone || matchRole || matchStatus;
  });
  console.log('selectedAdmin:', selectedAdmin);

  const columns: Column<AdminRow>[] = [
    {
      id: 'name',
      label: 'Name',
      align: 'left',
    },
    {
      id: 'email',
      label: 'Email',
      align: 'left',
    },
    {
      id: 'phone',
      label: 'Phone',
      align: 'left',
    },
    {
      id: 'role',
      label: 'Role',
      align: 'center',
      format: (value) => (
        <BaseBox
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 0.75,
            display: 'inline-flex',
            bgcolor: value === 'admin' ? 'primary.lighter' : 'secondary.lighter',
            color: value === 'admin' ? 'primary.dark' : 'secondary.dark',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'capitalize',
          }}
        >
          {value}
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
              handleViewAdmin(row.originalAdmin);
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => {
              navigate(`/admin/edit/${row.id}`);
            }}
          >
            <Iconify icon="solar:pen-bold" />
          </BaseIconButton>
        </BaseBox>
      ),
    },
  ];

  return (
    <DashboardContent>
      <BaseBox sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <BaseTypography variant="h4" sx={{ flexGrow: 1 }}>
          Admins
        </BaseTypography>
        <BaseButton
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/admin/add')}
        >
          Add Admin
        </BaseButton>
      </BaseBox>

      {error && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </BaseAlert>
      )}

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admins..."
              slotProps={{
                input: {
                  startAdornment: (
                    <BaseBox sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="eva:search-fill" width={20} />
                    </BaseBox>
                  ),
                },
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

        {loading ? (
          <BaseBox
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <BaseCircularProgress />
          </BaseBox>
        ) : (
          <>
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
                        <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
                                handleViewAdmin(row.originalAdmin);
                              }}
                            >
                              <Iconify icon="solar:eye-bold" width={18} />
                            </BaseIconButton>
                            <BaseIconButton
                              size="small"
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/edit/${row.id}`);
                              }}
                            >
                              <Iconify icon="solar:pen-bold" width={18} />
                            </BaseIconButton>
                          </BaseBox>
                        </BaseBox>
                        <BaseTypography variant="h6" sx={{ mb: 1 }}>
                          {row.name}
                        </BaseTypography>
                        <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <BaseTypography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {row.email}
                          </BaseTypography>
                          <BaseTypography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {row.phone}
                          </BaseTypography>
                          <BaseBox
                            sx={{
                              mt: 1,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 0.75,
                              display: 'inline-flex',
                              bgcolor: row.role === 'admin' ? 'primary.lighter' : 'secondary.lighter',
                              color: row.role === 'admin' ? 'primary.dark' : 'secondary.dark',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              textTransform: 'capitalize',
                              width: 'fit-content',
                            }}
                          >
                            {row.role}
                          </BaseBox>
                        </BaseBox>
                      </BaseBox>
                    </BaseCard>
                  ))}
                </BaseBox>
              </BaseBox>
            )}

            {!error && !search && totalCount > PAGE_LIMIT && (
              <BaseBox sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <BasePagination
                  count={Math.ceil(totalCount / PAGE_LIMIT)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </BaseBox>
            )}
          </>
        )}
      </BaseCard>

      {/* View Admin Modal */}
      <BaseDialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">Admin Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedAdmin && (
            <BaseGrid container spacing={3}>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Admin ID
                </BaseTypography>
                <BaseTypography variant="body1">{selectedAdmin.id}</BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Phone
                </BaseTypography>
                <BaseTypography variant="body1">{selectedAdmin.phone || '-'}</BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  First Name
                </BaseTypography>
                <BaseTypography variant="body1">{selectedAdmin.firstName || '-'}</BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Name
                </BaseTypography>
                <BaseTypography variant="body1">{selectedAdmin.lastName || '-'}</BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email
                </BaseTypography>
                <BaseTypography variant="body1">
                  {selectedAdmin.email}
                  {typeof selectedAdmin.isEmailVerified !== 'undefined' && (
                    <span style={{ marginLeft: 8, color: selectedAdmin.isEmailVerified ? '#229A16' : '#B71D18', fontWeight: 600, fontSize: '0.9em' }}>
                      ({selectedAdmin.isEmailVerified ? 'Verified' : 'Not Verified'})
                    </span>
                  )}
                </BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </BaseTypography>
                <BaseTypography variant="body1">{selectedAdmin.status === true || selectedAdmin.status === 'Active' ? 'Active' : 'Inactive'}</BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created At
                </BaseTypography>
                <BaseTypography variant="body1">{new Date(selectedAdmin.createdAt).toLocaleString()}</BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Updated At
                </BaseTypography>
                <BaseTypography variant="body1">{new Date(selectedAdmin.updatedAt).toLocaleString()}</BaseTypography>
              </BaseGrid>
              <BaseGrid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <BaseButton variant="outlined" onClick={handleCloseModal}>
                  Close
                </BaseButton>
                <BaseButton
                  variant="contained"
                  onClick={() => {
                    navigate(`/admin/edit/${selectedAdmin.id}`);
                    handleCloseModal();
                  }}
                >
                  Edit
                </BaseButton>
              </BaseGrid>
            </BaseGrid>
          )}
        </BaseDialog.Content>
      </BaseDialog>
    </DashboardContent>
  );
}
