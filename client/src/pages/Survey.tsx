import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QUESTIONS, calculateScore } from "@/lib/scoring";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, MapPin, Calendar, Clock, Mail, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubmitSurvey } from "@/hooks/use-survey";
import { useToast } from "@/hooks/use-toast";

interface CityResult {
  id: string;
  name: string;
  displayName: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
  utcOffset: string;
}

interface BirthPatternData {
  name: string;
  gender: "Male" | "Female" | "Rather not to say" | "";
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  placeOfBirth: string;
  placeOfBirthCity: CityResult | null;
  email: string;
  consent: boolean;
  notificationConsent: boolean;
}

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [birthData, setBirthData] = useState<BirthPatternData>({
    name: "",
    gender: "",
    birthDate: "",
    birthTime: "",
    birthTimeUnknown: false,
    placeOfBirth: "",
    placeOfBirthCity: null,
    email: "",
    consent: false,
    notificationConsent: true,
  });
  const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitMutation = useSubmitSurvey();

  const searchCities = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setCityResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setCityResults(results);
      }
    } catch (error) {
      console.error("City search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (birthData.placeOfBirth && !birthData.placeOfBirthCity) {
        searchCities(birthData.placeOfBirth);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [birthData.placeOfBirth, birthData.placeOfBirthCity, searchCities]);
  
  const isBirthPatternStep = currentStep === QUESTIONS.length;
  const totalSteps = QUESTIONS.length + 1;

  const question = !isBirthPatternStep ? QUESTIONS[currentStep] : null;
  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  const currentAnswer = question ? answers[question.id] : null;
  
  const isBirthFormValid = birthData.name.trim() && birthData.gender && birthData.birthDate && 
    (birthData.birthTimeUnknown || birthData.birthTime) && birthData.placeOfBirthCity && 
    birthData.email.trim() && birthData.consent;

  const handleOptionSelect = (value: string) => {
    if (question) {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleBirthPatternSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleBirthPatternChange = (field: keyof BirthPatternData, value: any) => {
    setBirthData((prev) => ({ ...prev, [field]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBirthPatternSubmit = async () => {
    if (!birthData.placeOfBirthCity) return;
    
    setIsSubmitting(true);
    try {
      const result = calculateScore(answers);
      
      const genderMap: Record<string, "male" | "female" | "other"> = {
        "Male": "male",
        "Female": "female",
        "Rather not to say": "other",
      };
      
      const assessmentPayload = {
        answers,
        surveyScores: {
          threatScore: result.threatScore,
          threatClarity: result.threatClarity,
          environmentScore: result.environmentScore,
          environmentStable: result.environmentStable,
          agencyScore: result.agencyScore,
          agencyActive: result.agencyActive,
          typeKey: result.typeKey,
          typeName: result.typeName,
        },
        name: birthData.name,
        gender: genderMap[birthData.gender] || "other",
        email: birthData.email,
        marketingConsent: birthData.notificationConsent,
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTimeUnknown ? undefined : birthData.birthTime,
        birthTimeUnknown: birthData.birthTimeUnknown,
        birthCity: birthData.placeOfBirthCity.city,
        birthCountry: birthData.placeOfBirthCity.country,
        timezone: birthData.placeOfBirthCity.timezone,
        utcOffset: birthData.placeOfBirthCity.utcOffset,
        latitude: birthData.placeOfBirthCity.lat,
        longitude: birthData.placeOfBirthCity.lon,
      };

      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Assessment submitted:", result);
        setLocation(`/wait/${result.reportId}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error submitting information",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="w-full max-w-2xl z-10">
        <div className="mb-10">
          <ProgressBar current={currentStep + 1} total={totalSteps} />
        </div>

        <AnimatePresence mode="wait">
          {!isBirthPatternStep ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-wider text-accent uppercase">
                  {question?.section}
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                  {question?.text}
                </h2>
              </div>

              <div className="space-y-2">
                {question?.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={cn(
                      "w-full p-4 text-left border transition-all duration-150 group",
                      currentAnswer === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-base transition-colors",
                        currentAnswer === option.value ? "text-primary font-medium" : "text-foreground"
                      )}>
                        {option.label}
                      </span>
                      {currentAnswer === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-primary"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="birthPattern"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-wider text-accent uppercase">
                  Birth Information
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                  Complete Your Birth Pattern
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    What do you want to be called? *
                  </label>
                  <input
                    type="text"
                    value={birthData.name}
                    onChange={(e) => handleBirthPatternChange("name", e.target.value)}
                    placeholder="Enter your name or preferred name"
                    className="w-full px-3 py-2.5 border border-border bg-card focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Gender *
                  </label>
                  <div className="space-y-1.5">
                    {["Male", "Female", "Rather not to say"].map((option) => (
                      <label key={option} className="flex items-center gap-3 text-sm cursor-pointer p-2.5 border border-border hover:border-primary/40 transition-colors">
                        <input
                          type="radio"
                          name="gender"
                          value={option}
                          checked={birthData.gender === option}
                          onChange={(e) => handleBirthPatternChange("gender", e.target.value)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    value={birthData.birthDate}
                    onChange={(e) => handleBirthPatternChange("birthDate", e.target.value)}
                    min="1900-01-01"
                    max="2025-12-28"
                    className="w-full px-3 py-2.5 border border-border bg-card focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    Birth Time
                  </label>
                  <div className="space-y-2">
                    <input
                      type="time"
                      value={birthData.birthTime}
                      onChange={(e) => handleBirthPatternChange("birthTime", e.target.value)}
                      disabled={birthData.birthTimeUnknown}
                      className="w-full px-3 py-2.5 border border-border bg-card focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:bg-muted"
                    />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={birthData.birthTimeUnknown}
                        onChange={(e) => handleBirthPatternChange("birthTimeUnknown", e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      I don't know my birth time
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Place of Birth (City) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={birthData.placeOfBirth}
                      onChange={(e) => {
                        handleBirthPatternChange("placeOfBirth", e.target.value);
                        handleBirthPatternChange("placeOfBirthCity", null);
                        setPlaceSearchOpen(true);
                      }}
                      onFocus={() => setPlaceSearchOpen(true)}
                      onBlur={() => setTimeout(() => setPlaceSearchOpen(false), 200)}
                      placeholder="Search for your birth city"
                      className="w-full px-3 py-2.5 border border-border bg-card focus:border-primary focus:outline-none transition-colors"
                      data-testid="input-birth-city"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  
                  {birthData.placeOfBirthCity && (
                    <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{birthData.placeOfBirthCity.displayName}</span>
                      <span className="text-muted-foreground">({birthData.placeOfBirthCity.utcOffset})</span>
                    </div>
                  )}
                  
                  {placeSearchOpen && cityResults.length > 0 && !birthData.placeOfBirthCity && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {cityResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => {
                            handleBirthPatternChange("placeOfBirth", result.displayName);
                            handleBirthPatternChange("placeOfBirthCity", result);
                            setPlaceSearchOpen(false);
                            setCityResults([]);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-primary/5 transition-colors border-b border-border last:border-b-0 text-foreground hover:text-primary"
                          data-testid={`city-result-${result.id}`}
                        >
                          <div className="font-medium text-sm">{result.city}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>{result.state ? `${result.state}, ${result.country}` : result.country}</span>
                            <span className="text-accent font-medium">{result.utcOffset}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={birthData.email}
                    onChange={(e) => handleBirthPatternChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 border border-border bg-card focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={birthData.consent}
                      onChange={(e) => handleBirthPatternChange("consent", e.target.checked)}
                      className="w-4 h-4 accent-primary mt-0.5"
                    />
                    <span className="text-foreground">I agree to the terms and conditions and consent to process my information *</span>
                  </label>
                  
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={birthData.notificationConsent}
                      onChange={(e) => handleBirthPatternChange("notificationConsent", e.target.checked)}
                      className="w-4 h-4 accent-primary mt-0.5"
                    />
                    <span className="text-muted-foreground">I would like to receive updates and insights about my BADA type</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mt-10">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn("text-muted-foreground", currentStep === 0 && "opacity-0")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={isBirthPatternStep ? (!isBirthFormValid || isSubmitting) : !currentAnswer}
            data-testid="button-next"
          >
            {isSubmitting ? "Submitting..." : isBirthPatternStep ? "Complete Assessment" : isLastQuestion ? "Next Step" : "Next"}
            {!isBirthPatternStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
