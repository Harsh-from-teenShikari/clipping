import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import { Input, Button, Alert } from "../components/UI";
import styles from "./Auth.module.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Read role passed from Welcome page, default to creator
  const [role, setRole] = useState(location.state?.role || "creator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      login(res.data.user, res.data.access_token);
      if (role === "operator") {
        navigate("/operator/overview");
      } else {
        navigate("/app/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const isOperator = role === "operator";

  return (
    <div className={styles.root}>
      <div className={styles.bg} />
      <div className={styles.grid} />

      <Link to="/" className={styles.backLink}>
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
        Back to home
      </Link>

      <div className={styles.box}>
        <div className={styles.header}>
          <div
            className={styles.logoMark}
            style={{
              background: isOperator ? "var(--purple)" : "var(--accent)",
              color: isOperator ? "white" : "#0a0a0f",
            }}
          >
            {isOperator ? "O" : "C"}
          </div>
          <div>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Sign in to your Clipping account</p>
          </div>
        </div>

        {/* Role selector */}
        <div className={styles.roleSelector}>
          <div
            className={`${styles.roleCard} ${!isOperator ? styles.roleCardActive : ""}`}
            onClick={() => setRole("creator")}
          >
            <div className={styles.roleIcon}>🎥</div>
            <div className={styles.roleName}>Creator</div>
            <div className={styles.roleDesc}>Browse & apply to campaigns</div>
          </div>
          <div
            className={`${styles.roleCard} ${isOperator ? styles.roleCardActiveOp : ""}`}
            onClick={() => setRole("operator")}
          >
            <div className={styles.roleIcon}>📢</div>
            <div className={styles.roleName}>Operator</div>
            <div className={styles.roleDesc}>Post & manage campaigns</div>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            loading={loading}
            size="lg"
            style={{
              width: "100%",
              marginTop: "4px",
              background: isOperator ? "var(--purple)" : "var(--accent)",
              color: isOperator ? "white" : "#0a0a0f",
            }}
          >
            Sign In as {isOperator ? "Operator" : "Creator"} →
          </Button>
        </form>

        <p className={styles.alt}>
          Don't have an account?{" "}
          <Link to="/register" state={{ role }} className={styles.altLink}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
