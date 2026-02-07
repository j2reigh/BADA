import { useLocation } from "wouter";
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
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {/* Brand Gradient Background */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: `linear-gradient(to bottom, #ABBBD5 0%, #879DC6 25%, #233F64 50%, #182339 75%, #402525 100%)`,
        }}
      />

      {/* Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-center items-center z-50">
        <a href="/" className="text-xl font-semibold tracking-tight mix-blend-difference text-white">
          BADA
        </a>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center space-y-6 rounded-2xl">
          <div className="w-16 h-16 bg-white/10 flex items-center justify-center mx-auto rounded-full">
            <AlertCircle className="w-8 h-8 text-white/80" />
          </div>

          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-white">
              {message.title}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed">
              {message.description}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setLocation("/")}
              className="w-full px-6 py-3 bg-white text-[#182339] rounded-full font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
