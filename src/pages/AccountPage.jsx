import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfileContext } from "../context/ProfileContext";
import "../css/AccountPage.css";

function AccountPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useProfileContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate("/profiles", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <Link to="/login" className="account-brand" aria-label="MovieFlix sign in">
          MOVIE<span>FLIX</span>
        </Link>
      </header>

      <section className="account-card" aria-labelledby="account-title">
        <p className="eyebrow">YOUR MOVIEFLIX ACCOUNT</p>
        <h1 id="account-title">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="account-description">
          {isRegister
            ? "Create an account to save your profiles and watch lists."
            : "Sign in to pick up where you left off."}
        </p>

        <form className="account-form" onSubmit={handleSubmit}>
          <label htmlFor="account-email">Email</label>
          <input
            id="account-email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="account-password">Password</label>
          <input
            id="account-password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 12 : undefined}
            maxLength={72}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isRegister && (
            <p className="password-hint">Use at least 12 characters.</p>
          )}

          {error && <p className="account-error" role="alert">{error}</p>}
          <button type="submit" className="account-submit" disabled={submitting}>
            {submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="account-switch">
          {isRegister ? "Already have an account?" : "New to MovieFlix?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </div>
  );
}

export default AccountPage;
