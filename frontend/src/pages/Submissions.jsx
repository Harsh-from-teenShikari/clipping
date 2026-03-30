import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { submissionsAPI, campaignsAPI } from '../api'
import { Spinner, Badge, PageHeader, Card, StatCard } from '../components/UI'
import styles from './Submissions.module.css'

const statusColor = (s) => {
  if (s === 'approved') return 'green'
  if (s === 'pending') return 'orange'
  if (s === 'rejected') return 'red'
  if (s === 'passed') return 'blue'
  return 'blue'
}

const statusLabel = (s) => {
  if (s === 'pending') return 'AI Verifying'
  return s?.charAt(0).toUpperCase() + s?.slice(1)
}

export default function Submissions() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [passedMap, setPassedMap] = useState({}) // campaignId -> passed submissions
  const [loading, setLoading] = useState(true)
  const [expandedCampaign, setExpandedCampaign] = useState(null)

  useEffect(() => {
    // Get all joined campaigns first, then get passed submissions per campaign
    campaignsAPI.getAll().then(async (res) => {
      const all = res.data
      // Filter campaigns where creator joined
      const joined = all.filter(c =>
        c.joined_creators?.includes(user?.creator_id)
      )
      setCampaigns(joined)

      // Fetch passed submissions for each joined campaign
      const passedResults = await Promise.allSettled(
        joined.map(c => submissionsAPI.getPassed(c.id))
      )

      const map = {}
      joined.forEach((c, i) => {
        const result = passedResults[i]
        if (result.status === 'fulfilled') {
          // Filter only this creator's submissions
          map[c.id] = result.value.data.filter(
            s => s.creator_id === user?.creator_id
          )
        } else {
          map[c.id] = []
        }
      })
      setPassedMap(map)
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  const totalPassed = Object.values(passedMap).flat().length
  const totalApproved = Object.values(passedMap).flat().filter(s => s.review_status === 'approved').length
  const totalRejected = Object.values(passedMap).flat().filter(s => s.review_status === 'rejected').length

  if (loading) return (
    <div className={styles.loadingWrap}><Spinner size={32} /></div>
  )

  return (
    <div className={styles.page}>
      <PageHeader
        title="My Submissions"
        subtitle="Track all your content submissions and their review status"
      />

      <div className={styles.statsGrid}>
        <StatCard label="Campaigns Joined" value={campaigns.length} />
        <StatCard label="Total Verified" value={totalPassed} accent="var(--blue)" />
        <StatCard label="Approved" value={totalApproved} accent="var(--green)" delta="Paid out" deltaType="up" />
        <StatCard label="Rejected" value={totalRejected} accent="var(--red)" />
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <div className={styles.emptyTitle}>No submissions yet</div>
            <div className={styles.emptyDesc}>Join campaigns and submit your content links to see them here</div>
          </div>
        </Card>
      ) : (
        <div className={styles.list}>
          {campaigns.map(campaign => {
            const subs = passedMap[campaign.id] || []
            const isExpanded = expandedCampaign === campaign.id

            return (
              <div key={campaign.id} className={styles.campaignBlock}>
                <div
                  className={styles.campaignHeader}
                  onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                >
                  <div className={styles.campaignLeft}>
                    <div className={styles.campaignLogo} data-type={campaign.type}>
                      {campaign.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.campaignName}>{campaign.name}</div>
                      <div className={styles.campaignMeta}>
                        {campaign.platform} · {campaign.type} · {subs.length} submission{subs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className={styles.campaignRight}>
                    <Badge color={campaign.status === 'active' ? 'green' : 'orange'}>
                      {campaign.status}
                    </Badge>
                    <svg
                      className={`${styles.chevron} ${isExpanded ? styles.chevronUp : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      width="16" height="16"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.subsContainer}>
                    {subs.length === 0 ? (
                      <div className={styles.noSubs}>
                        No verified submissions yet for this campaign. Submit a content link from the campaign page.
                      </div>
                    ) : (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Content Link</th>
                            <th>Passed AI Check</th>
                            <th>Review Status</th>
                            {subs.some(s => s.rejection_reason) && <th>Rejection Reason</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {subs.map(sub => (
                            <tr key={sub.id}>
                              <td>
                                <a
                                  href={sub.post_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.link}
                                >
                                  {sub.post_link?.length > 40
                                    ? sub.post_link.slice(0, 40) + '...'
                                    : sub.post_link}
                                </a>
                              </td>
                              <td>
                                <Badge color={sub.passed ? 'green' : 'red'}>
                                  {sub.passed ? '✓ Passed' : '✗ Failed'}
                                </Badge>
                              </td>
                              <td>
                                <Badge color={statusColor(sub.review_status)}>
                                  {statusLabel(sub.review_status)}
                                </Badge>
                              </td>
                              {subs.some(s => s.rejection_reason) && (
                                <td className={styles.rejectionReason}>
                                  {sub.rejection_reason || '—'}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.infoNote}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        Submissions are first verified by AI for engagement metrics. Passed submissions then go to the campaign operator for final review.
      </div>
    </div>
  )
}
