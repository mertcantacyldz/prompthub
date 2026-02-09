import { useNavigate, Form, useActionData, useNavigation, useLoaderData, redirect, data } from "react-router";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useTheme, useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import { Moon, Sun, Monitor, Check, Upload, Trash2, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState, useEffect, useRef } from "react";
import { getSupabaseServerClient } from "~/lib/supabase";
import { uploadAvatar, deleteAvatar } from "~/lib/api";
import { localizeHref } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";
import type { Route } from "./+types/settings";
import type { Profile } from "~/types";

const THEMES = [
  { value: "light" as const, label: m.settings_themeLight, icon: Sun },
  { value: "dark" as const, label: m.settings_themeDark, icon: Moon },
  { value: "system" as const, label: m.settings_themeSystem, icon: Monitor },
];

type ActionData = {
  success?: boolean;
  message?: string;
  error?: string;
};

export function meta() {
  return [
    { title: `${m.settings_title()} - PromptHub` },
    { name: "description", content: m.settings_manageAccount() },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(localizeHref("/auth/login?redirectTo=/settings"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { profile: (profile as unknown) as Profile };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(localizeHref("/auth/login"), { headers });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update_profile") {
    const username = (formData.get("username") as string).toLowerCase().trim();
    const display_name = (formData.get("display_name") as string).trim() || null;
    const bio = (formData.get("bio") as string).trim() || null;

    // Validation
    if (username.length < 3) {
      return data({ error: m.settings_usernameMin() }, { status: 400 });
    }
    if (username.length > 30) {
      return data({ error: m.settings_usernameMax() }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return data({ error: m.settings_usernameChars() }, { status: 400 });
    }

    // Check availability if username matches another user
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single();

    if (existingUser) {
      return data({ error: m.auth_usernameTaken() }, { status: 400 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        display_name,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return data({ error: m.common_error() }, { status: 500, headers });
    }

    return data({ success: true, message: m.settings_profileUpdatedDesc() }, { headers });
  }

  return null;
}

export default function Settings() {
  const { profile: initialProfile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionData;
  const navigation = useNavigation();
  const { theme, setTheme } = useTheme();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(initialProfile?.username || "");
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "");
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [usernameError, setUsernameError] = useState("");

  const isUpdating = navigation.state === "submitting" && navigation.formData?.get("intent") === "update_profile";
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handle action data for toasts and profile refresh
  useEffect(() => {
    if (actionData?.success) {
      toast({
        title: m.settings_profileUpdated(),
        description: actionData.message,
      });
      refreshProfile();
    } else if (actionData?.error) {
      toast({
        title: m.common_error(),
        description: actionData.error,
        variant: "destructive",
      });
      if (actionData.error.includes("Username") || actionData.error.includes("Kullanıcı")) {
        setUsernameError(actionData.error);
      }
    }
  }, [actionData, toast, refreshProfile]);

  // Reset username error when username changes
  useEffect(() => {
    setUsernameError("");
  }, [username]);

  // Client-side validation for username (for immediate feedback)
  const validateUsernameClient = (value: string) => {
    if (!value.trim()) {
      return m.settings_usernameRequired();
    }
    if (value.length < 3) {
      return m.settings_usernameMin();
    }
    if (value.length > 30) {
      return m.settings_usernameMax();
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return m.settings_usernameChars();
    }
    return "";
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const error = validateUsernameClient(value);
    setUsernameError(error);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: m.settings_invalidFileType(),
        description: m.settings_selectImage(),
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: m.settings_fileTooLarge(),
        description: m.settings_selectSmallerImage(),
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(user.id, file);
      await refreshProfile();

      toast({
        title: m.settings_avatarUpdated(),
        description: m.settings_avatarUpdatedDesc(),
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: m.common_error(),
        description: m.common_error(),
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;

    setIsDeletingAvatar(true);
    try {
      await deleteAvatar(user.id);
      await refreshProfile();

      toast({
        title: m.settings_avatarRemoved(),
        description: m.settings_avatarRemovedDesc(),
      });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast({
        title: m.common_error(),
        description: m.common_error(),
        variant: "destructive",
      });
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  // The loader handles redirection if no user, so we don't need authLoading check here.
  // We also don't need to check for !user || !profile here because loader ensures it.
  if (!initialProfile) {
    return null;
  }

  return (
    <div className="py-8">
      <Container className="max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">{m.settings_title()}</h1>

        {/* Profile Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{m.settings_profile()}</CardTitle>
            <CardDescription>
              {m.settings_manageProfile()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="update_profile" />
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={initialProfile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {initialProfile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {m.settings_uploading()}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {m.settings_upload()}
                      </>
                    )}
                  </Button>
                  {initialProfile.avatar_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={isDeletingAvatar}
                    >
                      {isDeletingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {m.settings_maxFileSize()}
                </p>
              </div>

              <Separator />

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">{m.auth_username()}</Label>
                <Input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isUpdating}
                  required
                />
                {actionData?.error?.includes("Username") && (
                  <p className="text-sm text-red-500">{actionData.error}</p>
                )}
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">{m.settings_displayName()}</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={m.settings_displayNamePlaceholder()}
                  disabled={isUpdating}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">{m.settings_bio()}</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={m.settings_bioPlaceholder()}
                  rows={3}
                  disabled={isUpdating}
                />
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {m.common_saving()}
                  </>
                ) : (
                  m.common_saveChanges()
                )}
              </Button>
            </Form>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{m.settings_appearance()}</CardTitle>
            <CardDescription>
              {m.settings_customizeAppearance()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label>{m.settings_theme()}</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                      theme === value
                        ? "border-accent-500 bg-accent-500/10"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label()}</span>
                    {theme === value && (
                      <Check className="h-4 w-4 text-accent-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{m.settings_account()}</CardTitle>
            <CardDescription>{m.settings_manageAccount()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{m.auth_email()}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {initialProfile.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-500">{m.settings_dangerZone()}</CardTitle>
            <CardDescription>
              {m.settings_dangerDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{m.settings_deleteAccount()}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {m.settings_deleteAccountDesc()}
                </p>
              </div>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {m.settings_deleteAccount()}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{m.settings_deleteAccount()}</DialogTitle>
                    <DialogDescription>
                      {m.settings_deleteConfirmDesc()}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      {m.common_cancel()}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        toast({
                          title: m.settings_notImplemented(),
                          description: m.settings_notImplementedDesc(),
                          variant: "destructive",
                        });
                        setShowDeleteDialog(false);
                      }}
                    >
                      {m.settings_deleteAccount()}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
