import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/", label: "Transações" },
    { path: "/locais", label: "Locais" },
    { path: "/usuarios", label: "Usuários" },
    { path: "/paineis", label: "Cartões" },
  ];

  return (
    <nav className="flex gap-1 bg-muted/50 p-1 rounded-lg">
      {links.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
