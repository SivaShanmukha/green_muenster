import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, MapPin, History, TrendingDown, Award, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface OnboardingTutorialProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingTutorial = ({ open, onClose }: OnboardingTutorialProps) => {
  const [step, setStep] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const { user } = useAuth();

  const steps = [
    {
      icon: MapPin,
      title: "Smart Route Planning",
      description: "Plan your routes and view CO₂ emissions for each transport mode. Choose the most sustainable option that fits your needs.",
    },
    {
      icon: TrendingDown,
      title: "Track CO₂ Emissions",
      description: "See how much CO₂ you've saved compared to driving. Every sustainable choice makes a difference!",
    },
    {
      icon: Cloud,
      title: "Weather-Based Recommendations",
      description: "Get real-time travel advice based on current weather. We'll suggest wearing a weatherproof jacket for cycling or using public transport in severe conditions.",
    },
    {
      icon: History,
      title: "Travel History",
      description: "All your past routes are automatically saved in your profile. Track your eco-friendly journey over time.",
    },
    {
      icon: Award,
      title: "Earn Badges & Compete",
      description: "Complete challenges, earn badges, and climb the leaderboard. Make sustainable travel fun and rewarding!",
    },
    {
      icon: Shield,
      title: "Share Your Stats",
      description: "To participate in leaderboards and challenges, we need your permission to share your statistics (CO₂ saved, vehicle type used, and username) with other users. Your actual travel routes and locations are never shared.",
      isConsent: true,
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const saveConsent = async (consent: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ share_stats_consent: consent })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving consent:", error);
      toast.error("Failed to save your preference");
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      // If we're on the consent step, save the consent
      if (steps[step].isConsent) {
        await saveConsent(consentGiven);
      }
      setStep(step + 1);
    } else {
      // Save consent on final step if it's the consent step
      if (steps[step].isConsent) {
        await saveConsent(consentGiven);
      }
      onClose();
    }
  };

  const handleSkip = async () => {
    // If user skips, default to no consent
    if (user) {
      await saveConsent(false);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        {currentStep.isConsent && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-input"
                />
                <label htmlFor="consent" className="text-sm text-foreground cursor-pointer">
                  I agree to share my statistics (CO₂ emissions saved, vehicle types used, and username) with other users for leaderboards and community features.
                </label>
              </div>
              <div className="text-xs text-muted-foreground pl-7">
                <strong>Privacy Note:</strong> We never share your actual travel routes, locations, or personal navigation data. Only aggregated statistics are visible to other users.
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleNext}>
            {step < steps.length - 1 ? "Next" : "Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTutorial;
