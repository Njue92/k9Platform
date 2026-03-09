import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { breedingAPI, dogsAPI } from "@/lib/api";
import { toast } from "sonner";

interface AddBreedingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  dogId?: number;
}

const AddBreedingModal = ({ open, onOpenChange, onSuccess, dogId }: AddBreedingModalProps) => {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    dog: dogId?.toString() || "",
    partner: "",
    mating_date: "",
    expected_whelping_date: "",
    actual_whelping_date: "",
    pregnancy_confirmed: false,
    complications: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadDogs();
    }
  }, [open]);

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
    setLoading(true);

    try {
      const payload = {
        ...formData,
        dog: parseInt(formData.dog),
        partner: formData.partner ? parseInt(formData.partner) : null,
        expected_whelping_date: formData.expected_whelping_date || null,
        actual_whelping_date: formData.actual_whelping_date || null,
      };
      await breedingAPI.createRecord(payload);
      toast.success("Breeding record added successfully!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        dog: dogId?.toString() || "",
        partner: "",
        mating_date: "",
        expected_whelping_date: "",
        actual_whelping_date: "",
        pregnancy_confirmed: false,
        complications: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add breeding record");
    } finally {
      setLoading(false);
    }
  };

  const femaleDogs = dogs.filter((d) => d.gender === "female");
  const maleDogs = dogs.filter((d) => d.gender === "male");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Breeding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dog">Dam (Female) *</Label>
              <Select
                value={formData.dog}
                onValueChange={(value) => setFormData({ ...formData, dog: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dam" />
                </SelectTrigger>
                <SelectContent>
                  {femaleDogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id.toString()}>
                      {dog.name} - {dog.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner">Sire (Male)</Label>
              <Select
                value={formData.partner}
                onValueChange={(value) => setFormData({ ...formData, partner: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sire" />
                </SelectTrigger>
                <SelectContent>
                  {maleDogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id.toString()}>
                      {dog.name} - {dog.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mating_date">Mating Date *</Label>
              <Input
                id="mating_date"
                type="date"
                value={formData.mating_date}
                onChange={(e) => setFormData({ ...formData, mating_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_whelping_date">Expected Whelping Date</Label>
              <Input
                id="expected_whelping_date"
                type="date"
                value={formData.expected_whelping_date}
                onChange={(e) => setFormData({ ...formData, expected_whelping_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actual_whelping_date">Actual Whelping Date</Label>
              <Input
                id="actual_whelping_date"
                type="date"
                value={formData.actual_whelping_date}
                onChange={(e) => setFormData({ ...formData, actual_whelping_date: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="pregnancy_confirmed"
                checked={formData.pregnancy_confirmed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, pregnancy_confirmed: checked as boolean })
                }
              />
              <Label htmlFor="pregnancy_confirmed">Pregnancy Confirmed</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complications">Complications</Label>
            <Textarea
              id="complications"
              value={formData.complications}
              onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
              placeholder="Note any complications..."
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
              {loading ? "Adding..." : "Add Breeding Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBreedingModal;
