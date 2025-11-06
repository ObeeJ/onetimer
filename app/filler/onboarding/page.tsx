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
    phone: "",
    age: "",
    gender: "",
    country: "Nigeria",
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

  const validate = (name: string, value: any) => {
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
      case 'phone':
        // Phone is optional, no error
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
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'age', 'gender', 'state', 'education', 'employment', 'income'];
    const allRequiredFilled = requiredFields.every(field => formData[field as keyof typeof formData] !== '');
    const noErrors = Object.values(errors).every(error => error === '');
    return allRequiredFilled && noErrors;
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

      await api.post('/api/auth/register', registrationData);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Age Range</label>
                  <Select value={formData.age} onValueChange={(value) => handleChange('age', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-54">45-54</SelectItem>
                      <SelectItem value="55+">55+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Gender</label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Country</label>
                  <Input placeholder="Nigeria" value="Nigeria" disabled className="bg-slate-100 text-slate-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <Input type="tel" placeholder="Enter phone number" value={formData.phone || ""} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nigerian State</label>
                <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abia">Abia</SelectItem>
                    <SelectItem value="adamawa">Adamawa</SelectItem>
                    <SelectItem value="akwa-ibom">Akwa Ibom</SelectItem>
                    <SelectItem value="anambra">Anambra</SelectItem>
                    <SelectItem value="bauchi">Bauchi</SelectItem>
                    <SelectItem value="bayelsa">Bayelsa</SelectItem>
                    <SelectItem value="benue">Benue</SelectItem>
                    <SelectItem value="borno">Borno</SelectItem>
                    <SelectItem value="cross-river">Cross River</SelectItem>
                    <SelectItem value="delta">Delta</SelectItem>
                    <SelectItem value="ebonyi">Ebonyi</SelectItem>
                    <SelectItem value="edo">Edo</SelectItem>
                    <SelectItem value="ekiti">Ekiti</SelectItem>
                    <SelectItem value="enugu">Enugu</SelectItem>
                    <SelectItem value="gombe">Gombe</SelectItem>
                    <SelectItem value="imo">Imo</SelectItem>
                    <SelectItem value="jigawa">Jigawa</SelectItem>
                    <SelectItem value="kaduna">Kaduna</SelectItem>
                    <SelectItem value="kano">Kano</SelectItem>
                    <SelectItem value="katsina">Katsina</SelectItem>
                    <SelectItem value="kebbi">Kebbi</SelectItem>
                    <SelectItem value="kogi">Kogi</SelectItem>
                    <SelectItem value="kwara">Kwara</SelectItem>
                    <SelectItem value="lagos">Lagos</SelectItem>
                    <SelectItem value="nasarawa">Nasarawa</SelectItem>
                    <SelectItem value="niger">Niger</SelectItem>
                    <SelectItem value="ogun">Ogun</SelectItem>
                    <SelectItem value="ondo">Ondo</SelectItem>
                    <SelectItem value="osun">Osun</SelectItem>
                    <SelectItem value="oyo">Oyo</SelectItem>
                    <SelectItem value="plateau">Plateau</SelectItem>
                    <SelectItem value="rivers">Rivers</SelectItem>
                    <SelectItem value="sokoto">Sokoto</SelectItem>
                    <SelectItem value="taraba">Taraba</SelectItem>
                    <SelectItem value="yobe">Yobe</SelectItem>
                    <SelectItem value="zamfara">Zamfara</SelectItem>
                    <SelectItem value="fct">FCT (Abuja)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Education Level</label>
                  <Select value={formData.education} onValueChange={(value) => handleChange('education', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Employment Status</label>
                  <Select value={formData.employment} onValueChange={(value) => handleChange('employment', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Monthly Income Range (NGN)</label>
                <Select value={formData.income} onValueChange={(value) => handleChange('income', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50k">Under ₦50,000</SelectItem>
                    <SelectItem value="50k-100k">₦50,000 - ₦100,000</SelectItem>
                    <SelectItem value="100k-250k">₦100,000 - ₦250,000</SelectItem>
                    <SelectItem value="250k-500k">₦250,000 - ₦500,000</SelectItem>
                    <SelectItem value="500k-1m">₦500,000 - ₦1,000,000</SelectItem>
                    <SelectItem value="1m+">₦1,000,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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