import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { documentsAPI, dogsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  dogId?: number;
}

const UploadDocumentModal = ({ open, onOpenChange, onSuccess, dogId }: UploadDocumentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    document_type: "",
    dog: dogId?.toString() || "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("title", formData.title);
      data.append("document_type", formData.document_type);
      data.append("dog", formData.dog);
      if (formData.notes) {
        data.append("notes", formData.notes);
      }

      await documentsAPI.create(data);
      toast.success("Document uploaded successfully!");
      onSuccess();
      onOpenChange(false);
      setFile(null);
      setFormData({
        title: "",
        document_type: "",
        dog: dogId?.toString() || "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    "Registration",
    "Health Certificate",
    "Vaccination Record",
    "Pedigree",
    "Training Certificate",
    "Insurance",
    "Contract",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type *</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData({ ...formData, document_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Upload className="h-3 w-3" />
                {file.name}
              </p>
            )}
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
            <Button type="submit" disabled={loading || !file || !formData.dog}>
              {loading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;
