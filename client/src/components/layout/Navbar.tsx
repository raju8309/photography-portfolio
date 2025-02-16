import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/admin", label: "Admin" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const links = [...publicLinks];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="text-xl font-bold">Raju kotturi</a>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map(({ href, label }) => (
              <Link key={href} href={href}>
                <a className="text-foreground/60 hover:text-foreground transition-colors">
                  {label}
                </a>
              </Link>
            ))}
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="text-foreground/60 hover:text-foreground"
              >
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden",
          "transition-all duration-300 ease-in-out",
          isOpen ? "max-h-64" : "max-h-0 overflow-hidden"
        )}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-background/95">
          {links.map(({ href, label }) => (
            <Link key={href} href={href}>
              <a
                className="block py-2 text-foreground/60 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </a>
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="block w-full text-left py-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}