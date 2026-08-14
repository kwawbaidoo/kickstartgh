import type { Metadata } from "next";

import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Sign In or Sign Up — KickStartGH",
  description:
    "Sign in or create your KickStartGH account to manage your grassroots football team in Ghana.",
};

export default function RootPage() {
  return <AuthScreen />;
}
