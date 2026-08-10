import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LandingScreen } from "@/components/game/LandingScreen";
import { useWallet } from "@/game/useWallet";

const GameScreen = lazy(() =>
  import("@/components/game/GameScreen").then((m) => ({ default: m.GameScreen })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rialo Explorer — Explore The Real World" },
      {
        name: "description",
        content:
          "Rialo Explorer is a real-world 3D exploration game. Walk the real map of Central Java with your GPS position and a lightweight 3D explorer avatar.",
      },
      { property: "og:title", content: "Rialo Explorer — Explore The Real World" },
      {
        property: "og:description",
        content:
          "Real map, real GPS, real exploration. Start your Rialo Explorer journey across Central Java.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const wallet = useWallet();
  const [started, setStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {started && mounted ? (
        <Suspense
          fallback={
            <div className="sky-bg grid h-[100dvh] place-items-center">
              <p className="font-display text-sm font-semibold text-muted-foreground">
                Loading the world…
              </p>
            </div>
          }
        >
          <GameScreen
            address={wallet.address}
            connecting={wallet.connecting}
            onConnect={wallet.connect}
          />
        </Suspense>
      ) : (
        <LandingScreen
          onStart={() => setStarted(true)}
          address={wallet.address}
          connecting={wallet.connecting}
          onConnect={wallet.connect}
        />
      )}
      <Toaster position="top-center" />
    </>
  );
}
