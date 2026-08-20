import type { Metadata } from "next";

import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Sign In — KickStartGH",
  description:
    "Sign in to KickStartGH, or request access to manage your grassroots football team in Ghana.",
};

export default function RootPage() {
  return <AuthScreen />;
}
