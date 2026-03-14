import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAllProducts, useOrders } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const { data: products } = useAllProducts();
  const { data: orders } = useOrders();

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const lowStockProducts = products?.filter(p => p.stock <= 5 && p.stock > 0) || [];
  const outOfStock = products?.filter(p => p.stock === 0) || [];

  const stats = [
    { icon: DollarSign, label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-success', bg: 'bg-success/10' },
    { icon: ShoppingCart, label: 'Orders', value: String(totalOrders), color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Package, label: 'Products', value: String(totalProducts), color: 'text-accent', bg: 'bg-accent/10' },
    { icon: AlertTriangle, label: 'Low Stock', value: String(lowStockProducts.length + outOfStock.length), color: 'text-warning', bg: 'bg-warning/10' },
  ];

  // Top products by order count
  const productOrderCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  orders?.forEach(order => {
    (order as any).order_items?.forEach((item: any) => {
      if (!productOrderCounts[item.product_name]) productOrderCounts[item.product_name] = { name: item.product_name, count: 0, revenue: 0 };
      productOrderCounts[item.product_name].count += item.quantity;
      productOrderCounts[item.product_name].revenue += Number(item.price) * item.quantity;
    });
  });
  const topProducts = Object.values(productOrderCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="border-0 shadow-card">
            <CardContent className="p-5 md:p-6">
              <div className={`p-2.5 rounded-xl ${bg} w-fit mb-3`}><Icon className={`h-5 w-5 ${color}`} /></div>
              <p className="font-display text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Recent Orders</h3>
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 8).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                      <span className="text-sm font-semibold">${order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Top Selling Products</h3>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.count} sold</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">${p.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No sales data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {(lowStockProducts.length > 0 || outOfStock.length > 0) && (
        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Inventory Alerts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStock.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">{p.name}</td>
                      <td className="py-2 px-3 font-bold text-destructive">0</td>
                      <td className="py-2 px-3"><Badge variant="destructive" className="text-xs border-0">Out of Stock</Badge></td>
                    </tr>
                  ))}
                  {lowStockProducts.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">{p.name}</td>
                      <td className="py-2 px-3 font-bold text-warning">{p.stock}</td>
                      <td className="py-2 px-3"><Badge className="bg-warning/10 text-warning text-xs border-0">Low Stock</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
