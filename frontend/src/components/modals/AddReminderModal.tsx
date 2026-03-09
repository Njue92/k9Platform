import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { remindersAPI, dogsAPI } from "@/lib/api";
import { toast } from "sonner";

interface AddReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddReminderModal = ({ open, onOpenChange, onSuccess }: AddReminderModalProps) => {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    dog: "",
  });

  useEffect(() => {
    if (open) {
      loadDogs();
    }
  }, [open]);

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
        dog: formData.dog ? parseInt(formData.dog) : null,
      };
      await remindersAPI.create(payload);
      toast.success("Reminder added successfully!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
        dog: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add reminder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dog">Related Dog (Optional)</Label>
            <Select
              value={formData.dog || "none"}
              onValueChange={(value) => setFormData({ ...formData, dog: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dog (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {dogs.map((dog) => (
                  <SelectItem key={dog.id} value={dog.id.toString()}>
                    {dog.name} - {dog.breed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderModal;
