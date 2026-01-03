import { Star, Clock, DollarSign } from "lucide-react";
import { Restaurant } from "@/types/food";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-soft hover-lift"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {restaurant.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        {restaurant.deliveryFee === 0 && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            Free Delivery
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 text-success">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{restaurant.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {restaurant.deliveryFee === 0 ? "Free" : `$${restaurant.deliveryFee.toFixed(2)}`}
          </span>
          <span className="text-xs">
            Min. ${restaurant.minOrder}
          </span>
        </div>
      </div>
    </div>
  );
}
