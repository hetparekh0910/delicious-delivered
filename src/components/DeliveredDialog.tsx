import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Wallet, Star } from "lucide-react";
import { ReviewDialog } from "./ReviewDialog";

interface DeliveredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  total: number;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
}

export function DeliveredDialog({
  open,
  onOpenChange,
  paymentMethod,
  total,
  orderId,
  restaurantId,
  restaurantName,
}: DeliveredDialogProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const isCashPayment = paymentMethod === "cash";

  const handleRateOrder = () => {
    onOpenChange(false);
    setShowReviewDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl">Your Order is Here!</DialogTitle>
            <DialogDescription className="text-base">
              Enjoy your delicious meal from {restaurantName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {isCashPayment && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  <div className="text-left">
                    <p className="font-semibold text-amber-800 dark:text-amber-200">
                      Payment Due
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Please pay ₹{total.toFixed(2)} to the delivery partner
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={handleRateOrder} className="w-full gap-2">
                <Star className="w-4 h-4" />
                Rate Your Order
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        orderId={orderId}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
      />
    </>
  );
}
