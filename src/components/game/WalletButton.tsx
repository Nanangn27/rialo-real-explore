import { Wallet, Check, Loader2 } from "lucide-react";
import { shortAddress } from "@/game/useWallet";

interface WalletButtonProps {
  address: string | null;
  connecting: boolean;
  onConnect: () => void;
  compact?: boolean;
}

export function WalletButton({ address, connecting, onConnect, compact }: WalletButtonProps) {
  if (address) {
    return (
      <div
        className={`glass-panel flex items-center gap-2 rounded-full ${compact ? "px-3 py-1.5" : "px-4 py-2.5"}`}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent">
          <Check className="h-3 w-3 text-accent-foreground" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-foreground">
          {shortAddress(address)}
        </span>
        {!compact && (
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Connected
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={connecting}
      className={`glass-panel inline-flex items-center gap-2 rounded-full font-semibold text-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-70 ${
        compact ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm"
      }`}
    >
      {connecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4 text-primary" />
      )}
      {connecting ? "Connecting" : "Connect Wallet"}
    </button>
  );
}