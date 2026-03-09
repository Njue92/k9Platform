import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { breedingAPI } from "@/lib/api";
import { toast } from "sonner";

interface AddLitterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddLitterModal = ({ open, onOpenChange, onSuccess }: AddLitterModalProps) => {
  const [loading, setLoading] = useState(false);
  const [breedingRecords, setBreedingRecords] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    breeding_record: "",
    litter_id: "",
    total_puppies: "",
    males: "",
    females: "",
    birth_date: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadBreedingRecords();
    }
  }, [open]);

  const loadBreedingRecords = async () => {
    try {
      const response = await breedingAPI.listRecords();
      setBreedingRecords(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to load breeding records:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        breeding_record: parseInt(formData.breeding_record),
        total_puppies: parseInt(formData.total_puppies),
        males: parseInt(formData.males),
        females: parseInt(formData.females),
      };
      await breedingAPI.createLitter(payload);
      toast.success("Litter added successfully!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        breeding_record: "",
        litter_id: "",
        total_puppies: "",
        males: "",
        females: "",
        birth_date: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add litter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Litter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="breeding_record">Breeding Record *</Label>
            <Select
              value={formData.breeding_record}
              onValueChange={(value) => setFormData({ ...formData, breeding_record: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select breeding record" />
              </SelectTrigger>
              <SelectContent>
                {breedingRecords.map((record) => (
                  <SelectItem key={record.id} value={record.id.toString()}>
                    {record.dog_name} x {record.partner_name || "Unknown"} ({record.mating_date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="litter_id">Litter ID *</Label>
              <Input
                id="litter_id"
                value={formData.litter_id}
                onChange={(e) => setFormData({ ...formData, litter_id: e.target.value })}
                placeholder="e.g., LTR-2024-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Birth Date *</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_puppies">Total Puppies *</Label>
              <Input
                id="total_puppies"
                type="number"
                min="0"
                value={formData.total_puppies}
                onChange={(e) => setFormData({ ...formData, total_puppies: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="males">Males *</Label>
              <Input
                id="males"
                type="number"
                min="0"
                value={formData.males}
                onChange={(e) => setFormData({ ...formData, males: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="females">Females *</Label>
              <Input
                id="females"
                type="number"
                min="0"
                value={formData.females}
                onChange={(e) => setFormData({ ...formData, females: e.target.value })}
                required
              />
            </div>
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
            <Button type="submit" disabled={loading || !formData.breeding_record}>
              {loading ? "Adding..." : "Add Litter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLitterModal;
