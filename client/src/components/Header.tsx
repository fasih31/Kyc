import { Button } from "@/components/ui/button";
import { Shield, Menu, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  variant?: 'landing' | 'dashboard';
  onMenuClick?: () => void;
}

export default function Header({ variant = 'landing', onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-filter supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 hover-elevate px-2 py-1 -ml-2 rounded-lg">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">Ali-V</span>
        </Link>

        {variant === 'landing' ? (
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Security
            </a>
            <Button variant="outline" size="sm" data-testid="button-login">
              Login
            </Button>
            <Button size="sm" data-testid="button-get-started-header">
              Get Started
            </Button>
          </nav>
        ) : (
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'} data-testid="button-dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden" data-testid="button-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}