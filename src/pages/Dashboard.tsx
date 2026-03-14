import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, Loader2, Plus, Trash2, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useOrders, useAddresses } from '@/hooks/useProducts';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  processing: 'bg-primary/10 text-primary',
  shipped: 'bg-warning/10 text-warning',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const Dashboard = () => {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: addresses } = useAddresses();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Address dialog
  const [showAddrDialog, setShowAddrDialog] = useState(false);
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'US' });

  useEffect(() => { if (!loading && !user) navigate('/auth'); }, [user, loading, navigate]);
  useEffect(() => { if (profile) { setFullName(profile.full_name || ''); setPhone(profile.phone || ''); } }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try { await updateProfile({ full_name: fullName, phone }); toast.success('Profile updated'); } catch { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  const handleAddAddress = async () => {
    if (!user) return;
    const { error } = await supabase.from('addresses').insert({
      user_id: user.id, ...addrForm, is_default: !addresses?.length,
    });
    if (error) toast.error('Failed to add address');
    else { toast.success('Address added'); queryClient.invalidateQueries({ queryKey: ['addresses'] }); setShowAddrDialog(false); setAddrForm({ name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'US' }); }
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
    toast.success('Address deleted');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const totalSpent = orders?.reduce((s, o) => s + Number(o.total), 0) || 0;
  const totalOrders = orders?.length || 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10 pb-20">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-10">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => { signOut(); navigate('/'); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-card">
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="font-display font-bold text-lg">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="font-display font-bold text-lg">${totalSpent.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="p-4 text-center">
                  <Heart className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="font-display font-bold text-lg">{wishlistItems.length}</p>
                  <p className="text-xs text-muted-foreground">Wishlist</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="font-display font-bold text-lg">{addresses?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Addresses</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="settings">Profile</TabsTrigger>
              </TabsList>

              {/* Orders */}
              <TabsContent value="orders" className="mt-6">
                {ordersLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id} className="border-0 shadow-card">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-display font-semibold">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={statusColors[order.status]}>{order.status}</Badge>
                              <span className="font-display font-bold">${order.total}</span>
                            </div>
                          </div>
                          {order.tracking_number && (
                            <p className="text-xs text-muted-foreground">Tracking: {order.tracking_number}</p>
                          )}
                          {(order as any).order_items && (
                            <div className="flex gap-2 mt-3">
                              {(order as any).order_items.slice(0, 4).map((item: any) => (
                                item.product_image && <img key={item.id} src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              ))}
                              {(order as any).order_items.length > 4 && (
                                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                                  +{(order as any).order_items.length - 4}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-10 text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                      <p className="text-lg font-display font-semibold mb-2">No orders yet</p>
                      <Button asChild><Link to="/shop">Start Shopping</Link></Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Wishlist */}
              <TabsContent value="wishlist" className="mt-6">
                {wishlistItems.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {wishlistItems.map(product => (
                      <Card key={product.id} className="border-0 shadow-card">
                        <CardContent className="p-4 flex gap-4">
                          <Link to={`/product/${product.slug}`} className="shrink-0">
                            <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${product.slug}`} className="font-display font-semibold text-sm hover:text-primary line-clamp-1">{product.name}</Link>
                            <p className="font-bold mt-1">${product.discountPrice ?? product.price}</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => addToCart(product)}>Add to Cart</Button>
                              <Button size="sm" variant="ghost" onClick={() => removeFromWishlist(product.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-10 text-center text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                      <p className="text-lg font-display font-semibold mb-2">Your wishlist is empty</p>
                      <Button asChild><Link to="/shop">Browse Products</Link></Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Addresses */}
              <TabsContent value="addresses" className="mt-6">
                <div className="flex justify-between mb-4">
                  <h3 className="font-display font-semibold">Saved Addresses</h3>
                  <Dialog open={showAddrDialog} onOpenChange={setShowAddrDialog}>
                    <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Address</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Address</DialogTitle></DialogHeader>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div><Label>Name</Label><Input className="mt-1" value={addrForm.name} onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))} /></div>
                        <div><Label>Phone</Label><Input className="mt-1" value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} /></div>
                        <div className="sm:col-span-2"><Label>Street</Label><Input className="mt-1" value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))} /></div>
                        <div><Label>City</Label><Input className="mt-1" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} /></div>
                        <div><Label>State</Label><Input className="mt-1" value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))} /></div>
                        <div><Label>ZIP</Label><Input className="mt-1" value={addrForm.zip} onChange={e => setAddrForm(p => ({ ...p, zip: e.target.value }))} /></div>
                        <div><Label>Country</Label><Input className="mt-1" value={addrForm.country} onChange={e => setAddrForm(p => ({ ...p, country: e.target.value }))} /></div>
                      </div>
                      <Button className="mt-4" onClick={handleAddAddress}>Save Address</Button>
                    </DialogContent>
                  </Dialog>
                </div>
                {addresses && addresses.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <Card key={addr.id} className="border-0 shadow-card">
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-2">
                            <p className="font-medium text-sm">{addr.name}</p>
                            {addr.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.street}</p>
                          <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                          {addr.phone && <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>}
                          <Button size="sm" variant="ghost" className="mt-2 text-destructive" onClick={() => handleDeleteAddress(addr.id)}>
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-10 text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                      <p>No saved addresses yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Profile */}
              <TabsContent value="settings" className="mt-6">
                <Card className="border-0 shadow-card">
                  <CardContent className="p-6 space-y-5">
                    <div><Label>Full Name</Label><Input className="mt-1.5 h-11" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                    <div><Label>Email</Label><Input className="mt-1.5 h-11" value={user.email || ''} disabled /></div>
                    <div><Label>Phone</Label><Input className="mt-1.5 h-11" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
