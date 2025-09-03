import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" data-testid="logo-link">
            <div className="bg-primary text-primary-foreground px-3 py-2 rounded-md font-bold text-lg">
              Tailored Timeshare Solutions
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/search" data-testid="nav-browse">
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer">Browse</span>
            </Link>
            <Link href="/search?type=rent" data-testid="nav-rent">
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer">Rent</span>
            </Link>
            <Link href="/search?type=buy" data-testid="nav-buy">
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer">Buy</span>
            </Link>
            <Link href="/search?type=sell" data-testid="nav-sell">
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer">Sell</span>
            </Link>
            <Link href="/forums" data-testid="nav-forums">
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer">Forums</span>
            </Link>
          </nav>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth?mode=signin" data-testid="button-signin">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Sign In
              </Button>
            </Link>
            <Link href="/auth?mode=register" data-testid="button-register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Register Free
              </Button>
            </Link>
          </div>
          
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-trigger">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-6">
                <Link href="/search" data-testid="mobile-nav-browse">
                  <span className="text-foreground hover:text-primary transition-colors block py-2 cursor-pointer">Browse</span>
                </Link>
                <Link href="/search?type=rent" data-testid="mobile-nav-rent">
                  <span className="text-foreground hover:text-primary transition-colors block py-2 cursor-pointer">Rent</span>
                </Link>
                <Link href="/search?type=buy" data-testid="mobile-nav-buy">
                  <span className="text-foreground hover:text-primary transition-colors block py-2 cursor-pointer">Buy</span>
                </Link>
                <Link href="/search?type=sell" data-testid="mobile-nav-sell">
                  <span className="text-foreground hover:text-primary transition-colors block py-2 cursor-pointer">Sell</span>
                </Link>
                <Link href="/forums" data-testid="mobile-nav-forums">
                  <span className="text-foreground hover:text-primary transition-colors block py-2 cursor-pointer">Forums</span>
                </Link>
                <div className="pt-4 border-t">
                  <Link href="/auth?mode=signin" data-testid="mobile-button-signin">
                    <Button variant="outline" className="w-full mb-2">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth?mode=register" data-testid="mobile-button-register">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Register Free
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
