import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface ProfileSetupProps {
  userId: string;
  existingProfile: any;
  onProfileUpdate: () => void;
}

const ProfileSetup = ({ userId, existingProfile, onProfileUpdate }: ProfileSetupProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    health_goals: "",
    dietary_restrictions: "",
    allergies: "",
    medical_conditions: "",
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        full_name: existingProfile.full_name || "",
        gender: existingProfile.gender || "",
        age: existingProfile.age?.toString() || "",
        height_cm: existingProfile.height_cm?.toString() || "",
        weight_kg: existingProfile.weight_kg?.toString() || "",
        activity_level: existingProfile.activity_level || "",
        health_goals: existingProfile.health_goals?.join(", ") || "",
        dietary_restrictions: existingProfile.dietary_restrictions?.join(", ") || "",
        allergies: existingProfile.allergies?.join(", ") || "",
        medical_conditions: existingProfile.medical_conditions?.join(", ") || "",
      });
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const profileData = {
        id: userId,
        email: user.email!,
        full_name: formData.full_name,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        activity_level: formData.activity_level || null,
        health_goals: formData.health_goals
          ? formData.health_goals.split(",").map((g) => g.trim()).filter(Boolean)
          : [],
        dietary_restrictions: formData.dietary_restrictions
          ? formData.dietary_restrictions.split(",").map((r) => r.trim()).filter(Boolean)
          : [],
        allergies: formData.allergies
          ? formData.allergies.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
        medical_conditions: formData.medical_conditions
          ? formData.medical_conditions.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" });

      if (error) throw error;

      toast.success("Profile saved successfully!");
      onProfileUpdate();
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-soft gradient-card">
      <CardHeader>
        <CardTitle>Health Profile</CardTitle>
        <CardDescription>
          Complete your profile to get personalized nutritional recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
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
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="1"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                min="50"
                max="300"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                min="20"
                max="500"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select
                value={formData.activity_level}
                onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goals">Health Goals (comma-separated)</Label>
              <Textarea
                id="goals"
                value={formData.health_goals}
                onChange={(e) => setFormData({ ...formData, health_goals: e.target.value })}
                placeholder="e.g., Weight loss, Muscle gain, Better energy"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restrictions">Dietary Restrictions (comma-separated)</Label>
              <Textarea
                id="restrictions"
                value={formData.dietary_restrictions}
                onChange={(e) =>
                  setFormData({ ...formData, dietary_restrictions: e.target.value })
                }
                placeholder="e.g., Vegetarian, Gluten-free, Dairy-free"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies (comma-separated)</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g., Peanuts, Shellfish, Soy"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
              <Textarea
                id="conditions"
                value={formData.medical_conditions}
                onChange={(e) =>
                  setFormData({ ...formData, medical_conditions: e.target.value })
                }
                placeholder="e.g., Diabetes, Hypertension, High cholesterol"
                rows={2}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary hover:shadow-glow transition-smooth"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSetup;