"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/providers/auth-provider"
import { api } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { AlertCircle, CheckCircle } from "lucide-react"

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const color = ['', 'red', 'orange', 'yellow', 'lime', 'green'][strength];
  const width = `${(strength / 5) * 100}%`;

  return (
    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
      <div className="h-1.5 rounded-full transition-all" style={{ width, backgroundColor: color }}></div>
    </div>
  );
};

export default function FillerOnboardingPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    country: "",
    state: "",
    education: "",
    employment: "",
    income: "",
    interests: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const validate = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value.length < 2) error = 'Must be at least 2 characters long.';
        break;
      case 'email':
        if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email address.';
        break;
      case 'password':
        if (value.length < 8) error = 'Must be at least 8 characters long.';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) error = 'Must include uppercase, lowercase, and a number.';
        break;
      default:
        if (!value) error = 'This field is required.';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    const newInterests = checked 
      ? [...formData.interests, interest]
      : formData.interests.filter(i => i !== interest);
    setFormData(prev => ({ ...prev, interests: newInterests }));
  };

  const isFormValid = useMemo(() => {
    return Object.values(formData).every(value => {
        if (Array.isArray(value)) return true; // Assuming interests are optional
        return value !== '';
    }) && Object.values(errors).every(error => error === '');
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        toast({ title: "Invalid Form", description: "Please correct the errors before submitting.", variant: "destructive" });
        return;
    }
    setIsLoading(true);

    try {
      const registrationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: "filler",
        profile: {
          age_range: formData.age,
          gender: formData.gender,
          country: formData.country,
          state: formData.state,
          education: formData.education,
          employment: formData.employment,
          income_range: formData.income,
          interests: formData.interests,
        },
      };

      await api.post('/api/v1/auth/register', registrationData);
      await signIn(formData.email, formData.password);
      
      toast({ title: "Success", description: "Account created successfully!", variant: "success" });
      router.push("/filler");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-2xl py-8">
        <div className="text-center mb-8">
          <Image src="/Logo.png" alt="Onetime Survey" width={192} height={48} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your Filler Account</h1>
          <p className="text-slate-600">Complete your profile to get matched with relevant surveys.</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... Form fields with validation ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">First name</label>
                  <Input placeholder="Enter first name" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
                  {errors.firstName && <p className="text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1"/>{errors.firstName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Last name</label>
                  <Input placeholder="Enter last name" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
                  {errors.lastName && <p className="text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1"/>{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                {errors.email && <p className="text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1"/>{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Input type="password" placeholder="Create password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required />
                <PasswordStrengthIndicator password={formData.password} />
                {errors.password && <p className="text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1"/>{errors.password}</p>}
              </div>

              {/* ... Other fields with validation ... */}

              <Button type="submit" variant="filler" className="w-full h-12 text-base font-semibold" disabled={!isFormValid || isLoading}>
                {isLoading ? "Creating account..." : "Complete Setup & View Surveys"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}