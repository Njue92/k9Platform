import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trainingAPI, dogsAPI } from "@/lib/api";
import { toast } from "sonner";

interface AddTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  dogId?: number;
}

const AddTrainingModal = ({ open, onOpenChange, onSuccess, dogId }: AddTrainingModalProps) => {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    dog: dogId?.toString() || "",
    training_type: "",
    level: "beginner",
    start_date: "",
    end_date: "",
    handler: "",
    skills_mastered: "",
    certification: "",
    notes: "",
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
        end_date: formData.end_date || null,
      };
      await trainingAPI.createRecord(payload);
      toast.success("Training record added successfully!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        dog: dogId?.toString() || "",
        training_type: "",
        level: "beginner",
        start_date: "",
        end_date: "",
        handler: "",
        skills_mastered: "",
        certification: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add training record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Training</DialogTitle>
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
              <Label htmlFor="training_type">Training Type *</Label>
              <Input
                id="training_type"
                value={formData.training_type}
                onChange={(e) => setFormData({ ...formData, training_type: e.target.value })}
                placeholder="e.g., Detection, Protection, SAR"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="handler">Handler *</Label>
              <Input
                id="handler"
                value={formData.handler}
                onChange={(e) => setFormData({ ...formData, handler: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification">Certification</Label>
              <Input
                id="certification"
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                placeholder="e.g., K9 Patrol Certified"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills_mastered">Skills Mastered *</Label>
            <Textarea
              id="skills_mastered"
              value={formData.skills_mastered}
              onChange={(e) => setFormData({ ...formData, skills_mastered: e.target.value })}
              placeholder="List the skills mastered during training..."
              required
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
            <Button type="submit" disabled={loading || !formData.dog}>
              {loading ? "Adding..." : "Add Training Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrainingModal;
