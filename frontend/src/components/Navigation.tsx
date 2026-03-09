import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import NotificationPanel from "./NotificationPanel";
import expoLogo from "@/assets/hero-dogs.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/breeders", label: "Breeders" },
    { path: "/trainers", label: "Trainers" },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'superadmin') return '/superadmin-dashboard';
    if (user.role === 'breeder') return '/breeder-dashboard';
    if (user.role === 'trainer') return '/trainer-dashboard';
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="transition-transform group-hover:scale-110">
              <img src={expoLogo} alt="Expo Dogs Detection" className="h-10 w-10 object-cover rounded-lg" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Expo Detection Dogs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {dashboardLink && (
                  <Button variant="ghost" asChild>
                    <Link to={dashboardLink}>Dashboard</Link>
                  </Button>
                )}
                <NotificationPanel />
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-primary shadow-primary">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? "bg-primary-light text-primary font-medium"
                        : "text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 px-4 pt-2">
                  {user ? (
                    <>
                      {dashboardLink && (
                        <Button variant="outline" asChild className="w-full">
                          <Link to={dashboardLink}>Dashboard</Link>
                        </Button>
                      )}
                      <Button variant="outline" onClick={logout} className="w-full">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/auth">Login</Link>
                      </Button>
                      <Button asChild className="w-full bg-gradient-primary shadow-primary">
                        <Link to="/auth">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
