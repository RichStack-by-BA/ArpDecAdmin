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
import { Badge } from 'src/components/core/Badge';
import { InfoRow } from 'src/components/core/InfoRow';
import { SectionCard } from 'src/components/core/SectionCard';
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
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block',
                                maxWidth: '100%',
                              }}
                              title={row.email}
                            >
                              {row.email}
                            </span>
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

      {/* View Admin Modal - Refactored */}
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
            <BaseBox sx={{ p: 2, background: '#f3f4f6', borderRadius: 3 }}>
              {/* Top Section: Avatar, Name, Badges */}
              <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                {/* Avatar with initials */}
                <BaseBox sx={{ width: 64, height: 64, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '2rem' }}>
                  {selectedAdmin.firstName?.[0] || ''}{selectedAdmin.lastName?.[0] || ''}
                </BaseBox>
                <BaseBox>
                  <BaseTypography variant="h6" sx={{ fontWeight: 700 }}>{selectedAdmin.firstName} {selectedAdmin.lastName}</BaseTypography>
                  <BaseBox sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Badge color={selectedAdmin.status === true || selectedAdmin.status === 'Active' ? 'green' : 'yellow'} 
                    text={selectedAdmin.status === true || selectedAdmin.status === 'Active' ? 'Active' : 'Inactive'} />
                    {selectedAdmin.role === 'super_admin' ?
                      <Badge color="blue" text="Super Admin" /> :
                      <Badge color="blue" text={selectedAdmin.role} />}
                       <Badge
                        color={selectedAdmin.isEmailVerified ? 'green' : 'yellow'}
                        text={selectedAdmin.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                        emailVerification
                        verified={!!selectedAdmin.isEmailVerified}
                        icon={<Iconify icon={selectedAdmin.isEmailVerified ? "solar:check-circle-bold" : "solar:warning-bold"} width={18} />}
                      />
                  </BaseBox>
                </BaseBox>
              </BaseBox>

              {/* Section: Identity Information */}
              <SectionCard title="Identity Information">
                <InfoRow label="First Name" value={selectedAdmin.firstName || '-'} />
                <InfoRow label="Last Name" value={selectedAdmin.lastName || '-'} />
              </SectionCard>

              {/* Section: Contact Information */}
              <SectionCard title="Contact Information">
                <InfoRow
                  label="Phone Number" value={selectedAdmin.phone || '-'}
                  icon={<Iconify icon="solar:phone-bold" width={22} height={22} />}
                />
                <InfoRow
                  label="Email Address"
                  value={selectedAdmin.email}
                  icon={<span role="img" aria-label="mail" style={{ fontSize: 18, verticalAlign: 'middle' }}>✉️</span>}
                />
              </SectionCard>

              {/* Section: Other Details */}
              <SectionCard title="Other Details">
                {/* <InfoRow label="Account Status" value={<Badge color={selectedAdmin.status === true || selectedAdmin.status === 'Active' ? 'green' : 'yellow'} text={selectedAdmin.status === true || selectedAdmin.status === 'Active' ? 'Active' : 'Inactive'} />} /> */}
                 <InfoRow label="Created At" value={new Date(selectedAdmin.createdAt).toLocaleString()} icon={<Iconify icon="solar:calendar-bold" width={18} />} />
                 <InfoRow label="Last Updated" value={new Date(selectedAdmin.updatedAt).toLocaleString()} icon={<Iconify icon="solar:calendar-bold" width={18} />} />
              </SectionCard>

              {/* Actions */}
              <BaseBox sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <BaseButton variant="outlined" onClick={handleCloseModal}>
                  Close
                </BaseButton>
                <BaseButton
                  variant="contained"
                  onClick={() => {
                    navigate(`/admin/edit/${selectedAdmin.id}`);
                    handleCloseModal();
                  }}
                  color="primary"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                >
                  Edit Admin
                </BaseButton>
              </BaseBox>
            </BaseBox>
          )}
        </BaseDialog.Content>
      </BaseDialog>
    </DashboardContent>
  );
}
