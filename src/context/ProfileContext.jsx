import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { accountApi } from "../services/AccountApi";

const ProfileContext = createContext(null);
const LEGACY_PROFILES_KEY = "movieflix-profiles";
const LEGACY_ACTIVE_PROFILE_KEY = "movieflix-active-profile";

function getActiveProfileKey(userId) {
  return `movieflix-active-profile-${userId}`;
}

function readSavedActiveProfileId(userId) {
  try {
    return localStorage.getItem(getActiveProfileKey(userId));
  } catch (error) {
    console.error("Could not read the selected profile.", error);
    return null;
  }
}

function readLegacyProfiles() {
  try {
    const profiles = JSON.parse(localStorage.getItem(LEGACY_PROFILES_KEY));
    if (
      Array.isArray(profiles) &&
      profiles.every(
        (profile) =>
          typeof profile.id === "string" &&
          typeof profile.name === "string" &&
          typeof profile.avatar === "string"
      )
    ) {
      return profiles;
    }
  } catch (error) {
    console.error("Could not read locally saved profiles for migration.", error);
  }
  return [];
}

function removeLegacyProfiles() {
  localStorage.removeItem(LEGACY_PROFILES_KEY);
  localStorage.removeItem(LEGACY_ACTIVE_PROFILE_KEY);
}

export function ProfileProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [connectionError, setConnectionError] = useState("");

  const applyProfiles = useCallback((account, nextProfiles) => {
    setUser(account);
    setProfiles(nextProfiles);
    const savedId = readSavedActiveProfileId(account.id);
    const selected = nextProfiles.find((profile) => String(profile.id) === savedId) || null;
    setActiveProfile(selected);
    return selected;
  }, []);

  const restoreSession = useCallback(async () => {
    setStatus("loading");
    setConnectionError("");
    try {
      const { user: account } = await accountApi.getSession();
      const { profiles: accountProfiles } = await accountApi.getProfiles();
      applyProfiles(account, accountProfiles);
      setStatus("ready");
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        setProfiles([]);
        setActiveProfile(null);
        setStatus("ready");
        return;
      }
      setConnectionError(error.message);
      setStatus("error");
    }
  }, [applyProfiles]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const completeAuthentication = async (authenticate) => {
    const { user: account } = await authenticate();
    const { profiles: accountProfiles } = await accountApi.getProfiles();
    applyProfiles(account, accountProfiles);
    setStatus("ready");
    return account;
  };

  const register = async (email, password) => {
    const oldProfiles = readLegacyProfiles();
    const oldActiveProfileId = localStorage.getItem(LEGACY_ACTIVE_PROFILE_KEY);
    const { user: account } = await accountApi.register(email, password);
    const { profiles: accountProfiles } = await accountApi.getProfiles();
    let nextProfiles = accountProfiles;

    try {
      for (const oldProfile of oldProfiles) {
        const name = oldProfile.id === "movie-fan" && oldProfile.name === "Movie Fan"
          ? "You"
          : oldProfile.name.trim();
        if (!name || nextProfiles.some((profile) => profile.name.toLowerCase() === name.toLowerCase())) {
          continue;
        }
        const { profile } = await accountApi.createProfile(name, oldProfile.avatar);
        nextProfiles = [...nextProfiles, profile];
      }

      applyProfiles(account, nextProfiles);
      if (oldActiveProfileId) {
        const oldActiveProfile = oldProfiles.find((profile) => profile.id === oldActiveProfileId);
        const migratedProfile = oldActiveProfile && nextProfiles.find(
          (profile) => profile.name.toLowerCase() === oldActiveProfile.name.toLowerCase()
        );
        if (migratedProfile) {
          localStorage.setItem(getActiveProfileKey(account.id), String(migratedProfile.id));
          setActiveProfile(migratedProfile);
        }
      }
      removeLegacyProfiles();
      setStatus("ready");
      return account;
    } catch (error) {
      applyProfiles(account, nextProfiles);
      setStatus("ready");
      throw new Error(`Account created, but saved profiles could not be fully transferred: ${error.message}`);
    }
  };

  const login = (email, password) => completeAuthentication(
    () => accountApi.login(email, password)
  );

  const logout = async () => {
    await accountApi.logout();
    if (user) {
      localStorage.removeItem(getActiveProfileKey(user.id));
    }
    setUser(null);
    setProfiles([]);
    setActiveProfile(null);
    setStatus("ready");
  };

  const selectProfile = (profileOrId) => {
    const selected = typeof profileOrId === "object"
      ? profiles.find((profile) => String(profile.id) === String(profileOrId.id)) || profileOrId
      : profiles.find((profile) => String(profile.id) === String(profileOrId));
    if (!selected) {
      throw new Error("That profile is not available on this account.");
    }
    localStorage.setItem(getActiveProfileKey(user.id), String(selected.id));
    setActiveProfile(selected);
  };

  const addProfile = async (name, avatar) => {
    const { profile } = await accountApi.createProfile(name, avatar);
    setProfiles((currentProfiles) => [...currentProfiles, profile]);
    return profile;
  };

  const value = {
    user,
    profiles,
    activeProfile,
    status,
    connectionError,
    retryConnection: restoreSession,
    register,
    login,
    logout,
    selectProfile,
    addProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider.");
  }
  return context;
}
