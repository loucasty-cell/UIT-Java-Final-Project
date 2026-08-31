import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    name: string;
    email: string;
    bio: string;
    major?: string;
    yearOfStudy?: number;
  };
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

/**
 * PHASE 9: Edit Profile Modal
 */
export function EditProfileModal({
  open,
  onOpenChange,
  initialData,
  onSave,
  isLoading = false,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearOfStudy" ? (value ? parseInt(value) : undefined) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (formData.bio && formData.bio.length > 500) newErrors.bio = "Bio must be less than 500 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitError(null);
    setSuccess(false);
    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to save profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={formData.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} disabled={isLoading} className="h-20 resize-none" />
            <p className="text-xs text-muted-foreground">{formData.bio?.length || 0}/500</p>
            {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Major</Label>
            <Input id="major" name="major" value={formData.major || ""} onChange={handleChange} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearOfStudy">Year of Study</Label>
            <Input id="yearOfStudy" name="yearOfStudy" type="number" min="1" max="8" value={formData.yearOfStudy || ""} onChange={handleChange} disabled={isLoading} />
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {submitError}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-800 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Saved!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
