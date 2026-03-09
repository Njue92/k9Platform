import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Dog,
  Heart,
  GraduationCap,
  Package,
  Shield,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NotificationPanel from "@/components/NotificationPanel";

const SuperadminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<any[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Create user modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "", email: "", password: "", first_name: "", last_name: "", role: "breeder",
  });

  // Edit user modal
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  useEffect(() => {
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      navigate('/auth');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.listUsers(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error: any) {
      toast({ title: "Error loading data", description: error.response?.data?.error || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadBreedingRecords = async () => {
    try {
      const res = await adminAPI.listBreedingRecords();
      setBreedingRecords(res.data);
    } catch {}
  };

  const loadTrainingRecords = async () => {
    try {
      const res = await adminAPI.listTrainingRecords();
      setTrainingRecords(res.data);
    } catch {}
  };

  const loadEquipment = async () => {
    try {
      const res = await adminAPI.listEquipment();
      setEquipment(res.data);
    } catch {}
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'breeding' && breedingRecords.length === 0) loadBreedingRecords();
    if (tab === 'training' && trainingRecords.length === 0) loadTrainingRecords();
    if (tab === 'equipment' && equipment.length === 0) loadEquipment();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await adminAPI.createUser(newUser);
      toast({ title: "User created successfully" });
      setShowCreateUser(false);
      setNewUser({ username: "", email: "", password: "", first_name: "", last_name: "", role: "breeder" });
      loadData();
    } catch (error: any) {
      const errors = error.response?.data;
      const msg = errors ? Object.values(errors).flat().join(', ') : 'Failed to create user';
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      await adminAPI.updateUser(editUser.id, {
        first_name: editUser.first_name,
        last_name: editUser.last_name,
        email: editUser.email,
        role: editUser.role,
        is_active: editUser.is_active,
      });
      toast({ title: "User updated" });
      setShowEditUser(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminAPI.deleteUser(id);
      toast({ title: "User deleted" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats?.total_users || 0, icon: Users, bg: "from-primary to-primary-dark" },
    { title: "Breeders", value: stats?.total_breeders || 0, icon: Heart, bg: "from-secondary to-secondary-light" },
    { title: "Trainers", value: stats?.total_trainers || 0, icon: GraduationCap, bg: "from-accent to-accent/80" },
    { title: "Dogs", value: stats?.total_dogs || 0, icon: Dog, bg: "from-primary-light to-primary" },
    { title: "Breeding Records", value: stats?.total_breeding_records || 0, icon: Heart, bg: "from-secondary-light to-secondary" },
    { title: "Training Records", value: stats?.total_training_records || 0, icon: GraduationCap, bg: "from-accent/80 to-accent" },
    { title: "Equipment", value: stats?.total_equipment || 0, icon: Package, bg: "from-primary to-primary-light" },
    { title: "Deployments", value: stats?.total_deployments || 0, icon: Shield, bg: "from-secondary to-secondary-light" },
  ];

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'destructive';
      case 'breeder': return 'default';
      case 'trainer': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-secondary-light/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Superadmin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Full platform control — {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationPanel />
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((stat, i) => (
            <Card key={i} className="p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.bg}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="breeding"><Heart className="h-4 w-4 mr-1" />Breeding</TabsTrigger>
            <TabsTrigger value="training"><GraduationCap className="h-4 w-4 mr-1" />Training</TabsTrigger>
            <TabsTrigger value="equipment"><Package className="h-4 w-4 mr-1" />Equipment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Platform Summary</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">User Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Breeders</span><span className="font-bold">{stats?.total_breeders}</span></div>
                    <div className="flex justify-between"><span>Trainers</span><span className="font-bold">{stats?.total_trainers}</span></div>
                    <div className="flex justify-between"><span>Superadmins</span><span className="font-bold">{stats?.total_superadmins}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Records</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Dogs Registered</span><span className="font-bold">{stats?.total_dogs}</span></div>
                    <div className="flex justify-between"><span>Breeding Records</span><span className="font-bold">{stats?.total_breeding_records}</span></div>
                    <div className="flex justify-between"><span>Training Records</span><span className="font-bold">{stats?.total_training_records}</span></div>
                    <div className="flex justify-between"><span>Total Litters</span><span className="font-bold">{stats?.total_litters}</span></div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">All Users ({users.length})</h2>
                <Button onClick={() => setShowCreateUser(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Create User
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeColor(u.role) as any}>{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.is_active ? "default" : "outline"}>
                            {u.is_active ? "Active" : "Suspended"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(u.date_joined).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setEditUser({ ...u }); setShowEditUser(true); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Breeding Tab */}
          <TabsContent value="breeding">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">All Breeding Records ({breedingRecords.length})</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dam</TableHead>
                      <TableHead>Sire</TableHead>
                      <TableHead>Mating Date</TableHead>
                      <TableHead>Pregnancy</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breedingRecords.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.dog_name}</TableCell>
                        <TableCell>{r.partner_name || '—'}</TableCell>
                        <TableCell>{new Date(r.mating_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={r.pregnancy_confirmed ? "default" : "outline"}>
                            {r.pregnancy_confirmed ? "Confirmed" : "Unconfirmed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{r.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {breedingRecords.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No breeding records</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">All Training Records ({trainingRecords.length})</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dog</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Handler</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>Certification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingRecords.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.dog_name}</TableCell>
                        <TableCell>{r.training_type}</TableCell>
                        <TableCell><Badge variant="secondary">{r.level}</Badge></TableCell>
                        <TableCell>{r.handler}</TableCell>
                        <TableCell>{new Date(r.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{r.certification || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {trainingRecords.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No training records</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">All Equipment ({equipment.length})</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.item_name}</TableCell>
                        <TableCell>{e.item_type}</TableCell>
                        <TableCell>{e.quantity}</TableCell>
                        <TableCell><Badge variant="outline">{e.condition}</Badge></TableCell>
                        <TableCell>{e.owner_name || '—'}</TableCell>
                        <TableCell>Ksh.{e.cost}</TableCell>
                      </TableRow>
                    ))}
                    {equipment.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No equipment</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Username *</Label>
              <Input required value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div>
              <Label>Password *</Label>
              <Input required type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breeder">Breeder</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create User'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={editUser.first_name} onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={editUser.last_name} onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={editUser.role} onValueChange={(v) => setEditUser({ ...editUser, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breeder">Breeder</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label>Active</Label>
                <input
                  type="checkbox"
                  checked={editUser.is_active}
                  onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {editUser.is_active ? 'User can login' : 'User is suspended'}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditUser(false)}>Cancel</Button>
                <Button onClick={handleUpdateUser}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperadminDashboard;
