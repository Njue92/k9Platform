import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Award, Activity, MapPin, Dog as DogIcon, Loader2, Phone } from "lucide-react";
import { dogsAPI, dashboardAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Trainers = () => {
  const [dogs, setDogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Authenticated user: fetch own dogs + stats
          const [dogsRes, statsRes] = await Promise.all([
            dogsAPI.list(),
            dashboardAPI.getStats(),
          ]);
          setDogs(dogsRes.data?.results ?? dogsRes.data ?? []);
          setStats(statsRes.data);
        } else {
          // Unauthenticated visitor: fetch all active dogs added by trainers (public endpoint)
          const dogsRes = await dogsAPI.listPublicByRole('trainer');
          const data = dogsRes.data?.results ?? dogsRes.data ?? [];
          setDogs(data);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-light via-background to-accent-light py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Training Module</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              K9 Training & Working Dogs
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Professional training management and deployment tracking for working K9 units.
              Monitor certifications, performance, and operational readiness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview — only shown to authenticated users */}
      {user && (
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Working Dogs", value: stats.total_dogs ?? 0, icon: GraduationCap },
                { label: "Certified Dogs", value: stats.certified_dogs ?? 0, icon: Award },
                { label: "Total Deployments", value: stats.total_deployments ?? 0, icon: Activity },
                { label: "Active Deployments", value: stats.active_deployments ?? 0, icon: MapPin },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-4 text-center hover:shadow-md transition-shadow">
                    <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dog Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : dogs.length === 0 ? (
            <div className="text-center py-16">
              <DogIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No dogs registered yet</h3>
              <p className="text-muted-foreground">
                {user
                  ? "Add dogs from your Trainer Dashboard to see them here."
                  : "No trainer dogs are currently listed. Check back soon."}
              </p>
              {user && (
                <Link to="/trainer-dashboard">
                  <Button className="mt-4">Go to Dashboard</Button>
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {dogs.map((dog) => (
                <motion.div key={dog.id} variants={itemVariants}>
                  <Link to={`/dog/${dog.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {dog.image_url || dog.image ? (
                          <img
                            src={dog.image_url || dog.image}
                            alt={dog.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <DogIcon className="h-20 w-20 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={
                              dog.status === "active"
                                ? "bg-secondary text-white shadow-lg"
                                : "bg-accent text-white shadow-lg"
                            }
                          >
                            <span className="capitalize">{dog.status}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                              {dog.name}
                            </h3>
                            <p className="text-muted-foreground">{dog.breed}</p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {dog.gender}
                          </Badge>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age:</span>
                            <span className="font-medium">{dog.age} {dog.age === 1 ? 'year' : 'years'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Color:</span>
                            <span className="font-medium">{dog.color}</span>
                          </div>
                          {dog.owner_name && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trainer:</span>
                              <span className="font-medium text-xs">{dog.owner_name}</span>
                            </div>
                          )}
                          {/* Only show sensitive fields for authenticated users */}
                          {user && dog.registration_number && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Registration:</span>
                              <span className="font-medium text-xs">{dog.registration_number}</span>
                            </div>
                          )}
                          {user && dog.microchip_number && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Microchip:</span>
                              <span className="font-medium text-xs">{dog.microchip_number}</span>
                            </div>
                          )}
                          {dog.owner_mobile && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />Mobile:</span>
                              <span className="font-medium text-xs">{dog.owner_mobile}</span>
                            </div>
                          )}
                          {dog.training_records && dog.training_records.length > 0 && (
                            <div className="pt-2 border-t border-border mt-2">
                              <span className="text-muted-foreground flex items-center gap-1 mb-1"><GraduationCap className="h-3 w-3" />Training:</span>
                              {dog.training_records.slice(0, 2).map((tr: any, i: number) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span>{tr.training_type}</span>
                                  <Badge variant="outline" className="text-xs capitalize py-0">{tr.level}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button className="w-full mt-4" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Trainers;
