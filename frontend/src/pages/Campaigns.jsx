import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { campaignsAPI } from '../api'
import { Spinner, Badge, PageHeader } from '../components/UI'
import styles from './Campaigns.module.css'

const TYPES = ['All', 'CLIPPING', 'AFFILIATE', 'SUBSCRIPTION']
const PLATFORMS = ['All', 'instagram', 'youtube', 'Twitter']

const statusColor = (s) => {
  if (s === 'active') return 'green'
  if (s === 'paused') return 'orange'
  if (s === 'draft') return 'blue'
  return 'blue'
}

const typeColor = (t) => {
  if (t === 'CLIPPING') return 'accent'
  if (t === 'AFFILIATE') return 'purple'
  return 'blue'
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    fetchCampaigns()
  }, [typeFilter])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await campaignsAPI.getAll(
        'active',
        typeFilter !== 'All' ? typeFilter : undefined
      )
      setCampaigns(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = platformFilter === 'All' || c.platform === platformFilter
    return matchSearch && matchPlatform
  })

  return (
    <div className={styles.page}>
      <PageHeader
        title="Active Campaigns"
        subtitle="Discover campaigns, join them and start submitting content"
      />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search campaigns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          {TYPES.map(t => (
            <button
              key={t}
              className={`${styles.chip} ${typeFilter === t ? styles.chipActive : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          {PLATFORMS.map(p => (
            <button
              key={p}
              className={`${styles.chip} ${platformFilter === p ? styles.chipActive : ''}`}
              onClick={() => setPlatformFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyTitle}>No campaigns found</div>
          <div className={styles.emptyDesc}>Try changing your filters or check back later</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(c => (
            <div
              key={c.id}
              className={styles.card}
              onClick={() => navigate(`/app/campaigns/${c.id}`)}
            >
              <div className={styles.cardTop}>
                <div className={styles.brandLogo} data-type={c.type}>
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.cardMeta}>
                  <Badge color={statusColor(c.status)}>{c.status}</Badge>
                </div>
              </div>

              <h3 className={styles.campaignName}>{c.name}</h3>

              <div className={styles.tagRow}>
                <Badge color={typeColor(c.type)}>{c.type}</Badge>
                <span className={styles.platform}>{c.platform}</span>
              </div>

              <div className={styles.cardFooter}>
                <div>
                  <div className={styles.rewardVal}>${c.reward_pool}</div>
                  <div className={styles.rewardLbl}>reward pool</div>
                </div>
                <button
                  className={styles.joinBtn}
                  onClick={e => { e.stopPropagation(); navigate(`/app/campaigns/${c.id}`) }}
                >
                  View & Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
