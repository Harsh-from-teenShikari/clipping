import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import styles from "./Welcome.module.css";

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/app/dashboard");
  }, [user]);

  return (
    <div className={styles.root}>
      <div className={styles.bg} />
      <div className={styles.grid} />

      <div className={styles.content}>
        <div className={styles.badge}>
          <div className={styles.badgeDot} />
          ColabEasy
        </div>

        <h1 className={styles.title}>
          Where Creators
          <span className={styles.titleAccent}>Meet Campaigns</span>
        </h1>

        <p className={styles.subtitle}>
          The fastest way for influencers to discover brand campaigns and submit
          content. AI-verified. Instant rewards.
        </p>

        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() =>
              navigate("/register", { state: { role: "creator" } })
            }
          >
            Join as Creator →
          </button>
          <button
            className={styles.btnGhost}
            onClick={() =>
              navigate("/register", { state: { role: "operator" } })
            }
          >
            Create Campaigns →
          </button>
        </div>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.82rem",
            color: "var(--muted)",
          }}
        >
          Already have an account?{" "}
          <span
            style={{
              color: "var(--accent)",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={() => navigate("/login")}
          >
            Sign In →
          </span>
        </p>
      </div>
    </div>
  );
}
