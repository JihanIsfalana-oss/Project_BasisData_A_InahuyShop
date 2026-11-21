export function LoadingState({ label = 'Memuat...' }) {
  return <p role="status">{label}</p>
}

export function EmptyState({ children = 'Belum ada data.' }) {
  return <p className="empty-state">{children}</p>
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="error-state">
      <p>{message || 'Terjadi kesalahan. Coba lagi.'}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}
