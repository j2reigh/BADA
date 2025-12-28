import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QUESTIONS, calculateScore } from "@/lib/scoring";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubmitSurvey } from "@/hooks/use-survey";
import { useToast } from "@/hooks/use-toast";

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitMutation = useSubmitSurvey();

  const question = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  const currentAnswer = answers[question.id];

  const handleOptionSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = calculateScore(answers);
      
      // Save to database
      await submitMutation.mutateAsync({
        answers,
        threatScore: result.threatScore,
        threatClarity: result.threatClarity,
        environmentScore: result.environmentScore,
        environmentStable: result.environmentStable,
        agencyScore: result.agencyScore,
        agencyActive: result.agencyActive,
        typeKey: result.typeKey,
        typeName: result.typeName,
      });

      // Pass results in state via history state or URL params isn't ideal for large objects, 
      // but wouter doesn't support state object passing easily.
      // We will encode the results in the URL or use local storage. 
      // For simplicity and robustness, let's use localStorage for the transient result display.
      localStorage.setItem("surveyResult", JSON.stringify(result));
      setLocation("/results");
    } catch (error) {
      toast({
        title: "Error submitting survey",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
      
      <div className="w-full max-w-2xl z-10">
        <div className="mb-12">
          <ProgressBar current={currentStep + 1} total={QUESTIONS.length} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-sm font-bold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                {question.section}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {question.text}
              </h2>
            </div>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={cn(
                    "w-full p-6 rounded-2xl text-left border-2 transition-all duration-200 group relative overflow-hidden",
                    currentAnswer === option.value
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-transparent bg-white hover:border-primary/30 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className={cn(
                      "text-lg font-medium transition-colors",
                      currentAnswer === option.value ? "text-primary" : "text-foreground"
                    )}>
                      {option.label}
                    </span>
                    {currentAnswer === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-primary text-white rounded-full p-1"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-12">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn("text-muted-foreground", currentStep === 0 && "opacity-0")}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={!currentAnswer || submitMutation.isPending}
            className="px-10 rounded-full"
          >
            {submitMutation.isPending ? "Submitting..." : isLastQuestion ? "Submit Results" : "Next Question"}
            {!isLastQuestion && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
