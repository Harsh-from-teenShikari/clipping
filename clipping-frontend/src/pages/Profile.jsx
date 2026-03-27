import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { identityAPI } from '../api'
import { Spinner, Badge, PageHeader, Card, Alert, Button } from '../components/UI'
import styles from './Profile.module.css'

export default function Profile() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user?.creator_id) return
    identityAPI.getDashboard(user.creator_id)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const copyId = () => {
    navigator.clipboard.writeText(user?.creator_id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className={styles.loadingWrap}><Spinner size={32} /></div>
  )

  const profile = data?.creator_profile || {}
  const userInfo = data?.user_profile || {}
  const stats = data?.stats || {}
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'CR'

  return (
    <div className={styles.page}>
      <PageHeader
        title="My Profile"
        subtitle="Your creator identity and account details"
      />

      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerGlow} />
        <div className={styles.avatarLg}>{initials}</div>
        <div className={styles.bannerInfo}>
          <h2 className={styles.bannerName}>{user?.email?.split('@')[0]}</h2>
          <p className={styles.bannerEmail}>{user?.email}</p>
          <div className={styles.bannerBadges}>
            <Badge color={profile.kyc_status === 'verified' ? 'green' : 'orange'}>
              {profile.kyc_status === 'verified' ? '✓ Verified' : '⏳ KYC Pending'}
            </Badge>
            <Badge color="accent">{userInfo.role || 'creator'}</Badge>
            {stats.trust_score >= 80 && <Badge color="purple">⭐ Top Creator</Badge>}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Account Info */}
        <Card>
          <h3 className={styles.cardTitle}>Account Info</h3>
          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoVal}>{user?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoVal} style={{ textTransform: 'capitalize' }}>
                {userInfo.role || 'creator'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Creator ID</span>
              <div className={styles.idRow}>
                <span className={styles.idText}>{user?.creator_id?.slice(0, 18)}...</span>
                <button className={styles.copyBtn} onClick={copyId}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>KYC Status</span>
              <Badge color={profile.kyc_status === 'verified' ? 'green' : 'orange'}>
                {profile.kyc_status || 'pending'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Creator Profile */}
        <Card>
          <h3 className={styles.cardTitle}>Creator Profile</h3>
          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Niche</span>
              <span className={styles.infoVal}>{profile.niche || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Region</span>
              <span className={styles.infoVal}>{profile.region || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Followers</span>
              <span className={styles.infoVal}>
                {profile.followers ? profile.followers.toLocaleString() : '—'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Trust Score</span>
              <div className={styles.trustRow}>
                <div className={styles.trustBar}>
                  <div
                    className={styles.trustFill}
                    style={{ width: `${profile.trust_score || 0}%` }}
                  />
                </div>
                <span className={styles.trustVal}>{profile.trust_score || 0}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <Card>
          <h3 className={styles.cardTitle}>Performance Stats</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statBlock}>
              <div className={styles.statVal}>{stats.total_submissions || 0}</div>
              <div className={styles.statLbl}>Total Submissions</div>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statVal} style={{ color: 'var(--green)' }}>
                {stats.approved_submissions || 0}
              </div>
              <div className={styles.statLbl}>Approved</div>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statVal} style={{ color: 'var(--accent)' }}>
                ${(stats.available_balance || 0).toFixed(2)}
              </div>
              <div className={styles.statLbl}>Available Balance</div>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statVal} style={{ color: 'var(--orange)' }}>
                ${(stats.pending_payout_amount || 0).toFixed(2)}
              </div>
              <div className={styles.statLbl}>Pending Payout</div>
            </div>
          </div>
        </Card>

        {/* Submission Rate */}
        <Card>
          <h3 className={styles.cardTitle}>Approval Rate</h3>
          {stats.total_submissions > 0 ? (
            <>
              <div className={styles.rateCircleWrap}>
                <div className={styles.rateCircle}>
                  <svg viewBox="0 0 100 100" className={styles.rateSvg}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface2)" strokeWidth="10"/>
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="var(--accent)" strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats.approved_submissions / stats.total_submissions))}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div className={styles.rateLabel}>
                    <div className={styles.rateNum}>
                      {Math.round((stats.approved_submissions / stats.total_submissions) * 100)}%
                    </div>
                    <div className={styles.rateSub}>approval</div>
                  </div>
                </div>
              </div>
              <p className={styles.rateDesc}>
                {stats.approved_submissions} of {stats.total_submissions} submissions approved
              </p>
            </>
          ) : (
            <div className={styles.noData}>
              Submit content to campaigns to see your approval rate here.
            </div>
          )}
        </Card>
      </div>

      {/* Danger zone */}
      <Card style={{ marginTop: '1.25rem', borderColor: 'rgba(255,77,109,0.15)' }}>
        <h3 className={styles.cardTitle} style={{ color: 'var(--red)' }}>Account</h3>
        <div className={styles.dangerRow}>
          <div>
            <div className={styles.dangerTitle}>Sign out</div>
            <div className={styles.dangerDesc}>You'll need to sign back in to access your account</div>
          </div>
          <Button variant="danger" size="sm" onClick={() => {
            localStorage.clear()
            window.location.href = '/'
          }}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}
