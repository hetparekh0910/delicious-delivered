import { useState } from "react";
import { restaurants } from "@/data/restaurants";
import RestaurantCard from "./RestaurantCard";
import RestaurantModal from "./RestaurantModal";
import { Restaurant } from "@/types/food";

interface RestaurantListProps {
  categoryFilter: string | null;
}

export default function RestaurantList({ categoryFilter }: RestaurantListProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const filteredRestaurants = categoryFilter
    ? restaurants.filter((r) =>
        r.cuisine.toLowerCase().includes(categoryFilter) ||
        r.menu.some((item) => item.category.toLowerCase().includes(categoryFilter))
      )
    : restaurants;

  const featuredRestaurants = filteredRestaurants.filter((r) => r.featured);
  const otherRestaurants = filteredRestaurants.filter((r) => !r.featured);

  return (
    <section className="py-8">
      <div className="container px-4">
        {/* Featured Section */}
        {featuredRestaurants.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((restaurant, index) => (
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
          </div>
        )}

        {/* All Restaurants */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Restaurants` : "All Restaurants"}
          </h2>
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No restaurants found for this category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(categoryFilter ? filteredRestaurants : otherRestaurants).map((restaurant, index) => (
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
        </div>
      </div>

      <RestaurantModal
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />
    </section>
  );
}
