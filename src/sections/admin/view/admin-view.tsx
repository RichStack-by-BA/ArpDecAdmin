import type { RootState, AppDispatch } from 'src/store';
import type { User } from 'src/store/slices/usersSlice';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { PAGE_LIMIT } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchUsers } from 'src/store/slices/usersSlice';
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
  const { users: admins, loading, error, totalCount, currentPage } = useSelector((state: RootState) => state.users);

  const [search, setSearch] = useState('');
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
        <BaseBox sx={{ p: 3 }}>
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
            <DataTable columns={columns} rows={filteredRows} />

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
        title="Admin Details"
        maxWidth="sm"
      >
        {selectedAdmin && (
          <BaseBox sx={{ p: 2 }}>
            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Name
              </BaseTypography>
              <BaseTypography variant="body1">{selectedAdmin.name}</BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Email
              </BaseTypography>
              <BaseTypography variant="body1">{selectedAdmin.email}</BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Phone
              </BaseTypography>
              <BaseTypography variant="body1">{selectedAdmin.phone || 'N/A'}</BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Role
              </BaseTypography>
              <BaseTypography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {selectedAdmin.role}
              </BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </BaseTypography>
              <BaseBox
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 0.75,
                  display: 'inline-flex',
                  bgcolor: selectedAdmin.status ? 'success.lighter' : 'error.lighter',
                  color: selectedAdmin.status ? 'success.dark' : 'error.dark',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {selectedAdmin.status ? 'Active' : 'Inactive'}
              </BaseBox>
            </BaseBox>

            <BaseBox sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
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
            </BaseBox>
          </BaseBox>
        )}
      </BaseDialog>
    </DashboardContent>
  );
}
