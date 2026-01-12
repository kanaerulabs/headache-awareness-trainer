import { ReactNode } from "react";

/**
 * Login Layout - Minimal layout without navigation
 *
 * This layout removes the BottomNav and other app navigation
 * since users shouldn't see the app UI before logging in.
 */
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
