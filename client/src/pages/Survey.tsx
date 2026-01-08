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
    birthTimeUnknown: true,
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

  // Debounced city search using Photon API
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

  // Debounce effect for city search
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
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
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

  const handleBirthPatternSubmit = async () => {
    try {
      const result = calculateScore(answers);
      
      // Console log all collected data
      const allData = {
        surveyAnswers: answers,
        calculatedType: {
          typeKey: result.typeKey,
          typeName: result.typeName,
          threatClarity: result.threatClarity,
          environmentStable: result.environmentStable,
          agencyActive: result.agencyActive,
          threatScore: result.threatScore,
          environmentScore: result.environmentScore,
          agencyScore: result.agencyScore,
        },
        birthPatternData: {
          name: birthData.name,
          gender: birthData.gender,
          birthDate: birthData.birthDate,
          birthTime: birthData.birthTimeUnknown ? "Unknown" : birthData.birthTime,
          placeOfBirth: birthData.placeOfBirthCity?.displayName || birthData.placeOfBirth,
          city: birthData.placeOfBirthCity?.city,
          country: birthData.placeOfBirthCity?.country,
          lat: birthData.placeOfBirthCity?.lat,
          lon: birthData.placeOfBirthCity?.lon,
          timezone: birthData.placeOfBirthCity?.timezone,
          utcOffset: birthData.placeOfBirthCity?.utcOffset,
          email: birthData.email,
          consent: birthData.consent,
          notificationConsent: birthData.notificationConsent,
        },
      };
      
      console.log("BADA Survey Submission:", allData);
      
      // Save to database (optional, in background)
      try {
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
      } catch (dbError) {
        console.error("Database save failed, but continuing:", dbError);
      }

      // Redirect to coming soon page
      setLocation("/coming-soon");
    } catch (error) {
      console.error("Error submitting birth pattern:", error);
      toast({
        title: "Error submitting information",
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
          <ProgressBar current={currentStep + 1} total={totalSteps} />
        </div>

        <AnimatePresence mode="wait">
          {!isBirthPatternStep ? (
            // Survey Questions
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
                  {question?.section}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {question?.text}
                </h2>
              </div>

              <div className="space-y-3">
                {question?.options.map((option) => (
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
          ) : (
            // Birth Pattern Form
            <motion.div
              key="birthPattern"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-sm font-bold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                  Birth Information
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Complete Your Birth Pattern
                </h2>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    What do you want to be called? *
                  </label>
                  <input
                    type="text"
                    value={birthData.name}
                    onChange={(e) => handleBirthPatternChange("name", e.target.value)}
                    placeholder="Enter your name or preferred name"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground block">
                    Gender *
                  </label>
                  <div className="space-y-2">
                    {["Male", "Female", "Rather not to say"].map((option) => (
                      <label key={option} className="flex items-center gap-3 text-sm cursor-pointer p-3 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
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

                {/* Birth Date */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    value={birthData.birthDate}
                    onChange={(e) => handleBirthPatternChange("birthDate", e.target.value)}
                    min="1900-01-01"
                    max="2025-12-28"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Birth Time */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Birth Time
                  </label>
                  <div className="space-y-3">
                    <input
                      type="time"
                      value={birthData.birthTime}
                      onChange={(e) => handleBirthPatternChange("birthTime", e.target.value)}
                      disabled={birthData.birthTimeUnknown}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:bg-gray-100"
                    />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={birthData.birthTimeUnknown}
                        onChange={(e) => handleBirthPatternChange("birthTimeUnknown", e.target.checked)}
                        className="w-4 h-4 rounded border-primary accent-primary"
                      />
                      I don't know my birth time
                    </label>
                  </div>
                </div>

                {/* Place of Birth */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
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
                      placeholder="Search for your birth city (e.g., Incheon, New York)"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-primary focus:outline-none transition-colors"
                      data-testid="input-birth-city"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  
                  {/* Selected City Display */}
                  {birthData.placeOfBirthCity && (
                    <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{birthData.placeOfBirthCity.displayName}</span>
                      <span className="text-muted-foreground">({birthData.placeOfBirthCity.utcOffset})</span>
                    </div>
                  )}
                  
                  {/* City Search Results */}
                  {placeSearchOpen && cityResults.length > 0 && !birthData.placeOfBirthCity && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-primary/20 shadow-lg z-50 max-h-64 overflow-y-auto"
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
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 text-foreground hover:text-primary"
                          data-testid={`city-result-${result.id}`}
                        >
                          <div className="font-medium">{result.city}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>{result.state ? `${result.state}, ${result.country}` : result.country}</span>
                            <span className="text-primary font-medium">{result.utcOffset}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={birthData.email}
                    onChange={(e) => handleBirthPatternChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Consent */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={birthData.consent}
                      onChange={(e) => handleBirthPatternChange("consent", e.target.checked)}
                      className="w-4 h-4 rounded border-primary accent-primary mt-0.5"
                    />
                    <span className="text-foreground">I agree to the terms and conditions and consent to process my information *</span>
                  </label>
                  
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={birthData.notificationConsent}
                      onChange={(e) => handleBirthPatternChange("notificationConsent", e.target.checked)}
                      className="w-4 h-4 rounded border-primary accent-primary mt-0.5"
                    />
                    <span className="text-muted-foreground">I would like to receive updates and insights about my BADA type</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
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
            disabled={isBirthPatternStep ? !isBirthFormValid : !currentAnswer}
            className="px-10 rounded-full"
          >
            {submitMutation.isPending ? "Submitting..." : isBirthPatternStep ? "Complete Assessment" : isLastQuestion ? "Next Step" : "Next Question"}
            {!isBirthPatternStep && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
