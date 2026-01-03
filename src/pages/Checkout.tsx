import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, MapPin, CreditCard, Wallet, Plus, Check } from "lucide-react";

interface Address {
  id: string;
  label: string;
  street_address: string;
  apartment: string | null;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street_address: "",
    apartment: "",
    city: "",
    state: "",
    zip_code: ""
  });

  const deliveryFee = 2.99;
  const grandTotal = total + deliveryFee;

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to checkout");
      navigate("/auth");
      return;
    }
    if (items.length === 0) {
      navigate("/");
      return;
    }
    if (user) {
      fetchAddresses();
    }
  }, [user, authLoading, items, navigate]);

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false });
    
    if (!error && data) {
      setAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      } else if (data.length > 0) {
        setSelectedAddress(data[0].id);
      }
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street_address || !newAddress.city || !newAddress.state || !newAddress.zip_code) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user!.id,
        ...newAddress,
        is_default: addresses.length === 0
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add address");
      return;
    }

    setAddresses([...addresses, data]);
    setSelectedAddress(data.id);
    setShowNewAddress(false);
    setNewAddress({ label: "Home", street_address: "", apartment: "", city: "", state: "", zip_code: "" });
    toast.success("Address added!");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !showNewAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsLoading(true);

    let deliveryAddress = addresses.find(a => a.id === selectedAddress);
    
    if (showNewAddress) {
      // Save new address first
      const { data: newAddr, error: addrError } = await supabase
        .from("addresses")
        .insert({
          user_id: user!.id,
          ...newAddress,
          is_default: addresses.length === 0
        })
        .select()
        .single();

      if (addrError) {
        toast.error("Failed to save address");
        setIsLoading(false);
        return;
      }
      deliveryAddress = newAddr;
    }

    const orderItems = items.map(item => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      image: item.menuItem.image
    }));

    const estimatedDelivery = new Date();
    estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 35);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user!.id,
        restaurant_id: items[0].restaurantId,
        restaurant_name: items[0].restaurantName,
        status: "confirmed",
        items: JSON.parse(JSON.stringify(orderItems)),
        subtotal: total,
        delivery_fee: deliveryFee,
        total: grandTotal,
        delivery_address: JSON.parse(JSON.stringify(deliveryAddress)),
        payment_method: paymentMethod,
        estimated_delivery: estimatedDelivery.toISOString(),
        driver_name: "John D."
      })
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      toast.error("Failed to place order");
      return;
    }

    clearCart();
    toast.success("Order placed successfully!");
    navigate(`/order/${order.id}`);
  };

  if (authLoading) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && !showNewAddress && (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          selectedAddress === address.id ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => setSelectedAddress(address.id)}
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{address.label}</span>
                            {address.is_default && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.street_address}
                            {address.apartment && `, ${address.apartment}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.zip_code}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {showNewAddress ? (
                  <div className="space-y-4 p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <Label>Label</Label>
                        <Input
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          placeholder="Home, Work, etc."
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Street Address *</Label>
                      <Input
                        value={newAddress.street_address}
                        onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <Label>Apartment, Suite, etc.</Label>
                      <Input
                        value={newAddress.apartment}
                        onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                        placeholder="Apt 4B"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>City *</Label>
                        <Input
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <Input
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <Label>ZIP *</Label>
                        <Input
                          value={newAddress.zip_code}
                          onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddAddress}>
                        <Check className="w-4 h-4 mr-2" />
                        Save Address
                      </Button>
                      <Button variant="ghost" onClick={() => setShowNewAddress(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowNewAddress(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">Credit / Debit Card</span>
                      <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer mt-3 ${
                      paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <RadioGroupItem value="cash" id="cash" />
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                {items[0] && (
                  <p className="text-sm text-muted-foreground">
                    From {items[0].restaurantName}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.menuItem.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${grandTotal.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isLoading || (!selectedAddress && !showNewAddress)}
                >
                  {isLoading ? "Placing Order..." : `Place Order · $${grandTotal.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
