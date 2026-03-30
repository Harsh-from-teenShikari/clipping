import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { campaignsAPI, submissionsAPI } from "../api";
import { Button, Badge, Spinner, Alert, Input } from "../components/UI";
import styles from "./CampaignDetail.module.css";

const typeColor = (t) => {
  if (t === "CLIPPING") return "accent";
  if (t === "AFFILIATE") return "purple";
  return "blue";
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  // Submit form
  const [showSubmit, setShowSubmit] = useState(false);
  const [contentUrl, setContentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    campaignsAPI
      .getOne(id)
      .then((res) => {
        setCampaign(res.data);
        // Check if creator already joined
        const creatorId = user?.creator_id;
        if (creatorId && res.data.joined_creators?.includes(creatorId)) {
          setJoined(true);
        }
      })
      .catch(() => navigate("/app/campaigns"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    setJoinError("");
    try {
      await campaignsAPI.join(id, user.creator_id);
      setJoined(true);
      setJoinSuccess("Successfully joined! You can now submit content.");
      setCampaign((prev) => ({
        ...prev,
        joined_creators: [...(prev.joined_creators || []), user.creator_id],
      }));
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to join campaign";
      if (msg.includes("Already joined")) {
        setJoined(true);
        setJoinSuccess("You have already joined this campaign.");
      } else {
        setJoinError(msg);
      }
    } finally {
      setJoining(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contentUrl.trim()) {
      setSubmitError("Please enter a content URL");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await submissionsAPI.create(id, user.creator_id, contentUrl);
      setSubmitSuccess("Submission received! AI is verifying your content.");
      setContentUrl("");
      setShowSubmit(false);
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || "Submission failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={32} />
      </div>
    );

  if (!campaign) return null;

  const joinedCount = campaign.joined_creators?.length || 0;
  const isOperator = user?.role === "operator";

  return (
    <div className={styles.page}>
      <button
        className={styles.backBtn}
        onClick={() => navigate(isOperator ? "/operator/campaigns" : "/app/campaigns")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          width="15"
          height="15"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Campaigns
      </button>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroBrandLogo} data-type={campaign.type}>
            {campaign.name.slice(0, 2).toUpperCase()}
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroMeta}>
              <Badge color={campaign.status === "active" ? "green" : "orange"}>
                {campaign.status}
              </Badge>
              <Badge color={typeColor(campaign.type)}>{campaign.type}</Badge>
              <span className={styles.platform}>{campaign.platform}</span>
            </div>
            <h1 className={styles.heroTitle}>{campaign.name}</h1>
          </div>
        </div>

        <div className={styles.heroMetrics}>
          <div className={styles.metric}>
            <div className={styles.metricVal}>${campaign.reward_pool}</div>
            <div className={styles.metricLbl}>Reward Pool</div>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <div className={styles.metricVal}>
              {campaign.target_metric?.toLocaleString() || "—"}
            </div>
            <div className={styles.metricLbl}>Views Required</div>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <div className={styles.metricVal}>
              ${campaign.target_reward || "—"}
            </div>
            <div className={styles.metricLbl}>Reward Per Creator</div>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <div className={styles.metricVal}>{joinedCount}</div>
            <div className={styles.metricLbl}>Creators Joined</div>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <div
              className={styles.metricVal}
              style={{ textTransform: "capitalize" }}
            >
              {campaign.platform}
            </div>
            <div className={styles.metricLbl}>Platform</div>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <div
              className={styles.metricVal}
              style={{ textTransform: "capitalize" }}
            >
              {campaign.status}
            </div>
            <div className={styles.metricLbl}>Status</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.left}>
          {/* Required Hashtags */}
          {campaign.banned_keywords?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Banned Keywords</h3>
              <p
                style={{
                  fontSize: "0.83rem",
                  color: "var(--muted)",
                  marginBottom: "10px",
                }}
              >
                Your content must NOT contain these words or it will be rejected
              </p>
              <div className={styles.tagList}>
                {campaign.banned_keywords.map((keyword) => (
                  <span
                    key={keyword}
                    style={{
                      fontSize: "0.82rem",
                      padding: "5px 12px",
                      borderRadius: "100px",
                      background: "var(--red-dim)",
                      color: "var(--red)",
                      border: "1px solid rgba(255,77,109,0.2)",
                      fontWeight: 600,
                    }}
                  >
                    🚫 {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>What's Required</h3>
            <div className={styles.reqList}>
              <div className={styles.reqItem}>
                <div className={styles.reqCheck}>✓</div>
                <span>
                  Post on <strong>{campaign.platform}</strong> and submit the
                  link
                </span>
              </div>
              <div className={styles.reqItem}>
                <div className={styles.reqCheck}>✓</div>
                <span>
                  Campaign type: <strong>{campaign.type}</strong>
                </span>
              </div>
              {campaign.required_hashtags?.length > 0 && (
                <div className={styles.reqItem}>
                  <div className={styles.reqCheck}>✓</div>
                  <span>
                    Include hashtags:{" "}
                    <strong>
                      {campaign.required_hashtags
                        .map((h) => `#${h}`)
                        .join(", ")}
                    </strong>
                  </span>
                </div>
              )}
              <div className={styles.reqItem}>
                <div className={styles.reqCheck}>✓</div>
                <span>
                  Content will be <strong>AI-verified</strong> for engagement
                  metrics
                </span>
              </div>
            </div>
          </div>

          {/* Submit Content Form */}
          {joined && !isOperator && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Submit Your Content</h3>
              {submitSuccess && (
                <Alert type="success" style={{ marginBottom: "1rem" }}>
                  {submitSuccess}
                </Alert>
              )}
              {!showSubmit ? (
                <button
                  className={styles.submitToggleBtn}
                  onClick={() => {
                    setShowSubmit(true);
                    setSubmitSuccess("");
                  }}
                >
                  + Submit a new content link
                </button>
              ) : (
                <form onSubmit={handleSubmit} className={styles.submitForm}>
                  <Input
                    label="Content URL"
                    type="url"
                    placeholder="https://instagram.com/p/yourpost or https://youtube.com/watch?v=..."
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                  />
                  {submitError && <Alert type="error">{submitError}</Alert>}
                  <div className={styles.submitActions}>
                    <Button type="submit" loading={submitting}>
                      Submit for Review
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowSubmit(false);
                        setSubmitError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className={styles.submitNote}>
                    Our AI will automatically parse your link and verify view
                    counts against the campaign's target metric.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.applyCard}>
            <div className={styles.applyReward}>${campaign.reward_pool}</div>
            <div className={styles.applyRewardSub}>Total reward pool</div>

            <div className={styles.infoRows}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Type</span>
                <span className={styles.infoVal}>{campaign.type}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Platform</span>
                <span
                  className={styles.infoVal}
                  style={{ textTransform: "capitalize" }}
                >
                  {campaign.platform}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Creators Joined</span>
                <span className={styles.infoVal}>{joinedCount}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status</span>
                <span>
                  <Badge
                    color={campaign.status === "active" ? "green" : "orange"}
                  >
                    {campaign.status}
                  </Badge>
                </span>
              </div>
            </div>

            {joinError && (
              <Alert type="error" style={{ marginBottom: "12px" }}>
                {joinError}
              </Alert>
            )}
            {joinSuccess && (
              <Alert type="success" style={{ marginBottom: "12px" }}>
                {joinSuccess}
              </Alert>
            )}

            {!isOperator && (
              <>
                {!joined ? (
                  <Button
                    style={{ width: "100%" }}
                    size="lg"
                    loading={joining}
                    onClick={handleJoin}
                    disabled={campaign.status !== "active"}
                  >
                    {campaign.status !== "active"
                      ? "Campaign Not Active"
                      : "Join Campaign →"}
                  </Button>
                ) : (
                  <>
                    <div className={styles.joinedBadge}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        width="16"
                        height="16"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Joined Successfully
                    </div>
                    <Button
                      variant="ghost"
                      style={{ width: "100%", marginTop: "8px" }}
                      onClick={() => {
                        setShowSubmit(true);
                        document
                          .querySelector('[class*="left"]')
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Submit Content →
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
