import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { campaignsAPI } from "../../api";
import {
  Button,
  Input,
  Select,
  Alert,
  PageHeader,
  Card,
} from "../../components/UI";
import styles from "./CreateCampaign.module.css";

const STEPS = ["Basic Info", "Targeting", "Rewards", "Review"];

const EMPTY = {
  name: "",
  type: "CLIPPING",
  platform: [],
  region: "",
  min_followers: "",
  target_niche: "",
  required_hashtags: "",
  banned_keywords: "",
  reward_pool: "",
  target_metric: "",
  target_reward: "",
};

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(false);
  const [created, setCreated] = useState(null); // holds created campaign

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Campaign name is required";
      if (!form.region.trim()) return "Region is required";
      if (form.platform.length === 0) return "Select at least one platform"; // ✅ ADD THIS LINE
    }

    if (step === 1) {
      if (!form.target_niche.trim()) return "Target niche is required";
    }
    if (step === 2) {
      if (
        !form.reward_pool ||
        isNaN(form.reward_pool) ||
        Number(form.reward_pool) <= 0
      )
        return "Reward pool must be greater than 0";
      if (!form.target_metric || isNaN(form.target_metric))
        return "Target metric is required";
      if (!form.target_reward || isNaN(form.target_reward))
        return "Target reward is required";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const back = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        operator_id: user?.id,
        name: form.name.trim(),
        type: form.type,
        platform: form.platform.join(","),
        region: form.region.trim(),
        min_followers: Number(form.min_followers) || 0,
        target_niche: form.target_niche.trim(),
        required_hashtags: form.required_hashtags
          ? form.required_hashtags
              .split(",")
              .map((h) => h.trim())
              .filter(Boolean)
          : [],
        banned_keywords: form.banned_keywords
          ? form.banned_keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : [],
        reward_pool: Number(form.reward_pool),
        target_metric: Number(form.target_metric),
        target_reward: Number(form.target_reward),
      };
      const res = await campaignsAPI.create(payload);
      setCreated(res.data);
      setStep(4); // success step
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!created?.id) return;
    setActivating(true);
    try {
      await campaignsAPI.activate(created.id);
      navigate(`/operator/campaigns/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to activate");
    } finally {
      setActivating(false);
    }
  };

  // Success screen
  if (step === 4 && created) {
    return (
      <div className={styles.page}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Campaign Created!</h2>
          <p className={styles.successDesc}>
            <strong>{created.name}</strong> has been created as a draft.
            Activate it to make it visible to creators.
          </p>
          <div className={styles.successMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <span
                className={styles.metaVal}
                style={{ color: "var(--orange)" }}
              >
                Draft
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Reward Pool</span>
              <span
                className={styles.metaVal}
                style={{ color: "var(--accent)" }}
              >
                ${created.reward_pool}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Type</span>
              <span className={styles.metaVal}>{created.type}</span>
            </div>
          </div>
          {error && (
            <Alert type="error" style={{ marginBottom: "1rem" }}>
              {error}
            </Alert>
          )}
          <div className={styles.successActions}>
            <Button onClick={handleActivate} loading={activating} size="lg">
              🚀 Activate Now — Go Live
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/operator/campaigns")}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Create Campaign"
        subtitle="Set up a new campaign for creators to discover and apply"
      />

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s} className={styles.stepItem}>
            <div
              className={`${styles.stepDot} ${i === step ? styles.stepActive : i < step ? styles.stepDone : ""}`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ""}`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ""}`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className={styles.formCard}>
        {error && (
          <Alert type="error" style={{ marginBottom: "1.25rem" }}>
            {error}
          </Alert>
        )}

        {/* Step 0 — Basic Info */}
        {step === 0 && (
          <div className={styles.formSection}>
            <h3 className={styles.stepTitle}>Basic Information</h3>
            <p className={styles.stepDesc}>
              Set the name, type and platform for your campaign
            </p>
            <div className={styles.formGrid}>
              <Input
                label="Campaign Name *"
                placeholder="e.g. Summer Glow Campaign"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <Input
                label="Region *"
                placeholder="e.g. IN, US, GLOBAL"
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
              />
            </div>
            <div className={styles.formGrid}>
              <Select
                label="Campaign Type *"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="CLIPPING">CLIPPING — Views based</option>
                <option value="AFFILIATE">AFFILIATE — Sales based</option>
                <option value="SUBSCRIPTION">SUBSCRIPTION — Subs based</option>
              </Select>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Platform * (select multiple)
                </label>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {["instagram", "youtube", "twitter"].map((p) => {
                    const isSelected = form.platform.includes(p);

                    return (
                      <div
                        key={p}
                        onClick={() => {
                          if (isSelected) {
                            set(
                              "platform",
                              form.platform.filter((x) => x !== p),
                            );
                          } else {
                            set("platform", [...form.platform, p]);
                          }
                        }}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "100px",
                          border: `1px solid ${
                            isSelected ? "var(--accent)" : "var(--border)"
                          }`,
                          background: isSelected
                            ? "var(--accent-dim)"
                            : "transparent",
                          color: isSelected ? "var(--accent)" : "var(--muted)",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          transition: "all 0.15s",
                          userSelect: "none",
                        }}
                      >
                        {p === "instagram"
                          ? "📸"
                          : p === "youtube"
                            ? "▶️"
                            : "🐦"}{" "}
                        {p}
                      </div>
                    );
                  })}
                </div>

                {form.platform.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.74rem",
                      color: "var(--red)",
                      marginTop: "5px",
                    }}
                  >
                    Select at least one platform
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Targeting */}
        {step === 1 && (
          <div className={styles.formSection}>
            <h3 className={styles.stepTitle}>Targeting</h3>
            <p className={styles.stepDesc}>
              Define who can apply and what content rules apply
            </p>
            <div className={styles.formGrid}>
              <Input
                label="Target Niche *"
                placeholder="e.g. beauty, fitness, tech"
                value={form.target_niche}
                onChange={(e) => set("target_niche", e.target.value)}
              />
              <Input
                label="Minimum Followers"
                type="number"
                placeholder="e.g. 5000"
                value={form.min_followers}
                onChange={(e) => set("min_followers", e.target.value)}
              />
            </div>
            <div className={styles.formGrid}>
              <div>
                <Input
                  label="Required Hashtags"
                  placeholder="summer2025, collab, brand (comma separated)"
                  value={form.required_hashtags}
                  onChange={(e) => set("required_hashtags", e.target.value)}
                />
                <p className={styles.fieldHint}>
                  Creators must include these in their posts
                </p>
              </div>
              <div>
                <Input
                  label="Banned Keywords"
                  placeholder="competitor, promo, ad (comma separated)"
                  value={form.banned_keywords}
                  onChange={(e) => set("banned_keywords", e.target.value)}
                />
                <p className={styles.fieldHint}>
                  Posts containing these will be rejected
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Rewards */}
        {step === 2 && (
          <div className={styles.formSection}>
            <h3 className={styles.stepTitle}>Rewards & Metrics</h3>
            <p className={styles.stepDesc}>
              Set how much you're paying and what performance threshold to
              require
            </p>
            <div className={styles.formGrid}>
              <div>
                <Input
                  label="Total Reward Pool ($) *"
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.reward_pool}
                  onChange={(e) => set("reward_pool", e.target.value)}
                />
                <p className={styles.fieldHint}>
                  Total budget for this campaign
                </p>
              </div>
              <div>
                <Input
                  label="Target Metric *"
                  type="number"
                  placeholder="e.g. 10000 (views / clicks / subs)"
                  value={form.target_metric}
                  onChange={(e) => set("target_metric", e.target.value)}
                />
                <p className={styles.fieldHint}>
                  Minimum performance to qualify
                </p>
              </div>
            </div>
            <div className={styles.formGrid}>
              <div>
                <Input
                  label="Reward Per Creator ($) *"
                  type="number"
                  placeholder="e.g. 100"
                  value={form.target_reward}
                  onChange={(e) => set("target_reward", e.target.value)}
                />
                <p className={styles.fieldHint}>Paid per approved submission</p>
              </div>
              <div className={styles.rewardPreview}>
                <div className={styles.rewardPreviewLabel}>
                  Max Creators Payable
                </div>
                <div className={styles.rewardPreviewVal}>
                  {form.reward_pool &&
                  form.target_reward &&
                  Number(form.target_reward) > 0
                    ? Math.floor(
                        Number(form.reward_pool) / Number(form.target_reward),
                      )
                    : "—"}
                  <span> creators</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className={styles.formSection}>
            <h3 className={styles.stepTitle}>Review & Launch</h3>
            <p className={styles.stepDesc}>
              Confirm everything looks right before creating
            </p>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Campaign Name</div>
                <div className={styles.reviewVal}>{form.name}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Type</div>
                <div className={styles.reviewVal}>{form.type}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Platform</div>
                <div
                  className={styles.reviewVal}
                  style={{ textTransform: "capitalize" }}
                >
                  {Array.isArray(form.platform)
                    ? form.platform.join(", ")
                    : form.platform}
                </div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Region</div>
                <div className={styles.reviewVal}>{form.region}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Target Niche</div>
                <div className={styles.reviewVal}>{form.target_niche}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Min Followers</div>
                <div className={styles.reviewVal}>
                  {form.min_followers || "0"}
                </div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Required Hashtags</div>
                <div className={styles.reviewVal}>
                  {form.required_hashtags || "None"}
                </div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Banned Keywords</div>
                <div className={styles.reviewVal}>
                  {form.banned_keywords || "None"}
                </div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Reward Pool</div>
                <div
                  className={styles.reviewVal}
                  style={{ color: "var(--accent)" }}
                >
                  ${form.reward_pool}
                </div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Target Metric</div>
                <div className={styles.reviewVal}>
                  {Number(form.target_metric).toLocaleString()}
                </div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Per Creator Reward</div>
                <div
                  className={styles.reviewVal}
                  style={{ color: "var(--accent)" }}
                >
                  ${form.target_reward}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className={styles.formFooter}>
          {step > 0 && (
            <Button variant="ghost" onClick={back}>
              ← Back
            </Button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 && <Button onClick={next}>Continue →</Button>}
          {step === 3 && (
            <Button onClick={handleSubmit} loading={loading}>
              Create Campaign
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
