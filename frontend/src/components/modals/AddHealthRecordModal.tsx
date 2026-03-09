import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { healthAPI, dogsAPI } from "@/lib/api";
import { toast } from "sonner";

interface AddHealthRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  dogId?: number;
}

const AddHealthRecordModal = ({ open, onOpenChange, onSuccess, dogId }: AddHealthRecordModalProps) => {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    dog: dogId?.toString() || "",
    date: new Date().toISOString().split('T')[0],
    type: "",
    description: "",
    vet_name: "",
    medication: "",
    notes: "",
    next_appointment: "",
  });

  useEffect(() => {
    if (open && !dogId) {
      loadDogs();
    }
  }, [open, dogId]);

  useEffect(() => {
    if (dogId) {
      setFormData(prev => ({ ...prev, dog: dogId.toString() }));
    }
  }, [dogId]);

  const loadDogs = async () => {
    try {
      const response = await dogsAPI.list();
      setDogs(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to load dogs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dog) {
      toast.error("Please select a dog");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        ...formData,
        dog: parseInt(formData.dog),
        next_appointment: formData.next_appointment || null,
      };
      await healthAPI.create(payload);
      toast.success("Health record added successfully!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        dog: dogId?.toString() || "",
        date: new Date().toISOString().split('T')[0],
        type: "",
        description: "",
        vet_name: "",
        medication: "",
        notes: "",
        next_appointment: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add health record");
    } finally {
      setLoading(false);
    }
  };

  const healthTypes = [
    "Vaccination",
    "Checkup",
    "Surgery",
    "Dental",
    "X-Ray",
    "Blood Test",
    "Deworming",
    "Flea/Tick Treatment",
    "Injury",
    "Illness",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Health Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!dogId && (
            <div className="space-y-2">
              <Label htmlFor="dog">Dog *</Label>
              <Select
                value={formData.dog}
                onValueChange={(value) => setFormData({ ...formData, dog: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dog" />
                </SelectTrigger>
                <SelectContent>
                  {dogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id.toString()}>
                      {dog.name} - {dog.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {healthTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_name">Veterinarian</Label>
            <Input
              id="vet_name"
              value={formData.vet_name}
              onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
              placeholder="Dr. Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the health record..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication">Medication</Label>
            <Textarea
              id="medication"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              placeholder="Prescribed medications..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_appointment">Next Appointment</Label>
            <Input
              id="next_appointment"
              type="date"
              value={formData.next_appointment}
              onChange={(e) => setFormData({ ...formData, next_appointment: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHealthRecordModal;
