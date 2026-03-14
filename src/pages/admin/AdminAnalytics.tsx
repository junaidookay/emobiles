import { Card, CardContent } from '@/components/ui/card';
import { useOrders, useAllProducts } from '@/hooks/useProducts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';

const AdminAnalytics = () => {
  const { data: orders } = useOrders();
  const { data: products } = useAllProducts();

  const totalRevenue = orders?.reduce((s, o) => s + Number(o.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue over time (by month)
  const revenueByMonth: Record<string, number> = {};
  orders?.forEach(o => {
    const month = new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(o.total);
  });
  const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));

  // Orders by status
  const statusCounts: Record<string, number> = {};
  orders?.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  // Top categories by revenue
  const catRevenue: Record<string, number> = {};
  orders?.forEach(order => {
    (order as any).order_items?.forEach((item: any) => {
      const product = products?.find(p => p.id === item.product_id);
      const catName = product?.categories?.name || 'Uncategorized';
      catRevenue[catName] = (catRevenue[catName] || 0) + Number(item.price) * item.quantity;
    });
  });
  const catData = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([category, revenue]) => ({ category, revenue: Math.round(revenue) }));

  const stats = [
    { icon: DollarSign, label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-success', bg: 'bg-success/10' },
    { icon: ShoppingCart, label: 'Total Orders', value: String(totalOrders), color: 'text-primary', bg: 'bg-primary/10' },
    { icon: TrendingUp, label: 'Avg. Order Value', value: `$${avgOrderValue.toFixed(2)}`, color: 'text-accent', bg: 'bg-accent/10' },
    { icon: Package, label: 'Products', value: String(products?.length || 0), color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="border-0 shadow-card">
            <CardContent className="p-5">
              <div className={`p-2.5 rounded-xl ${bg} w-fit mb-3`}><Icon className={`h-5 w-5 ${color}`} /></div>
              <p className="font-display text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Over Time */}
        <Card className="border-0 shadow-card lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-lg mb-6">Revenue Over Time</h3>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No revenue data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-lg mb-6">Orders by Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="status" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No order data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-lg mb-6">Revenue by Category</h3>
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={catData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="category" type="category" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No category data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
