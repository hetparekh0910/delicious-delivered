import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
}

interface PromoCodeInputProps {
  subtotal: number;
  appliedPromo: PromoCode | null;
  onApply: (promo: PromoCode, discountAmount: number) => void;
  onRemove: () => void;
}

export function PromoCodeInput({
  subtotal,
  appliedPromo,
  onApply,
  onRemove,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    setIsLoading(false);

    if (error || !data) {
      toast.error("Invalid promo code");
      return;
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("This promo code has expired");
      return;
    }

    // Check max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      toast.error("This promo code has reached its usage limit");
      return;
    }

    // Check minimum order amount
    if (data.min_order_amount && subtotal < data.min_order_amount) {
      toast.error(
        `Minimum order amount of ₹${data.min_order_amount} required for this code`
      );
      return;
    }

    // Calculate discount
    let discountAmount: number;
    if (data.discount_type === "percentage") {
      discountAmount = (subtotal * data.discount_value) / 100;
    } else {
      discountAmount = data.discount_value;
    }

    // Cap discount at subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    onApply(data as PromoCode, discountAmount);
    toast.success("Promo code applied!");
    setCode("");
  };

  const formatDiscount = (promo: PromoCode) => {
    if (promo.discount_type === "percentage") {
      return `${promo.discount_value}% off`;
    }
    return `₹${promo.discount_value} off`;
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div>
            <Badge variant="secondary" className="font-mono">
              {appliedPromo.code}
            </Badge>
            <span className="text-sm text-green-700 dark:text-green-300 ml-2">
              {formatDiscount(appliedPromo)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="pl-10 font-mono uppercase"
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
        </div>
        <Button
          variant="secondary"
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Try: WELCOME10, FLAT50, SAVE20
      </p>
    </div>
  );
}
