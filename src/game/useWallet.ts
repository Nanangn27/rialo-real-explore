import { useCallback, useEffect, useState } from "react";
import type { WalletState } from "./types";

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
};

function getProvider(): Eip1193 | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: Eip1193 }).ethereum ?? null;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Phase 1 wallet link: connection + address display only.
 * No transactions — Rialo on-chain actions land in a later phase.
 */
export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    connecting: false,
    error: null,
  });

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;
    provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list?.length) setState((s) => ({ ...s, address: list[0] ?? null }));
      })
      .catch(() => undefined);

    const onAccounts = (...args: unknown[]) => {
      const list = (args[0] as string[]) ?? [];
      setState((s) => ({ ...s, address: list[0] ?? null }));
    };
    provider.on?.("accountsChanged", onAccounts);
    return () => provider.removeListener?.("accountsChanged", onAccounts);
  }, []);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setState((s) => ({ ...s, error: "No browser wallet detected" }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      setState({ address: accounts?.[0] ?? null, connecting: false, error: null });
    } catch (e) {
      setState({
        address: null,
        connecting: false,
        error: e instanceof Error ? e.message : "Connection rejected",
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, connecting: false, error: null });
  }, []);

  return { ...state, connect, disconnect };
}