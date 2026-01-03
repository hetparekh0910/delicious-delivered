import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import RestaurantList from "@/components/RestaurantList";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Categories selected={selectedCategory} onSelect={setSelectedCategory} />
        <RestaurantList categoryFilter={selectedCategory} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
