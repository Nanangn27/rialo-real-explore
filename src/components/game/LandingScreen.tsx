import { Sparkles, MapPinned, Navigation } from "lucide-react";
import logo from "@/assets/rialo-logo.png.asset.json";
import { WalletButton } from "./WalletButton";

interface LandingScreenProps {
  onStart: () => void;
  address: string | null;
  connecting: boolean;
  onConnect: () => void;
}

export function LandingScreen({ onStart, address, connecting, onConnect }: LandingScreenProps) {
  return (
    <main className="sky-bg relative min-h-[100dvh] overflow-hidden">
      {/* sun + atmosphere */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--sun)_70%,transparent),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--accent)_22%,transparent))]" />

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        <div className="flex items-center gap-2">
          <img src={logo.url} alt="Rialo Explorer logo" className="h-8 w-8" />
          <span className="font-display text-sm font-bold tracking-tight">Rialo</span>
        </div>
        <WalletButton address={address} connecting={connecting} onConnect={onConnect} compact />
      </header>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pb-16 pt-6 text-center sm:pt-14">
        <div className="rise-in float-soft">
          <img
            src={logo.url}
            alt="Rialo Explorer brand mark"
            className="h-28 w-28 drop-shadow-[0_18px_30px_rgba(20,40,80,0.25)] sm:h-36 sm:w-36"
          />
        </div>

        <span
          className="rise-in glass-panel mt-7 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          style={{ animationDelay: "80ms" }}
        >
          <Sparkles className="h-3 w-3 text-primary" /> Phase 2 · Central Java
        </span>

        <h1
          className="rise-in mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl"
          style={{ animationDelay: "140ms" }}
        >
          Rialo Explorer
        </h1>
        <p
          className="rise-in mt-3 text-base font-medium text-muted-foreground sm:text-xl"
          style={{ animationDelay: "200ms" }}
        >
          Explore The Real World
        </p>

        <button
          type="button"
          onClick={onStart}
          className="btn-hero rise-in mt-9 inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-base font-bold sm:text-lg"
          style={{ animationDelay: "260ms" }}
        >
          <Navigation className="h-5 w-5" />
          Start Exploring
        </button>

        <p
          className="rise-in mt-4 text-xs text-muted-foreground"
          style={{ animationDelay: "320ms" }}
        >
          Location access is used to place your explorer on the real map.
        </p>

        <div
          className="rise-in mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
          style={{ animationDelay: "380ms" }}
        >
          <Feature icon={<MapPinned className="h-4 w-4 text-primary" />} title="Real Map">
            Live streets and places of Central Java
          </Feature>
          <Feature icon={<Navigation className="h-4 w-4 text-primary" />} title="Real GPS">
            Your device position drives the explorer
          </Feature>
          <Feature icon={<Sparkles className="h-4 w-4 text-primary" />} title="3D Explorer">
            Lightweight avatar, mobile optimized
          </Feature>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl px-4 py-4 text-left">
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-display text-sm font-bold">{title}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{children}</p>
    </div>
  );
}