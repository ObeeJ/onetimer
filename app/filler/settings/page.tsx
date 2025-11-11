"use client"

import { useState, useMemo } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// --- Reusable Validation Logic ---
const validateField = (name: string, value: string, password = '') => {
  switch (name) {
    case 'first_name':
    case 'last_name':
      return value.length < 2 ? 'Must be at least 2 characters.' : '';
    case 'currentPassword':
      return value.length === 0 ? 'Current password is required.' : '';
    case 'newPassword':
      if (value.length < 8) return 'Must be at least 8 characters.';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) return 'Must include uppercase, lowercase, and a number.';
      return '';
    case 'confirmPassword':
      return value !== password ? 'Passwords do not match.' : '';
    case 'nin':
    case 'bvn':
        if (value && !/^[0-9]+$/.test(value)) return 'Must be numeric.';
        if (name === 'nin' && value.length !== 11) return 'NIN must be 11 digits.';
        if (name === 'bvn' && value.length !== 11) return 'BVN must be 11 digits.';
        return '';
    default:
      return '';
  }
};

// --- Profile Tab Component ---
function ProfileSettings() {
  // ... (Implementation remains largely the same but would add validation state if more complex fields were added)
}

// --- Security Tab Component ---
function SecuritySettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const mutation = useMutation({
    mutationFn: (passwordData: { old_password: string; new_password: string; }) => api.post('/user/change-password', passwordData),
    onSuccess: () => {
      toast({ title: "Success", description: "Password updated successfully!" });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value, name === 'confirmPassword' ? formData.newPassword : '') }));
  };

  const isFormValid = useMemo(() => {
    return Object.values(formData).every(v => v) && Object.values(errors).every(e => !e);
  }, [formData, errors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    mutation.mutate({ old_password: formData.currentPassword, new_password: formData.newPassword });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Password & Security</CardTitle></CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Fields with validation */}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!isFormValid || mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

// --- Verification Tab Component ---
function VerificationSettings() {
    // ... Similar validation logic for NIN/BVN
}

// --- Main Settings Page Component ---
export default function FillerSettingsPage() {
  // ... (Main component remains the same, rendering the tabs)
}