import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { campaignsAPI } from "../../api";
import { Badge, Spinner, PageHeader, Button, Alert } from "../../components/UI";
import styles from "./OperatorCampaigns.module.css";

export default function OperatorCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Only fetch THIS operator's campaigns
      const res = await campaignsAPI.getMyOperatorCampaigns(user.id);
      setCampaigns(res.data);
    } catch (err) {
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id, name) => {
    setActionLoading((p) => ({ ...p, [id]: "activating" }));
    setError("");
    try {
      await campaignsAPI.activate(id);
      setMessage(`"${name}" is now live!`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to activate");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handlePause = async (id, name) => {
    setActionLoading((p) => ({ ...p, [id]: "pausing" }));
    setError("");
    try {
      await campaignsAPI.pause(id);
      setMessage(`"${name}" has been paused`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to pause");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  if (loading)
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={32} />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageHeader
        title="My Campaigns"
        subtitle="Activate, pause and manage your campaigns"
        action={
          <Button onClick={() => navigate("/operator/create")}>
            + New Campaign
          </Button>
        }
      />

      {message && (
        <Alert type="success" style={{ marginBottom: "1rem" }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert type="error" style={{ marginBottom: "1rem" }}>
          {error}
        </Alert>
      )}

      {campaigns.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🚀</div>
          <div className={styles.emptyTitle}>No campaigns yet</div>
          <div className={styles.emptyDesc}>
            Create your first campaign to get started
          </div>
          <Button
            style={{ marginTop: "1rem" }}
            onClick={() => navigate("/operator/create")}
          >
            Create Campaign →
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {campaigns.map((c) => (
            <div key={c.id} className={styles.campaignCard}>
              <div className={styles.cardLeft}>
                <div className={styles.brandLogo} data-type={c.type}>
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.campName}>{c.name}</div>
                  <div className={styles.campMeta}>
                    <span style={{ textTransform: "capitalize" }}>
                      {c.platform}
                    </span>
                    <span>·</span>
                    <span>{c.type}</span>
                    <span>·</span>
                    <span className={styles.campReward}>
                      ${c.reward_pool?.toLocaleString()} pool
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.cardRight}>
                <Badge
                  color={
                    c.status === "active"
                      ? "green"
                      : c.status === "paused"
                        ? "orange"
                        : "blue"
                  }
                >
                  {c.status}
                </Badge>
                <div className={styles.actions}>
                  {c.status === "draft" && (
                    <button
                      className={styles.activateBtn}
                      onClick={() => handleActivate(c.id, c.name)}
                      disabled={!!actionLoading[c.id]}
                    >
                      {actionLoading[c.id] === "activating"
                        ? "..."
                        : "▶ Activate"}
                    </button>
                  )}
                  {c.status === "active" && (
                    <button
                      className={styles.pauseBtn}
                      onClick={() => handlePause(c.id, c.name)}
                      disabled={!!actionLoading[c.id]}
                    >
                      {actionLoading[c.id] === "pausing" ? "..." : "⏸ Pause"}
                    </button>
                  )}
                  {c.status === "paused" && (
                    <button
                      className={styles.activateBtn}
                      onClick={() => handleActivate(c.id, c.name)}
                      disabled={!!actionLoading[c.id]}
                    >
                      {actionLoading[c.id] === "activating"
                        ? "..."
                        : "▶ Resume"}
                    </button>
                  )}
                  <button
                    className={styles.manageBtn}
                    onClick={() => navigate(`/operator/campaigns/${c.id}`)}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
