import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, BookOpen, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { profile, isAdmin } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navLinks = [
    { label: "Formations", href: "/formations" },
    { label: "Mes Formations", href: "/mes-formations" },
    { label: "Mon Compte", href: "/mon-compte" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-display font-bold text-xl tracking-tight text-primary uppercase">
          DB<span className="text-accent"> Academy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.href} className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/dashboard" className="font-body text-sm font-medium text-accent hover:text-accent/80 transition-colors duration-200 flex items-center gap-1">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-body text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-sm">
                {profile?.full_name || user.email}
              </span>
              <button onClick={handleLogout} className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground font-body text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors">
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/auth" className="inline-flex items-center px-5 py-2.5 bg-accent text-accent-foreground font-body text-sm font-semibold rounded-sm hover:-translate-y-0.5 transition-transform duration-200">
              Se connecter
            </Link>
          )}
        </nav>

        <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background py-4">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.href} className="block px-6 py-3 font-body text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/dashboard" className="block px-6 py-3 font-body text-sm font-medium text-accent hover:bg-secondary" onClick={() => setMobileOpen(false)}>
              Dashboard Admin
            </Link>
          )}
          {user ? (
            <div className="px-6 pt-3">
              <button onClick={handleLogout} className="block w-full text-center px-5 py-2.5 bg-primary text-primary-foreground font-body text-sm font-semibold rounded-sm">
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="px-6 pt-3">
              <Link to="/auth" className="block text-center px-5 py-2.5 bg-accent text-accent-foreground font-body text-sm font-semibold rounded-sm" onClick={() => setMobileOpen(false)}>
                Se connecter
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
