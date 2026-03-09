import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { dogsAPI } from "@/lib/api";
import { toast } from "sonner";

interface AddDogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  navigateToProfile?: boolean;
}

const AddDogModal = ({ open, onOpenChange, onSuccess, navigateToProfile = true }: AddDogModalProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    gender: "male",
    date_of_birth: "",
    color: "",
    markings: "",
    registration_number: "",
    microchip_number: "",
    status: "active",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await dogsAPI.create(submitData);
      const newDogId = response.data?.id;

      toast.success("Dog added successfully!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: "",
        breed: "",
        gender: "male",
        date_of_birth: "",
        color: "",
        markings: "",
        registration_number: "",
        microchip_number: "",
        status: "active",
      });
      setImageFile(null);

      // Navigate to the new dog's profile page
      if (navigateToProfile && newDogId) {
        navigate(`/dog/${newDogId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add dog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Dog</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="markings">Markings</Label>
            <Textarea
              id="markings"
              value={formData.markings}
              onChange={(e) => setFormData({ ...formData, markings: e.target.value })}
              placeholder="Describe any distinctive markings..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration">Registration Number</Label>
              <Input
                id="registration"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="microchip">Microchip Number</Label>
              <Input
                id="microchip"
                value={formData.microchip_number}
                onChange={(e) => setFormData({ ...formData, microchip_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Photo</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Dog"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogModal;

// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { dogsAPI } from "@/lib/api";
// import { toast } from "sonner";
//
// interface AddDogModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSuccess: () => void;
// }
//
// const AddDogModal = ({ open, onOpenChange, onSuccess }: AddDogModalProps) => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     breed: "",
//     gender: "male",
//     date_of_birth: "",
//     color: "",
//     markings: "",
//     registration_number: "",
//     microchip_number: "",
//     status: "active",
//   });
//
//   const [imageFile, setImageFile] = useState<File | null>(null);
//
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//
//     try {
//       const submitData = new FormData();
//       Object.entries(formData).forEach(([key, value]) => {
//         submitData.append(key, value);
//       });
//       if (imageFile) {
//         submitData.append('image', imageFile);
//       }
//
//       await dogsAPI.create(submitData);
//       toast.success("Dog added successfully!");
//       onSuccess();
//       onOpenChange(false);
//       setFormData({
//         name: "",
//         breed: "",
//         gender: "male",
//         date_of_birth: "",
//         color: "",
//         markings: "",
//         registration_number: "",
//         microchip_number: "",
//         status: "active",
//       });
//       setImageFile(null);
//     } catch (error: any) {
//       toast.error(error.response?.data?.detail || "Failed to add dog");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Add New Dog</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Name *</Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="breed">Breed *</Label>
//               <Input
//                 id="breed"
//                 value={formData.breed}
//                 onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
//                 required
//               />
//             </div>
//           </div>
//
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="gender">Gender *</Label>
//               <Select
//                 value={formData.gender}
//                 onValueChange={(value) => setFormData({ ...formData, gender: value })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select gender" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="male">Male</SelectItem>
//                   <SelectItem value="female">Female</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="dob">Date of Birth *</Label>
//               <Input
//                 id="dob"
//                 type="date"
//                 value={formData.date_of_birth}
//                 onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
//                 required
//               />
//             </div>
//           </div>
//
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="color">Color *</Label>
//               <Input
//                 id="color"
//                 value={formData.color}
//                 onChange={(e) => setFormData({ ...formData, color: e.target.value })}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value) => setFormData({ ...formData, status: value })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="retired">Retired</SelectItem>
//                   <SelectItem value="sold">Sold</SelectItem>
//                   <SelectItem value="deceased">Deceased</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//
//           <div className="space-y-2">
//             <Label htmlFor="markings">Markings</Label>
//             <Textarea
//               id="markings"
//               value={formData.markings}
//               onChange={(e) => setFormData({ ...formData, markings: e.target.value })}
//               placeholder="Describe any distinctive markings..."
//             />
//           </div>
//
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="registration">Registration Number</Label>
//               <Input
//                 id="registration"
//                 value={formData.registration_number}
//                 onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="microchip">Microchip Number</Label>
//               <Input
//                 id="microchip"
//                 value={formData.microchip_number}
//                 onChange={(e) => setFormData({ ...formData, microchip_number: e.target.value })}
//               />
//             </div>
//           </div>
//
//           <div className="space-y-2">
//             <Label htmlFor="image">Photo</Label>
//             <Input
//               id="image"
//               type="file"
//               accept="image/*"
//               onChange={(e) => setImageFile(e.target.files?.[0] || null)}
//             />
//           </div>
//
//           <div className="flex justify-end gap-2 pt-4">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? "Adding..." : "Add Dog"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };
//
// export default AddDogModal;
