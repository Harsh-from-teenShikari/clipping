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
  
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.creator_id) return
    identityAPI.getDashboard(user.creator_id)
      .then(res => {
        setData(res.data)
        const p = res.data.creator_profile || {}
        setEditForm({
          bio: p.bio || '',
          instagram: p.instagram || '',
          facebook: p.facebook || '',
          youtube: p.youtube || '',
          twitter: p.twitter || '',
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const copyId = () => {
    navigator.clipboard.writeText(user?.creator_id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await identityAPI.updateProfile(user.creator_id, editForm)
      setData(prev => ({
        ...prev,
        creator_profile: { ...prev.creator_profile, ...res.data }
      }))
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert("Failed to save profile")
    } finally {
      setSaving(false)
    }
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
          {isEditing ? (
            <div className={styles.editActions}>
              <h3>Edit Profile</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </div>
          ) : (
            <div className={styles.editActions}>
              <h3>Creator Profile</h3>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
            </div>
          )}

          {isEditing ? (
            <div className={styles.editMode}>
              <div className={styles.inputGroup}>
                <label>Bio</label>
                <textarea 
                  value={editForm.bio} 
                  onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Instagram URL</label>
                <input 
                  type="text" 
                  value={editForm.instagram} 
                  onChange={e => setEditForm(prev => ({...prev, instagram: e.target.value}))}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>YouTube URL</label>
                <input 
                  type="text" 
                  value={editForm.youtube} 
                  onChange={e => setEditForm(prev => ({...prev, youtube: e.target.value}))}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Twitter URL</label>
                <input 
                  type="text" 
                  value={editForm.twitter} 
                  onChange={e => setEditForm(prev => ({...prev, twitter: e.target.value}))}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Facebook URL</label>
                <input 
                  type="text" 
                  value={editForm.facebook} 
                  onChange={e => setEditForm(prev => ({...prev, facebook: e.target.value}))}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
            </div>
          ) : (
            <div className={styles.infoList}>
              {profile.bio && (
                <div className={styles.infoRow} style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none' }}>
                  <span className={styles.infoLabel}>Bio</span>
                  <span className={styles.infoVal} style={{ textAlign: 'left', marginTop: '4px', fontSize: '0.9rem' }}>{profile.bio}</span>
                </div>
              )}
              <div className={styles.infoRow} style={{ borderTop: profile.bio ? '1px solid var(--border)' : 'none' }}>
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

              {/* Social Links */}
              <div className={styles.infoRow} style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span className={styles.infoLabel} style={{ width: '100%', marginBottom: '8px', display: 'block', fontWeight: '600' }}>Social Links</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Instagram</span>
                <span className={styles.infoVal}>
                  {profile.instagram ? <a href={profile.instagram} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>Link</a> : '—'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>YouTube</span>
                <span className={styles.infoVal}>
                  {profile.youtube ? <a href={profile.youtube} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>Link</a> : '—'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Twitter</span>
                <span className={styles.infoVal}>
                  {profile.twitter ? <a href={profile.twitter} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>Link</a> : '—'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Facebook</span>
                <span className={styles.infoVal}>
                  {profile.facebook ? <a href={profile.facebook} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>Link</a> : '—'}
                </span>
              </div>
            </div>
          )}
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
