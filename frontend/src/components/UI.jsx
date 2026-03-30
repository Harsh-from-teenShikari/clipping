import styles from './UI.module.css'

// ─── BUTTON ──────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, onClick, type = 'button', style }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  )
}

// ─── INPUT ───────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}

// ─── SELECT ──────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={`${styles.input} ${error ? styles.inputError : ''}`} {...props}>
        {children}
      </select>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}

// ─── CARD ────────────────────────────────────────────────
export function Card({ children, style, className }) {
  return (
    <div className={`${styles.card} ${className || ''}`} style={style}>
      {children}
    </div>
  )
}

// ─── STAT CARD ───────────────────────────────────────────
export function StatCard({ label, value, delta, deltaType, accent }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={accent ? { color: accent } : {}}>{value}</div>
      {delta && (
        <div className={`${styles.statDelta} ${deltaType === 'up' ? styles.deltaUp : deltaType === 'down' ? styles.deltaDown : styles.deltaNeutral}`}>
          {delta}
        </div>
      )}
    </div>
  )
}

// ─── BADGE ───────────────────────────────────────────────
export function Badge({ children, color = 'green' }) {
  const colorMap = {
    green: { bg: 'var(--green-dim)', text: 'var(--green)' },
    orange: { bg: 'var(--orange-dim)', text: 'var(--orange)' },
    blue: { bg: 'var(--blue-dim)', text: 'var(--blue)' },
    red: { bg: 'var(--red-dim)', text: 'var(--red)' },
    accent: { bg: 'var(--accent-dim)', text: 'var(--accent)' },
    purple: { bg: 'var(--purple-dim)', text: 'var(--purple)' },
  }
  const c = colorMap[color] || colorMap.green
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.text }}>
      {children}
    </span>
  )
}

// ─── SPINNER ─────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return <div className={styles.spinnerLg} style={{ width: size, height: size }} />
}

// ─── ALERT ───────────────────────────────────────────────
export function Alert({ type = 'error', children }) {
  const colorMap = {
    error: { bg: 'var(--red-dim)', border: 'rgba(255,77,109,0.25)', text: 'var(--red)' },
    success: { bg: 'var(--green-dim)', border: 'rgba(74,222,128,0.25)', text: 'var(--green)' },
    info: { bg: 'var(--blue-dim)', border: 'rgba(56,189,248,0.25)', text: 'var(--blue)' },
  }
  const c = colorMap[type]
  return (
    <div className={styles.alert} style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {children}
    </div>
  )
}

// ─── PAGE HEADER ─────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h2 className={styles.pageTitle}>{title}</h2>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
