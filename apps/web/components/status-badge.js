export function StatusBadge({ status }) {
  const className =
    status === 'Live' ? 'badge badge-live' : status === 'Beta' ? 'badge badge-beta' : 'badge';

  return <span className={className}>{status}</span>;
}
