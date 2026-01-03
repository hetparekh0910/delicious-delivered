import { useState } from "react";
import { MapPin, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import CartSheet from "./CartSheet";

export default function Navbar() {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <span className="text-xl font-bold hidden sm:block">FoodDash</span>
            </a>

            {/* Location & Search - Desktop */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl">
              <Button variant="ghost" className="gap-2 shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">123 Main St</span>
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants or dishes..."
                  className="pl-10 bg-secondary/50 border-0 focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants or dishes..."
                  className="pl-10 bg-secondary/50 border-0"
                />
              </div>
              <Button variant="ghost" className="gap-2 mt-2 w-full justify-start">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">123 Main St</span>
              </Button>
            </div>
          )}
        </div>
      </nav>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
