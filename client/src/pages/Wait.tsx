import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { motion } from "framer-motion";
import { Mail, RefreshCw, Edit2, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaitPageData {
  reportId: string;
  leadId: string;
  email: string;
  isVerified: boolean;
}

export default function Wait() {
  const { reportId } = useParams<{ reportId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { data, isLoading, error, refetch } = useQuery<WaitPageData>({
    queryKey: ['/api/wait', reportId],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (data?.isVerified) {
      setLocation(`/results/${reportId}`);
    }
  }, [data?.isVerified, reportId, setLocation]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/verification/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: data?.leadId }),
      });
      if (!response.ok) throw new Error("Failed to resend");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link.",
      });
      setResendCooldown(60);
    },
    onError: () => {
      toast({
        title: "Failed to send email",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/verification/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: data?.leadId, newEmail: email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update email");
      }
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Email updated!",
        description: `Verification sent to ${result.email}`,
      });
      setIsEditingEmail(false);
      setNewEmail("");
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateEmail = () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    updateEmailMutation.mutate(newEmail);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Report not found</h1>
          <p className="text-muted-foreground text-sm">This report may have expired or doesn't exist.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-card border border-border p-6 text-center space-y-5">
          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Your Report is Ready!
            </h1>
            <p className="text-muted-foreground text-sm">
              We sent a verification link to:
            </p>
            
            {!isEditingEmail ? (
              <div className="bg-primary/5 p-3">
                <p className="font-medium text-primary text-sm break-all" data-testid="text-email">
                  {data.email}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  className="w-full px-3 py-2.5 border border-border bg-card focus:border-primary focus:outline-none transition-colors text-sm"
                  data-testid="input-new-email"
                />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setNewEmail("");
                    }}
                    className="flex-1"
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={updateEmailMutation.isPending}
                    className="flex-1"
                    data-testid="button-update-email"
                  >
                    {updateEmailMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Click the link in the email to view your personalized BADA report with Saju insights.
          </p>
          
          <div className="space-y-2 pt-4 border-t border-border">
            {!isEditingEmail && (
              <>
                <Button
                  variant="outline"
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending || resendCooldown > 0}
                  className="w-full"
                  data-testid="button-resend"
                >
                  {resendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : "Resend Verification Email"
                  }
                </Button>
                
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center justify-center gap-1 w-full py-2"
                  data-testid="button-wrong-email"
                >
                  <Edit2 className="w-3 h-3" />
                  Wrong email? Click to fix
                </button>
              </>
            )}
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-4"
        >
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
