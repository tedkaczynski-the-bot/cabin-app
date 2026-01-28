import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

export const metadata: Metadata = {
  title: "Cabin - Go off-grid with your tokens",
  description: "Lock your tokens. No early withdrawals. No panic selling. Time-lock vault for the diamond-handed.",
  icons: {
    icon: "/favicon.svg",
  },
};

const CabinApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning lang="en" className="dark">
      <body className="bg-neutral-950">
        <ThemeProvider enableSystem={false} defaultTheme="dark" forcedTheme="dark">
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default CabinApp;
