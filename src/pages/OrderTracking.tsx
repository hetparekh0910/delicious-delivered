import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ChefHat, 
  Bike, 
  Package,
  Home
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface DeliveryAddress {
  label: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
}

interface Order {
  id: string;
  restaurant_name: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: DeliveryAddress;
  driver_name: string | null;
  estimated_delivery: string | null;
  created_at: string;
}

const statusSteps = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "picked_up", label: "Picked Up", icon: Package },
  { key: "on_the_way", label: "On the Way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user && id) {
      fetchOrder();
      subscribeToOrder();
    }
  }, [user, authLoading, id]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      navigate("/orders");
      return;
    }

    const orderData = {
      ...data,
      items: data.items as unknown as OrderItem[],
      delivery_address: data.delivery_address as unknown as DeliveryAddress
    };

    setOrder(orderData);
    setLoading(false);

    // Simulate order progress for demo
    simulateOrderProgress(data.status);
  };

  const subscribeToOrder = () => {
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newData = payload.new as Record<string, unknown>;
          setOrder({
            ...newData,
            items: newData.items as unknown as OrderItem[],
            delivery_address: newData.delivery_address as unknown as DeliveryAddress
          } as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };


  const simulateOrderProgress = async (currentStatus: string) => {
    const statusOrder = ["confirmed", "preparing", "picked_up", "on_the_way", "delivered"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentIndex < statusOrder.length - 1) {
      // Progress to next status after delays
      const delays = [5000, 8000, 6000, 10000]; // delays in ms
      
      for (let i = currentIndex; i < statusOrder.length - 1; i++) {
        await new Promise(resolve => setTimeout(resolve, delays[i] || 5000));
        
        await supabase
          .from("orders")
          .update({ status: statusOrder[i + 1] })
          .eq("id", id);
      }
    }
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.key === order?.status);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const getEstimatedTime = () => {
    if (!order?.estimated_delivery) return "Calculating...";
    const eta = new Date(order.estimated_delivery);
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.round(diffMs / 60000));
    
    if (order.status === "delivered") return "Delivered!";
    if (diffMins === 0) return "Arriving now!";
    return `${diffMins} min`;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const deliveryAddress = order.delivery_address;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Order Tracking</h1>
            <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ETA Card */}
        <Card className="mb-6 bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Estimated Delivery</p>
                <p className="text-4xl font-bold mt-1">{getEstimatedTime()}</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                {order.status === "delivered" ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <Clock className="w-10 h-10" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-0">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20 animate-pulse" : ""}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-12 transition-all ${
                            index < currentStep ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-2">
                      <p
                        className={`font-medium ${
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <Badge variant="secondary" className="mt-1">
                          Current Status
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        {order.driver_name && order.status !== "confirmed" && order.status !== "preparing" && (
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Bike className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{order.driver_name}</p>
                <p className="text-sm text-muted-foreground">Your delivery partner</p>
              </div>
              <Button size="icon" variant="outline">
                <Phone className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delivery Address */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{deliveryAddress.label}</p>
                <p className="text-sm text-muted-foreground">
                  {deliveryAddress.street_address}
                  {deliveryAddress.apartment && `, ${deliveryAddress.apartment}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip_code}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Order from {order.restaurant_name}</h3>
            <div className="space-y-3">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>${order.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
