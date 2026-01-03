import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { restaurants } from "@/data/restaurants";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantModal from "@/components/RestaurantModal";
import { Restaurant } from "@/types/food";

interface Favorite {
  id: string;
  restaurant_id: string;
}

export default function Favorites() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchFavorites();
    }
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*");

    if (!error && data) {
      setFavorites(data);
    }
    setLoading(false);
  };

  const favoriteRestaurants = restaurants.filter((r) =>
    favorites.some((f) => f.restaurant_id === r.id)
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">My Favorites</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {favoriteRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite restaurants for quick access
            </p>
            <Button onClick={() => navigate("/")}>Browse Restaurants</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRestaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  onClick={() => setSelectedRestaurant(restaurant)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <RestaurantModal
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />
    </div>
  );
}
