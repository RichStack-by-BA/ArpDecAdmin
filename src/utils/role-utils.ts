// Utility to get display name for user roles
export function getRoleDisplayName(role?: string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'N/A';
  }
}
