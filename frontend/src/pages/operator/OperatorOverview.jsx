import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { campaignsAPI } from "../../api";
import {
  StatCard,
  Card,
  Badge,
  Spinner,
  PageHeader,
  Button,
} from "../../components/UI";
import styles from "./OperatorOverview.module.css";

export default function OperatorOverview() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    // Only fetch campaigns created by this operator
    campaignsAPI
      .getMyOperatorCampaigns(user.id)
      .then((res) => setCampaigns(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const active = campaigns.filter((c) => c.status === "active").length;
  const draft = campaigns.filter((c) => c.status === "draft").length;
  const paused = campaigns.filter((c) => c.status === "paused").length;
  const totalPool = campaigns.reduce((sum, c) => sum + (c.reward_pool || 0), 0);

  if (loading)
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={32} />
      </div>
    );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Operator Overview"
        subtitle="Manage your campaigns and review creator submissions"
        action={
          <Button onClick={() => navigate("/operator/create")}>
            + Create Campaign
          </Button>
        }
      />

      <div className={styles.statsGrid}>
        <StatCard label="My Campaigns" value={campaigns.length} />
        <StatCard
          label="Active"
          value={active}
          accent="var(--green)"
          delta="Currently running"
          deltaType="up"
        />
        <StatCard
          label="Draft"
          value={draft}
          accent="var(--orange)"
          delta="Not yet live"
          deltaType="neutral"
        />
        <StatCard
          label="Total Reward Pool"
          value={`$${totalPool.toLocaleString()}`}
          accent="var(--accent)"
        />
      </div>

      <Card>
        <div className={styles.tableHeader}>
          <h3 className={styles.cardTitle}>My Campaigns</h3>
          <Button size="sm" onClick={() => navigate("/operator/campaigns")}>
            Manage All
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <div className={styles.emptyTitle}>No campaigns yet</div>
            <div className={styles.emptyDesc}>
              Create your first campaign to start receiving creator submissions
            </div>
            <Button
              style={{ marginTop: "1rem" }}
              onClick={() => navigate("/operator/create")}
            >
              Create Campaign →
            </Button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Type</th>
                <th>Platform</th>
                <th>Reward Pool</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className={styles.campName}>{c.name}</div>
                  </td>
                  <td>
                    <Badge
                      color={
                        c.type === "CLIPPING"
                          ? "accent"
                          : c.type === "AFFILIATE"
                            ? "purple"
                            : "blue"
                      }
                    >
                      {c.type}
                    </Badge>
                  </td>
                  <td className={styles.platformCell}>{c.platform}</td>
                  <td className={styles.rewardCell}>
                    ${c.reward_pool?.toLocaleString()}
                  </td>
                  <td>
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
                  </td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => navigate(`/operator/campaigns/${c.id}`)}
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
