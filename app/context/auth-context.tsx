import { createContext, useContext, useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";
import type { Profile } from "~/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
  initialSession?: Session | null;
  initialProfile?: Profile | null;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialSession = null,
  initialProfile = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const revalidator = useRevalidator();

  // Sync state with props from server-side loader (root loader)
  useEffect(() => {
    setUser(initialUser);
    setProfile(initialProfile);
    if (initialUser) {
      setIsLoading(false);
    }
  }, [initialUser, initialProfile]);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[AuthContext] fetchProfile error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("[AuthContext] fetchProfile failed:", err);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Listen for auth changes
    // IMPORTANT: Callback must NOT be async to avoid deadlock with Supabase's
    // internal navigator.locks mechanism. Any Supabase API call inside an async
    // callback would try to re-acquire the auth lock that is already held,
    // causing an indefinite hang.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const currentUser = session.user;
        setUser(currentUser);

        // Schedule profile fetch OUTSIDE the auth lock context via setTimeout.
        // This prevents deadlock: the callback returns synchronously, releasing
        // the lock, and the profile fetch runs in a clean execution context.
        setProfile(prev => {
          if (prev?.id === currentUser.id) return prev;

          setTimeout(() => {
            fetchProfile(currentUser.id)
              .then(newProfile => { if (newProfile) setProfile(newProfile); })
              .catch(err => console.error("[AuthContext] Profile fetch error:", err));
          }, 0);
          return prev;
        });
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  // Sign up with email/password
  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: null, // Session not used for data anymore
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
