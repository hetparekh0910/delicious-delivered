import { categories } from "@/data/restaurants";

interface CategoriesProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export default function Categories({ selected, onSelect }: CategoriesProps) {
  return (
    <section className="py-8">
      <div className="container px-4">
        <h2 className="text-2xl font-bold mb-6">What are you craving?</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onSelect(selected === category.id ? null : category.id)}
              className={`flex flex-col items-center gap-2 p-4 min-w-[100px] rounded-2xl transition-all duration-300 hover-lift ${
                selected === category.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card hover:bg-secondary"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-4xl">{category.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
