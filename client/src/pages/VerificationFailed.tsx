import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { motion } from "framer-motion";
import { AlertCircle, Home } from "lucide-react";

export default function VerificationFailed() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const reason = params.get("reason") || "unknown";

  const reasonMessages: Record<string, { title: string; description: string }> = {
    invalid: {
      title: "Invalid Verification Link",
      description: "The verification link appears to be invalid. Please request a new verification email.",
    },
    expired: {
      title: "Link Expired",
      description: "This verification link has expired. Please request a new verification email.",
    },
    no_results: {
      title: "No Results Found",
      description: "We couldn't find any assessment results associated with this verification. Please complete the assessment again.",
    },
    error: {
      title: "Something Went Wrong",
      description: "An error occurred during verification. Please try again or contact support.",
    },
    unknown: {
      title: "Verification Failed",
      description: "We couldn't verify your email. Please try again or request a new verification link.",
    },
  };

  const message = reasonMessages[reason] || reasonMessages.unknown;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              {message.title}
            </h1>
            <p className="text-muted-foreground">
              {message.description}
            </p>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={() => setLocation("/")}
              className="w-full rounded-full"
              data-testid="button-go-home"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
