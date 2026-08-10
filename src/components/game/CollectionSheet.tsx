import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { InventoryItem } from "@/game/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  discoveryCount: number;
  totalXp: number;
}

const RARITY_LABEL: Record<InventoryItem["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function CollectionSheet({
  open,
  onOpenChange,
  items,
  discoveryCount,
  totalXp,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t px-4 pb-8">
        <SheetHeader className="px-0">
          <SheetTitle className="font-display">Explorer Collection</SheetTitle>
        </SheetHeader>
        <div className="mb-4 flex gap-2">
          <Stat label="Discoveries" value={discoveryCount} />
          <Stat label="Total XP" value={totalXp} />
          <Stat label="Item types" value={items.length} />
        </div>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing collected yet — walk toward a marker on the map to make your first discovery.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="glass-panel rounded-2xl p-3">
                <p className="font-display text-sm font-bold leading-tight">{item.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {RARITY_LABEL[item.rarity]} · x{item.quantity}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel flex-1 rounded-2xl px-3 py-2 text-center">
      <p className="font-display text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
