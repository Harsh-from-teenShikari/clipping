import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api";
import { Input, Button, Alert } from "../components/UI";
import styles from "./Auth.module.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
          <div className={styles.logoMark}>C</div>
          <div>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Sign in to your Clipping account</p>
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
            style={{ width: "100%", marginTop: "4px" }}
          >
            Sign In →
          </Button>
        </form>

        <p className={styles.alt}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.altLink}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
