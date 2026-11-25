import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfileContext } from "../context/ProfileContext";
import SignOutButton from "../components/SignOutButton";
import "../css/Profiles.css";

const avatarColors = ["coral", "violet", "teal", "amber", "blue"];

function initialsFor(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Profiles() {
  const { user, profiles, activeProfile, selectProfile, addProfile } = useProfileContext();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(avatarColors[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const chooseProfile = (profileId) => {
    selectProfile(profileId);
    navigate("/");
  };

  const handleCreateProfile = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a name for this profile.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const profile = await addProfile(trimmedName, avatar);
      selectProfile(profile);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profiles-page">
      <header className="profiles-header">
        <Link to="/" className="profiles-brand" aria-label="MovieFlix home">
          MOVIE<span>FLIX</span>
        </Link>
        <div className="profiles-account">
          <span>{user.email}</span>
          {activeProfile && (
            <Link to="/" className="continue-profile">
              Continue as {activeProfile.name}
            </Link>
          )}
          <SignOutButton className="profiles-signout" />
        </div>
      </header>

      <section className="profiles-content" aria-labelledby="profiles-title">
        <p className="eyebrow">YOUR SPACE, YOUR WATCH LIST</p>
        <h1 id="profiles-title">Who's watching MovieFlix?</h1>
        <p className="profiles-intro">Choose a profile to continue watching.</p>

        <div className="profile-grid">
          {profiles.map((profile) => (
            <button
              type="button"
              className="profile-choice"
              key={profile.id}
              onClick={() => chooseProfile(profile.id)}
              aria-label={`Continue as ${profile.name}`}
            >
              <span className={`profile-avatar avatar-${profile.avatar}`} aria-hidden="true">
                {initialsFor(profile.name)}
              </span>
              <span className="profile-name">{profile.name}</span>
            </button>
          ))}
          <button
            type="button"
            className="profile-choice add-profile"
            onClick={() => {
              setShowForm((isVisible) => !isVisible);
              setError("");
            }}
            aria-expanded={showForm}
          >
            <span className="add-profile-icon" aria-hidden="true">+</span>
            <span className="profile-name">Add profile</span>
          </button>
        </div>

        {showForm && (
          <form className="profile-form" onSubmit={handleCreateProfile}>
            <label htmlFor="profile-name">Name your profile</label>
            <input
              id="profile-name"
              autoFocus
              maxLength={24}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="e.g. Alex"
            />
            <fieldset>
              <legend>Choose a color</legend>
              <div className="avatar-color-options">
                {avatarColors.map((color) => (
                  <label className="avatar-color-option" key={color}>
                    <input
                      type="radio"
                      name="avatar-color"
                      value={color}
                      checked={avatar === color}
                      onChange={() => setAvatar(color)}
                    />
                    <span className={`profile-avatar avatar-${color}`} aria-hidden="true">
                      {initialsFor(name || "A")}
                    </span>
                    <span className="sr-only">{color}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {error && <p className="profile-error" role="alert">{error}</p>}
            <div className="profile-form-actions">
              <button type="submit" className="profile-save" disabled={saving}>
                {saving ? "Saving…" : "Create profile"}
              </button>
              <button
                type="button"
                className="profile-cancel"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default Profiles;
