import { Link, NavLink } from "react-router-dom";
import { useProfileContext } from "../context/ProfileContext";
import SignOutButton from "./SignOutButton";
import "../css/Navbar.css";

function NavBar() {
  const { activeProfile } = useProfileContext();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" aria-label="MovieFlix home">
        MOVIE<span>FLIX</span>
      </Link>
      <nav className="navbar-links" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Home
        </NavLink>
        <NavLink to="/Favorite" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          My List
        </NavLink>
      </nav>
      <Link
        to="/profiles"
        className="profile-switch"
        aria-label={`Switch profile, currently ${activeProfile.name}`}
      >
        <span className={`profile-switch-avatar avatar-${activeProfile.avatar}`} aria-hidden="true">
          {activeProfile.name.trim().slice(0, 1).toUpperCase()}
        </span>
        <span className="profile-switch-name">{activeProfile.name}</span>
        <span aria-hidden="true">⌄</span>
      </Link>
      <SignOutButton />
    </header>
  );
}

export default NavBar;