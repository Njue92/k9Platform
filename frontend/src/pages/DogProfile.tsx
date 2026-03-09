import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Calendar,
  FileText,
  Activity,
  Stethoscope,
  Award,
  DollarSign,
  Dog,
  ArrowLeft,
  Trash2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dogsAPI, healthAPI, breedingAPI, trainingAPI, documentsAPI, financialAPI } from "@/lib/api";
import { toast } from "sonner";
import AddHealthRecordModal from "@/components/modals/AddHealthRecordModal";
import AddTrainingModal from "@/components/modals/AddTrainingModal";
import AddBreedingModal from "@/components/modals/AddBreedingModal";
import UploadDocumentModal from "@/components/modals/UploadDocumentModal";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MEDIA_URL = API_URL.replace('/api', '');

interface DogData {
  id: number;
  name: string;
  breed: string;
  gender: string;
  date_of_birth: string;
  color: string;
  markings: string;
  registration_number: string;
  microchip_number: string;
  status: string;
  image: string | null;
  image_url: string | null;
  age: number;
  owner_name: string;
  sire?: number | null;
  dam?: number | null;
}

const DogProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dog, setDog] = useState<DogData | null>(null);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<any[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [financialRecords, setFinancialRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [showAddBreeding, setShowAddBreeding] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);

  useEffect(() => {
    if (id) {
      loadDogData();
    }
  }, [id, user]);


  const loadDogData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user) {
        // Authenticated: fetch dog + all associated records
        // Use individual try/catch so role-restricted endpoints don't block the whole page
        const safeFetch = async (fn: () => Promise<any>) => {
          try {
            const res = await fn();
            return res.data.results || res.data;
          } catch {
            return [];
          }
        };

        const [dogRes, allHealth, allBreeding, allTraining, allDocs, allFinancial] = await Promise.all([
          dogsAPI.get(Number(id)),
          safeFetch(() => healthAPI.list()),
          safeFetch(() => breedingAPI.listRecords()),
          safeFetch(() => trainingAPI.listRecords()),
          safeFetch(() => documentsAPI.list()),
          safeFetch(() => financialAPI.list()),
        ]);

        setDog(dogRes.data);

        setHealthRecords(allHealth.filter((r: any) => r.dog === Number(id)));
        setBreedingRecords(allBreeding.filter((r: any) => r.dog === Number(id)));
        setTrainingRecords(allTraining.filter((r: any) => r.dog === Number(id)));
        setDocuments(allDocs.filter((d: any) => d.dog === Number(id)));
        setFinancialRecords(allFinancial.filter((f: any) => f.dog === Number(id)));
      } else {
        // Unauthenticated visitor: only fetch public dog profile (no private records)
        const dogRes = await dogsAPI.getPublic(Number(id));
        setDog(dogRes.data);
        setHealthRecords([]);
        setBreedingRecords([]);
        setTrainingRecords([]);
        setDocuments([]);
        setFinancialRecords([]);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to load dog data";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    // Navigate to the correct dashboard based on user role
    const role = user?.role;
    if (role === 'breeder') {
      navigate('/breeder-dashboard');
    } else if (role === 'trainer') {
      navigate('/trainer-dashboard');
    } else {
      navigate(-1);
    }
  };

  const handleDeleteDog = async () => {
    if (!confirm("Are you sure you want to delete this dog? This action cannot be undone.")) {
      return;
    }
    try {
      await dogsAPI.delete(Number(id));
      toast.success("Dog deleted successfully");
      handleGoBack();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete dog");
    }
  };

  const getImageUrl = () => {
    if (dog?.image_url) return dog.image_url;
    if (dog?.image) return `${MEDIA_URL}${dog.image}`;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <div className="relative h-96 bg-muted animate-pulse" />
        <div className="container mx-auto px-4 -mt-8">
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </Card>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Dog className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Dog Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The dog you're looking for doesn't exist."}
          </p>
          <Button onClick={handleGoBack}>Go Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dog.name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dog className="h-32 w-32 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button variant="secondary" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Action Buttons — only for authenticated owners */}
        {user && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDeleteDog}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className={`mb-4 ${
                dog.status === 'active' ? 'bg-primary' : 'bg-muted'
              }`}>
                {dog.status.charAt(0).toUpperCase() + dog.status.slice(1)}
              </Badge>
              <h1 className="text-5xl font-bold mb-2">{dog.name}</h1>
              <p className="text-xl text-muted-foreground">{dog.breed}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 mb-8 shadow-xl">
            <div className={`grid grid-cols-2 ${user ? 'md:grid-cols-4 lg:grid-cols-6' : 'md:grid-cols-4'} gap-4`}>
              {[
                { label: "Gender", value: dog.gender.charAt(0).toUpperCase() + dog.gender.slice(1), icon: Heart },
                { label: "Age", value: `${dog.age} years`, icon: Calendar },
                { label: "Color", value: dog.color, icon: Activity },
                { label: "Status", value: dog.status.charAt(0).toUpperCase() + dog.status.slice(1), icon: FileText },
                // Only show sensitive stats for authenticated users
                ...(user ? [
                  { label: "Microchip", value: dog.microchip_number || "N/A", icon: Stethoscope },
                  { label: "Registration", value: dog.registration_number || "N/A", icon: Award },
                ] : []),
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="font-semibold text-sm">{stat.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Detailed Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className={`grid w-full ${user ? 'grid-cols-5' : 'grid-cols-1'} lg:w-auto lg:inline-grid`}>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {user && <TabsTrigger value="health">Health ({healthRecords.length})</TabsTrigger>}
              {user && (user.role === 'trainer' || user.role === 'superadmin') && <TabsTrigger value="training">Training ({trainingRecords.length})</TabsTrigger>}
              {user && (user.role === 'breeder' || user.role === 'superadmin') && <TabsTrigger value="breeding">Breeding ({breedingRecords.length})</TabsTrigger>}
              {user && <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>}
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{dog.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Breed:</span>
                    <p className="font-medium">{dog.breed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <p className="font-medium">{dog.gender.charAt(0).toUpperCase() + dog.gender.slice(1)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <p className="font-medium">{new Date(dog.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <p className="font-medium">{dog.color}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">{dog.status.charAt(0).toUpperCase() + dog.status.slice(1)}</p>
                  </div>
                  {/* Only show sensitive fields for authenticated users */}
                  {user && (
                    <div>
                      <span className="text-muted-foreground">Registration No:</span>
                      <p className="font-medium">{dog.registration_number || "Not registered"}</p>
                    </div>
                  )}
                  {user && (
                    <div>
                      <span className="text-muted-foreground">Microchip:</span>
                      <p className="font-medium">{dog.microchip_number || "Not microchipped"}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <p className="font-medium">{dog.owner_name || "You"}</p>
                  </div>
                  {dog.markings && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Markings:</span>
                      <p className="font-medium">{dog.markings}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Financial Summary — only for authenticated users */}
              {user && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-secondary" />
                    Financial Summary
                  </h3>
                  {financialRecords.length > 0 ? (
                    <div className="space-y-3">
                      {financialRecords.slice(0, 5).map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium text-sm">{record.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.category} • {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`font-bold ${
                            record.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.transaction_type === 'income' ? '+' : '-'}Ksh.{record.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No financial records for this dog</p>
                  )}
                </Card>
              )}
            </TabsContent>

            <TabsContent value="health" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Health Records</h3>
                <Button size="sm" onClick={() => setShowAddHealth(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>

              {healthRecords.length > 0 ? (
                healthRecords.map((record) => (
                  <Card key={record.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{record.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {record.vet_name && (
                        <div>
                          <span className="text-muted-foreground text-sm">Veterinarian:</span>
                          <p className="font-medium">{record.vet_name}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground text-sm">Description:</span>
                        <p>{record.description}</p>
                      </div>
                      {record.medication && (
                        <div>
                          <span className="text-muted-foreground text-sm">Medication:</span>
                          <p>{record.medication}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Stethoscope className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Health Records</h3>
                  <p className="text-muted-foreground mb-6">
                    Start tracking {dog.name}'s health by adding records
                  </p>
                  <Button onClick={() => setShowAddHealth(true)}>Add Health Record</Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="training" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Training Records</h3>
                <Button size="sm" onClick={() => setShowAddTraining(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Training
                </Button>
              </div>

              {trainingRecords.length > 0 ? (
                trainingRecords.map((record) => (
                  <Card key={record.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{record.training_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Started: {new Date(record.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{record.level}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground text-sm">Handler:</span>
                        <p className="font-medium">{record.handler}</p>
                      </div>
                      {record.certification && (
                        <div>
                          <span className="text-muted-foreground text-sm">Certification:</span>
                          <p className="font-medium">{record.certification}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground text-sm">Skills Mastered:</span>
                        <p>{record.skills_mastered}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Training Records</h3>
                  <p className="text-muted-foreground mb-6">
                    Track {dog.name}'s training progress and certifications
                  </p>
                  <Button onClick={() => setShowAddTraining(true)}>Add Training Record</Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="breeding" className="space-y-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Breeding History</h3>
                <Button size="sm" onClick={() => setShowAddBreeding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>

              {breedingRecords.length > 0 ? (
                breedingRecords.map((record, index) => (
                  <Card key={record.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          Breeding #{breedingRecords.length - index}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.mating_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={record.pregnancy_confirmed ? "default" : "secondary"}>
                        {record.pregnancy_confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {record.partner_name && (
                        <div>
                          <span className="text-muted-foreground text-sm">Partner:</span>
                          <p className="font-medium">{record.partner_name}</p>
                        </div>
                      )}
                      {record.expected_whelping_date && (
                        <div>
                          <span className="text-muted-foreground text-sm">Expected Whelping:</span>
                          <p className="font-medium">
                            {new Date(record.expected_whelping_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Breeding Records</h3>
                  <p className="text-muted-foreground mb-6">
                    Track {dog.name}'s breeding history and litters
                  </p>
                  <Button onClick={() => setShowAddBreeding(true)}>Add Breeding Record</Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Documents</h3>
                <Button size="sm" onClick={() => setShowUploadDoc(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>

              {documents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Documents Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload certificates, health records, and registration papers
                  </p>
                  <Button onClick={() => setShowUploadDoc(true)}>Upload Document</Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Modals */}
      <AddHealthRecordModal
        open={showAddHealth}
        onOpenChange={setShowAddHealth}
        onSuccess={loadDogData}
        dogId={Number(id)}
      />
      <AddTrainingModal
        open={showAddTraining}
        onOpenChange={setShowAddTraining}
        onSuccess={loadDogData}
        dogId={Number(id)}
      />
      <AddBreedingModal
        open={showAddBreeding}
        onOpenChange={setShowAddBreeding}
        onSuccess={loadDogData}
        dogId={Number(id)}
      />
      <UploadDocumentModal
        open={showUploadDoc}
        onOpenChange={setShowUploadDoc}
        onSuccess={loadDogData}
        dogId={Number(id)}
      />
    </div>
  );
};

export default DogProfile;
