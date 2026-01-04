import heroBurger from "@/assets/hero-burger.jpg";

export default function Hero() {
  return (
    <section className="relative min-h-[500px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBurger}
          alt="Delicious food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium text-primary-foreground">
              Free delivery on orders over ₹500
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight">
            Delicious food,{" "}
            <span className="text-primary">delivered fast</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg">
            Order from your favorite restaurants and get your meal delivered to your doorstep in minutes.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 pt-4">
            {[
              { value: "500+", label: "Restaurants" },
              { value: "10K+", label: "Happy Customers" },
              { value: "15 min", label: "Avg. Delivery" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
