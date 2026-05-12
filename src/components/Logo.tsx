import logo from "@/images/cca-logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ showWordmark = true, className = "" }: { showWordmark?: boolean; className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`} aria-label="Car Care Ally home">
      <img
        src={logo}
        alt="CCA Car Care Ally"
        width={36}
        height={36}
        className="h-9 w-9 transition-transform group-hover:scale-105"
      />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            <span className="text-primary">CCA</span> CarCareAlly
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
            Simply smarter service
          </span>
        </div>
      )}
    </Link>
  );
}
