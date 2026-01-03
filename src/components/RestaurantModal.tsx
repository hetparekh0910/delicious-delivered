import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, DollarSign, Plus } from "lucide-react";
import { Restaurant } from "@/types/food";
import { useCart } from "@/context/CartContext";

interface RestaurantModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export default function RestaurantModal({ restaurant, onClose }: RestaurantModalProps) {
  const { addItem } = useCart();

  if (!restaurant) return null;

  const menuByCategory = restaurant.menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof restaurant.menu>);

  return (
    <Dialog open={!!restaurant} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        {/* Header Image */}
        <div className="relative h-48 sm:h-64">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                {restaurant.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="secondary">{restaurant.cuisine}</Badge>
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-semibold">{restaurant.rating}</span>
                <span className="text-muted-foreground">({restaurant.reviewCount})</span>
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                {restaurant.deliveryFee === 0 ? "Free delivery" : `$${restaurant.deliveryFee} delivery`}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-lg font-bold mb-4 sticky top-0 bg-background py-2">
                {category}
              </h3>
              <div className="grid gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {item.name}
                            {item.popular && (
                              <Badge variant="outline" className="text-xs">Popular</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => addItem(item, restaurant.id, restaurant.name)}
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
