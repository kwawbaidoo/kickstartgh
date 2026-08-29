import type { Metadata } from "next";

import { FirstLoginScreen } from "@/components/auth/FirstLoginScreen";

export const metadata: Metadata = {
  title: "Choose your password — KickStartGH",
  description: "Replace the temporary password you were sent to finish setting up your account.",
};

export default function FirstLoginPage() {
  return <FirstLoginScreen />;
}
