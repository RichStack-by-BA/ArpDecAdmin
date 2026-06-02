const statusColorMap: Record<string, string> = {
  accepted: '#22c55e',
  completed: '#2563eb',
  pending: '#fbbf24',
  rejected: '#ef4444',
  cancelled: '#ef4444',
  shipped: '#0ea5e9',
};

export function getStatusColor(status: string) {
  return statusColorMap[status?.toLowerCase()] ?? '#64748b';
}
