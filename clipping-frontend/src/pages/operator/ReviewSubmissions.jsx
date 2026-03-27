import { useState, useEffect } from 'react'
import { campaignsAPI, submissionsAPI } from '../../api'
import { Badge, Spinner, PageHeader, Alert, Button } from '../../components/UI'
import styles from './ReviewSubmissions.module.css'

const REJECTION_REASONS = [
  { value: 'op1', label: 'Content does not match brief' },
  { value: 'op2', label: 'Missing required hashtags' },
  { value: 'op3', label: 'Low quality content' },
  { value: 'op4', label: 'Contains banned keywords' },
]

function ReviewModal({ sub, onClose, onDone }) {
  const [status, setStatus] = useState('approved')
  const [reason, setReason] = useState('op1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await submissionsAPI.review(sub.id, status, status === 'rejected' ? reason : null)
      onDone()
    } catch (err) {
      setError(err.response?.data?.detail || 'Review failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Review Submission</h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.subLinkRow}>
            <span className={styles.subLinkLabel}>Content Link</span>
            <a href={sub.post_link} target="_blank" rel="noopener noreferrer" className={styles.subLink}>
              {sub.post_link?.length > 50 ? sub.post_link.slice(0, 50) + '...' : sub.post_link}
            </a>
          </div>
          <div className={styles.subCreatorRow}>
            <span className={styles.subLinkLabel}>Creator ID</span>
            <span className={styles.creatorId}>{sub.creator_id?.slice(0, 20)}...</span>
          </div>

          <div className={styles.decisionRow}>
            <div
              className={`${styles.decisionCard} ${status === 'approved' ? styles.decisionApprove : ''}`}
              onClick={() => setStatus('approved')}
            >
              <div className={styles.decisionIcon}>✓</div>
              <div className={styles.decisionLabel}>Approve</div>
              <div className={styles.decisionDesc}>Creator gets paid</div>
            </div>
            <div
              className={`${styles.decisionCard} ${status === 'rejected' ? styles.decisionReject : ''}`}
              onClick={() => setStatus('rejected')}
            >
              <div className={styles.decisionIcon}>✕</div>
              <div className={styles.decisionLabel}>Reject</div>
              <div className={styles.decisionDesc}>Choose a reason</div>
            </div>
          </div>

          {status === 'rejected' && (
            <div className={styles.reasonSection}>
              <div className={styles.reasonLabel}>Rejection Reason *</div>
              {REJECTION_REASONS.map(r => (
                <div
                  key={r.value}
                  className={`${styles.reasonOption} ${reason === r.value ? styles.reasonSelected : ''}`}
                  onClick={() => setReason(r.value)}
                >
                  <div className={`${styles.radioCircle} ${reason === r.value ? styles.radioSelected : ''}`} />
                  {r.label}
                </div>
              ))}
            </div>
          )}

          {error && <Alert type="error">{error}</Alert>}
        </div>

        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            style={status === 'rejected' ? { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,77,109,0.25)' } : {}}
          >
            {status === 'approved' ? '✓ Approve Submission' : '✕ Reject Submission'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ReviewSubmissions() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [subLoading, setSubLoading] = useState(false)
  const [reviewSub, setReviewSub] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    campaignsAPI.getAll()
      .then(res => {
        const active = res.data.filter(c => c.status === 'active' || c.status === 'paused')
        setCampaigns(active)
        if (active.length > 0) loadSubmissions(active[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadSubmissions = async (campaign) => {
    setSelectedCampaign(campaign)
    setSubLoading(true)
    setSubmissions([])
    try {
      const res = await submissionsAPI.getPassed(campaign.id)
      setSubmissions(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setSubLoading(false)
    }
  }

  const handleReviewDone = () => {
    setReviewSub(null)
    setSuccessMsg('Review submitted successfully!')
    setTimeout(() => setSuccessMsg(''), 3000)
    if (selectedCampaign) loadSubmissions(selectedCampaign)
  }

  const pending = submissions.filter(s => s.review_status === 'pending')
  const reviewed = submissions.filter(s => s.review_status !== 'pending')

  if (loading) return <div className={styles.loadingWrap}><Spinner size={32} /></div>

  return (
    <div className={styles.page}>
      <PageHeader
        title="Review Submissions"
        subtitle="AI-verified submissions waiting for your approval or rejection"
      />

      {successMsg && <Alert type="success" style={{ marginBottom: '1rem' }}>{successMsg}</Alert>}

      {campaigns.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📭</div>
          <div className={styles.emptyTitle}>No active campaigns</div>
          <div className={styles.emptyDesc}>Activate a campaign first to start receiving submissions</div>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Campaign selector sidebar */}
          <div className={styles.campList}>
            <div className={styles.campListTitle}>Select Campaign</div>
            {campaigns.map(c => (
              <div
                key={c.id}
                className={`${styles.campItem} ${selectedCampaign?.id === c.id ? styles.campItemActive : ''}`}
                onClick={() => loadSubmissions(c)}
              >
                <div className={styles.campItemName}>{c.name}</div>
                <div className={styles.campItemMeta}>{c.platform} · {c.status}</div>
              </div>
            ))}
          </div>

          {/* Submissions panel */}
          <div className={styles.subsPanel}>
            {subLoading ? (
              <div className={styles.subLoading}><Spinner size={24} /></div>
            ) : submissions.length === 0 ? (
              <div className={styles.noSubs}>
                <div className={styles.emptyIcon}>📬</div>
                <div className={styles.emptyTitle}>No verified submissions yet</div>
                <div className={styles.emptyDesc}>Submissions appear here after passing AI verification</div>
              </div>
            ) : (
              <>
                {/* Pending review */}
                {pending.length > 0 && (
                  <div className={styles.subsSection}>
                    <div className={styles.subsSectionTitle}>
                      Pending Review
                      <span className={styles.countBadge}>{pending.length}</span>
                    </div>
                    {pending.map(sub => (
                      <div key={sub.id} className={styles.subCard}>
                        <div className={styles.subCardLeft}>
                          <div className={styles.subCreatorAvatar}>
                            {sub.creator_id?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.subCreatorName}>
                              Creator {sub.creator_id?.slice(0, 8)}...
                            </div>
                            <a
                              href={sub.post_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.subLink}
                            >
                              {sub.post_link?.length > 45 ? sub.post_link.slice(0, 45) + '...' : sub.post_link}
                            </a>
                          </div>
                        </div>
                        <div className={styles.subCardRight}>
                          <Badge color="blue">AI Passed ✓</Badge>
                          <button
                            className={styles.reviewBtn}
                            onClick={() => setReviewSub(sub)}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Already reviewed */}
                {reviewed.length > 0 && (
                  <div className={styles.subsSection}>
                    <div className={styles.subsSectionTitle}>
                      Already Reviewed
                      <span className={styles.countBadge} style={{ background: 'var(--surface2)' }}>{reviewed.length}</span>
                    </div>
                    {reviewed.map(sub => (
                      <div key={sub.id} className={`${styles.subCard} ${styles.subCardReviewed}`}>
                        <div className={styles.subCardLeft}>
                          <div className={styles.subCreatorAvatar} style={{ opacity: 0.5 }}>
                            {sub.creator_id?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.subCreatorName}>
                              Creator {sub.creator_id?.slice(0, 8)}...
                            </div>
                            <a
                              href={sub.post_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.subLink}
                            >
                              {sub.post_link?.length > 45 ? sub.post_link.slice(0, 45) + '...' : sub.post_link}
                            </a>
                            {sub.rejection_reason && (
                              <div className={styles.rejReason}>
                                Reason: {REJECTION_REASONS.find(r => r.value === sub.rejection_reason)?.label || sub.rejection_reason}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={styles.subCardRight}>
                          <Badge color={sub.review_status === 'approved' ? 'green' : 'red'}>
                            {sub.review_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {reviewSub && (
        <ReviewModal
          sub={reviewSub}
          onClose={() => setReviewSub(null)}
          onDone={handleReviewDone}
        />
      )}
    </div>
  )
}
