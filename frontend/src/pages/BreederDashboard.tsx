import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, dogsAPI, financialAPI, remindersAPI, equipmentAPI } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  DollarSign,
  Baby,
  Dog,
  TrendingUp,
  Bell,
  Plus,
  LogOut,
  FileText,
  CheckCircle,
  Stethoscope,
  Package,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddDogModal from "@/components/modals/AddDogModal";
import AddBreedingModal from "@/components/modals/AddBreedingModal";
import AddLitterModal from "@/components/modals/AddLitterModal";
import AddFinancialModal from "@/components/modals/AddFinancialModal";
import AddReminderModal from "@/components/modals/AddReminderModal";
import AddHealthRecordModal from "@/components/modals/AddHealthRecordModal";
import UploadDocumentModal from "@/components/modals/UploadDocumentModal";
import AddEquipmentModal from "@/components/modals/AddEquipmentModal";
import NotificationPanel from "@/components/NotificationPanel";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MEDIA_URL = API_URL.replace('/api', '');

const BreederDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddDog, setShowAddDog] = useState(false);
  const [showAddBreeding, setShowAddBreeding] = useState(false);
  const [showAddLitter, setShowAddLitter] = useState(false);
  const [showAddFinancial, setShowAddFinancial] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, dogsResponse, financialsResponse, equipmentResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dogsAPI.list(),
        financialAPI.list(),
        equipmentAPI.list(),
      ]);

      setStats(statsResponse.data);
      setDogs(dogsResponse.data.results || dogsResponse.data);
      setFinancials(financialsResponse.data.results || financialsResponse.data);
      setEquipmentList(equipmentResponse.data.results || equipmentResponse.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleMarkReminderComplete = async (id: number) => {
    try {
      await remindersAPI.update(id, { completed: true });
      loadDashboardData();
      toast({ title: "Reminder marked as complete" });
    } catch (error) {
      toast({ title: "Failed to update reminder", variant: "destructive" });
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    try {
      await equipmentAPI.delete(id);
      loadDashboardData();
      toast({ title: "Equipment removed" });
    } catch (error) {
      toast({ title: "Failed to delete equipment", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Dogs", value: stats?.total_dogs || 0, icon: Dog, bgGradient: "from-primary to-primary-dark" },
    { title: "Active Breeding Females", value: stats?.breeding_females || 0, icon: Heart, bgGradient: "from-secondary to-secondary-light" },
    { title: "Total Litters", value: stats?.total_litters || 0, icon: Baby, bgGradient: "from-accent to-accent/80" },
    { title: "Available Puppies", value: stats?.available_puppies || 0, icon: Dog, bgGradient: "from-primary-light to-primary" },
    { title: "Monthly Income", value: `Ksh.${stats?.monthly_income?.toLocaleString() || 0}`, icon: DollarSign, bgGradient: "from-secondary-light to-secondary" },
    { title: "Monthly Profit", value: `Ksh.${stats?.monthly_profit?.toLocaleString() || 0}`, icon: TrendingUp, bgGradient: "from-accent/80 to-accent" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-secondary-light/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Breeder Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.first_name} {user?.last_name}
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
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.bgGradient}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions — breeder-specific only, NO training actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Button onClick={() => setShowAddDog(true)} className="h-auto py-4 flex flex-col gap-2">
              <Plus className="h-5 w-5" />
              Add Dog
            </Button>
            <Button onClick={() => setShowAddBreeding(true)} variant="secondary" className="h-auto py-4 flex flex-col gap-2">
              <Heart className="h-5 w-5" />
              Record Breeding
            </Button>
            <Button onClick={() => setShowAddLitter(true)} variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Baby className="h-5 w-5" />
              Add Litter
            </Button>
            <Button onClick={() => setShowAddHealth(true)} variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Stethoscope className="h-5 w-5" />
              Health Record
            </Button>
            <Button onClick={() => setShowAddFinancial(true)} variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Record
            </Button>
            <Button onClick={() => setShowUploadDoc(true)} variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              Upload Document
            </Button>
            <Button onClick={() => setShowAddReminder(true)} variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Bell className="h-5 w-5" />
              Add Reminder
            </Button>
            <Button onClick={() => setShowAddEquipment(true)} variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Package className="h-5 w-5" />
              Add Equipment
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Dogs List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Dogs</h2>
              <Button onClick={() => setShowAddDog(true)} size="sm" variant="ghost">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-4">
              {dogs.length > 0 ? (
                dogs.slice(0, 5).map((dog) => (
                  <Link
                    key={dog.id}
                    to={`/dog/${dog.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {dog.image || dog.image_url ? (
                      <img
                        src={dog.image_url || `${MEDIA_URL}${dog.image}`}
                        alt={dog.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Dog className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{dog.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dog.breed} • {dog.gender} • {dog.age} yrs
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dog.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {dog.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Dog className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No dogs registered yet</p>
                  <Button onClick={() => setShowAddDog(true)} variant="link" className="mt-2">
                    Add your first dog
                  </Button>
                </div>
              )}
              {dogs.length > 5 && (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dogs">View All Dogs ({dogs.length})</Link>
                </Button>
              )}
            </div>
          </Card>

          {/* Reminders & Recent Financial */}
          <div className="space-y-8">
            {/* Reminders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Upcoming Reminders</h2>
                </div>
                <Button onClick={() => setShowAddReminder(true)} size="sm" variant="ghost">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {stats?.upcoming_reminders?.length > 0 ? (
                  stats.upcoming_reminders.map((reminder: any) => (
                    <div key={reminder.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold">{reminder.title}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            reminder.priority === 'high' ? 'bg-destructive/10 text-destructive'
                              : reminder.priority === 'medium' ? 'bg-accent/10 text-accent'
                              : 'bg-muted text-muted-foreground'
                          }`}>{reminder.priority}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleMarkReminderComplete(reminder.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{reminder.description}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(reminder.due_date).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming reminders</p>
                )}
              </div>
            </Card>

            {/* Recent Financial */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-secondary" />
                  <h2 className="text-xl font-bold">Recent Transactions</h2>
                </div>
                <Button onClick={() => setShowAddFinancial(true)} size="sm" variant="ghost">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {financials.length > 0 ? (
                  financials.slice(0, 5).map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm">{record.description}</p>
                        <p className="text-xs text-muted-foreground">{record.category} • {new Date(record.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`font-bold ${record.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.transaction_type === 'income' ? '+' : '-'}Ksh.{record.amount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No financial records</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Equipment Inventory */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Equipment Inventory</h2>
            </div>
            <Button onClick={() => setShowAddEquipment(true)} size="sm" variant="ghost">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentList.length > 0 ? (
              equipmentList.map((item: any) => (
                <div key={item.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">{item.item_type}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteEquipment(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{item.condition}</Badge>
                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                  <p className="text-sm font-medium mt-2">Ksh.{item.cost}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-3 text-center py-4">No equipment added yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <AddDogModal open={showAddDog} onOpenChange={setShowAddDog} onSuccess={loadDashboardData} />
      <AddBreedingModal open={showAddBreeding} onOpenChange={setShowAddBreeding} onSuccess={loadDashboardData} />
      <AddLitterModal open={showAddLitter} onOpenChange={setShowAddLitter} onSuccess={loadDashboardData} />
      <AddFinancialModal open={showAddFinancial} onOpenChange={setShowAddFinancial} onSuccess={loadDashboardData} />
      <AddReminderModal open={showAddReminder} onOpenChange={setShowAddReminder} onSuccess={loadDashboardData} />
      <AddHealthRecordModal open={showAddHealth} onOpenChange={setShowAddHealth} onSuccess={loadDashboardData} />
      <UploadDocumentModal open={showUploadDoc} onOpenChange={setShowUploadDoc} onSuccess={loadDashboardData} />
      <AddEquipmentModal open={showAddEquipment} onOpenChange={setShowAddEquipment} onSuccess={loadDashboardData} />
    </div>
  );
};

export default BreederDashboard;
