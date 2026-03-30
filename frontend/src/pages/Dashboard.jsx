import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { identityAPI, campaignsAPI } from '../api'
import { StatCard, Card, Spinner, Badge, PageHeader } from '../components/UI'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [joinedCampaigns, setJoinedCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const creatorId = user?.creator_id
    if (!creatorId) return

    Promise.all([
      identityAPI.getDashboard(creatorId),
      campaignsAPI.getAll('active'),
      campaignsAPI.getJoinedNotSubmitted(creatorId),
    ]).then(([dashRes, campRes, joinedRes]) => {
      setData(dashRes.data)
      setCampaigns(campRes.data.slice(0, 3))
      setJoinedCampaigns(joinedRes.data.slice(0, 3))
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div className={styles.loadingWrap}>
      <Spinner size={32} />
    </div>
  )

  const stats = data?.stats || {}
  const profile = data?.creator_profile || {}

  return (
    <div className={styles.page}>
      <PageHeader
        title={`${greeting()}, ${user?.email?.split('@')[0]} 👋`}
        subtitle="Here's what's happening with your campaigns today"
      />

      <div className={styles.statsGrid}>
        <StatCard
          label="Available Balance"
          value={`$${(stats.available_balance || 0).toFixed(2)}`}
          accent="var(--accent)"
          delta="Earned from approved submissions"
          deltaType="neutral"
        />
        <StatCard
          label="Total Submissions"
          value={stats.total_submissions || 0}
          delta={`${stats.approved_submissions || 0} approved`}
          deltaType="up"
        />
        <StatCard
          label="Pending Payout"
          value={`$${(stats.pending_payout_amount || 0).toFixed(2)}`}
          delta="Awaiting processing"
          deltaType="neutral"
        />
        <StatCard
          label="Trust Score"
          value={`${stats.trust_score || 0}%`}
          delta={stats.trust_score >= 80 ? '⭐ Top creator' : 'Keep submitting'}
          deltaType={stats.trust_score >= 80 ? 'up' : 'neutral'}
        />
      </div>

      <div className={styles.twoCol}>
        <Card>
          <h3 className={styles.cardTitle}>Featured Campaigns</h3>
          {campaigns.length === 0 ? (
            <p className={styles.empty}>No featured campaigns right now</p>
          ) : (
            <div className={styles.campaignList}>
              {campaigns.map(c => (
                <div key={c.id} className={styles.campaignRow} onClick={() => navigate(`/app/campaigns/${c.id}`)}>
                  <div>
                    <div className={styles.campaignName}>{c.name}</div>
                    <div className={styles.campaignMeta}>{c.platform} · {c.type}</div>
                  </div>
                  <div className={styles.campaignRight}>
                    <div className={styles.campaignReward}>${c.reward_pool}</div>
                    <Badge color="green">Featured</Badge>
                  </div>
                </div>
              ))}
              <button className={styles.viewAllBtn} onClick={() => navigate('/app/campaigns')}>
                View all campaigns →
              </button>
            </div>
          )}
        </Card>

        <Card>
          <h3 className={styles.cardTitle}>Joined (Awaiting Submission)</h3>
          {joinedCampaigns.length === 0 ? (
            <p className={styles.empty}>You have no pending submissions.</p>
          ) : (
            <div className={styles.campaignList}>
              {joinedCampaigns.map(c => (
                <div key={c.id} className={styles.campaignRow} onClick={() => navigate(`/app/campaigns/${c.id}`)}>
                  <div>
                    <div className={styles.campaignName}>{c.name}</div>
                    <div className={styles.campaignMeta}>{c.platform} · Action Required</div>
                  </div>
                  <div className={styles.campaignRight}>
                    <div className={styles.campaignReward}>${c.reward_pool}</div>
                    <Badge color="orange">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
