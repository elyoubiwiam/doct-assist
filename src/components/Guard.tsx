import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export function Guard({ when, children }: { when: boolean; children: ReactNode }) {
  const { ready } = useSession();
  const { t } = useI18n();
  if (!ready) return null;
  if (!when)
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t.missing}</p>
        <Button asChild className="mt-4">
          <Link to="/">{t.start}</Link>
        </Button>
      </div>
    );
  return <>{children}</>;
}
