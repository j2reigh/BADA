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
      <div className="min-h-screen depth-gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-white/60 text-sm">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen depth-gradient-bg flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
          <h1 className="text-xl font-semibold text-white">Report not found</h1>
          <p className="text-white/60 text-sm">This report may have expired or doesn't exist.</p>
          <button 
            onClick={() => setLocation("/")} 
            className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
            data-testid="button-go-home"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen depth-gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Noise/Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10 mix-blend-overlay" 
        style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Decorative Compass/Grid Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
         <div className="absolute top-1/2 left-0 w-full h-px bg-white" />
         <div className="absolute top-0 left-1/2 h-full w-px bg-white" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] border border-white rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-center items-center z-50">
        <a href="/" className="text-xl font-semibold tracking-tight mix-blend-difference text-white">
          BADA
        </a>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10 pt-20"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center space-y-6 rounded-2xl">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto rounded-full"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-white">
              Your Report is Ready!
            </h1>
            <p className="text-white/70 text-sm">
              We sent a verification link to:
            </p>
            
            {!isEditingEmail ? (
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                <p className="font-medium text-white text-sm break-all" data-testid="text-email">
                  {data.email}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-white focus:outline-none transition-colors text-sm"
                  data-testid="input-new-email"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsEditingEmail(false);
                      setNewEmail("");
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white/80 rounded-lg hover:bg-white/20 transition-colors text-sm"
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateEmail}
                    disabled={updateEmailMutation.isPending}
                    className="flex-1 px-4 py-3 bg-white text-black rounded-lg font-semibold hover:scale-105 transition-transform text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    data-testid="button-update-email"
                  >
                    {updateEmailMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-white/60">
            Click the link in the email to view your personalized BADA report with Saju insights.
          </p>
          
          <div className="space-y-3 pt-4 border-t border-white/20">
            {!isEditingEmail && (
              <>
                <button
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending || resendCooldown > 0}
                  className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white/90 rounded-lg hover:bg-white/20 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="button-resend"
                >
                  {resendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : "Resend Verification Email"
                  }
                </button>
                
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-1 w-full py-2"
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
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-white/40">
            Didn't receive the email? Check your spam folder.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
