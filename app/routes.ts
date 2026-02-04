import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home / Explore
  index("routes/home.tsx"),

  // Auth routes
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/register", "routes/auth.register.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("auth/logout", "routes/auth.logout.tsx"),

  // Prompt routes
  route("prompts/new", "routes/prompts.new.tsx"),
  route("prompts/:id", "routes/prompts.$id.tsx"),
  route("prompts/:id/edit", "routes/prompts.$id.edit.tsx"),

  // Profile routes
  route("profile", "routes/profile._index.tsx"),
  route("profile/:username", "routes/profile.$username.tsx"),

  // Settings
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
