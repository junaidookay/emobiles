import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Banknote, Building2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBankTransferSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const paymentMethod = searchParams.get('payment') || 'cod';
  const { data: bankDetails } = useBankTransferSettings();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-20 text-center max-w-lg mx-auto">
        <CheckCircle className="h-20 w-20 mx-auto text-success mb-6" />
        <h1 className="font-display text-3xl font-bold mb-3">Order Placed!</h1>

        {orderId && (
          <p className="text-sm text-muted-foreground mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
        )}

        {/* COD */}
        {paymentMethod === 'cod' && (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Banknote className="h-5 w-5 text-primary" />
              <p className="font-display font-semibold">Cash on Delivery</p>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Please keep the exact amount ready at the time of delivery. Our delivery partner will collect the payment.
            </p>
          </div>
        )}

        {/* Bank Transfer */}
        {paymentMethod === 'bank_transfer' && bankDetails && (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <p className="font-display font-semibold">Bank Transfer</p>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Please transfer the order amount to the account below and send the payment screenshot to our WhatsApp or email for order confirmation.
            </p>
            <Card className="border-0 shadow-card text-left">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium">{bankDetails.bank_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account Title</span><span className="font-medium">{bankDetails.account_title}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Account No</span><span className="font-mono font-medium flex items-center gap-1">{bankDetails.account_number} <Copy className="h-3 w-3 cursor-pointer text-muted-foreground" onClick={() => copyToClipboard(bankDetails.account_number)} /></span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">IBAN</span><span className="font-mono text-xs font-medium flex items-center gap-1">{bankDetails.iban} <Copy className="h-3 w-3 cursor-pointer text-muted-foreground" onClick={() => copyToClipboard(bankDetails.iban)} /></span></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Card / Stripe */}
        {paymentMethod === 'card' && (
          <div className="mt-6">
            <p className="text-muted-foreground text-sm mb-6">
              Your payment has been processed. You'll receive a confirmation email shortly.
            </p>
          </div>
        )}

        <p className="text-muted-foreground text-sm mt-6 mb-8">
          Thank you for your order. You'll receive a confirmation email shortly.
        </p>

        <div className="flex gap-3 justify-center">
          <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
          <Button variant="outline" asChild><Link to="/dashboard">View Orders</Link></Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
