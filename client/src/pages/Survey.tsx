import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QUESTIONS, calculateScore } from "@/lib/scoring";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, MapPin, Calendar, Clock, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubmitSurvey } from "@/hooks/use-survey";
import { useToast } from "@/hooks/use-toast";

interface BirthPatternData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  placeOfBirth: string;
  email: string;
  consent: boolean;
  notificationConsent: boolean;
}

// Curated list of major world cities for birth location search
const WORLD_CITIES = [
  { name: "New York", country: "United States" },
  { name: "Los Angeles", country: "United States" },
  { name: "Chicago", country: "United States" },
  { name: "Houston", country: "United States" },
  { name: "Phoenix", country: "United States" },
  { name: "Philadelphia", country: "United States" },
  { name: "San Antonio", country: "United States" },
  { name: "San Diego", country: "United States" },
  { name: "Dallas", country: "United States" },
  { name: "San Jose", country: "United States" },
  { name: "London", country: "United Kingdom" },
  { name: "Manchester", country: "United Kingdom" },
  { name: "Birmingham", country: "United Kingdom" },
  { name: "Leeds", country: "United Kingdom" },
  { name: "Glasgow", country: "United Kingdom" },
  { name: "Paris", country: "France" },
  { name: "Lyon", country: "France" },
  { name: "Marseille", country: "France" },
  { name: "Toulouse", country: "France" },
  { name: "Nice", country: "France" },
  { name: "Berlin", country: "Germany" },
  { name: "Munich", country: "Germany" },
  { name: "Cologne", country: "Germany" },
  { name: "Frankfurt", country: "Germany" },
  { name: "Hamburg", country: "Germany" },
  { name: "Madrid", country: "Spain" },
  { name: "Barcelona", country: "Spain" },
  { name: "Valencia", country: "Spain" },
  { name: "Seville", country: "Spain" },
  { name: "Rome", country: "Italy" },
  { name: "Milan", country: "Italy" },
  { name: "Naples", country: "Italy" },
  { name: "Turin", country: "Italy" },
  { name: "Amsterdam", country: "Netherlands" },
  { name: "Rotterdam", country: "Netherlands" },
  { name: "The Hague", country: "Netherlands" },
  { name: "Brussels", country: "Belgium" },
  { name: "Antwerp", country: "Belgium" },
  { name: "Vienna", country: "Austria" },
  { name: "Graz", country: "Austria" },
  { name: "Prague", country: "Czech Republic" },
  { name: "Brno", country: "Czech Republic" },
  { name: "Warsaw", country: "Poland" },
  { name: "Kraków", country: "Poland" },
  { name: "Budapest", country: "Hungary" },
  { name: "Athens", country: "Greece" },
  { name: "Lisbon", country: "Portugal" },
  { name: "Porto", country: "Portugal" },
  { name: "Dublin", country: "Ireland" },
  { name: "Bucharest", country: "Romania" },
  { name: "Sofia", country: "Bulgaria" },
  { name: "Moscow", country: "Russia" },
  { name: "Saint Petersburg", country: "Russia" },
  { name: "Tokyo", country: "Japan" },
  { name: "Osaka", country: "Japan" },
  { name: "Kyoto", country: "Japan" },
  { name: "Yokohama", country: "Japan" },
  { name: "Bangkok", country: "Thailand" },
  { name: "Hong Kong", country: "China" },
  { name: "Shanghai", country: "China" },
  { name: "Beijing", country: "China" },
  { name: "Shenzhen", country: "China" },
  { name: "Mumbai", country: "India" },
  { name: "Delhi", country: "India" },
  { name: "Bangalore", country: "India" },
  { name: "Hyderabad", country: "India" },
  { name: "Dubai", country: "United Arab Emirates" },
  { name: "Abu Dhabi", country: "United Arab Emirates" },
  { name: "Sydney", country: "Australia" },
  { name: "Melbourne", country: "Australia" },
  { name: "Brisbane", country: "Australia" },
  { name: "Perth", country: "Australia" },
  { name: "Toronto", country: "Canada" },
  { name: "Vancouver", country: "Canada" },
  { name: "Montreal", country: "Canada" },
  { name: "Calgary", country: "Canada" },
  { name: "Mexico City", country: "Mexico" },
  { name: "Guadalajara", country: "Mexico" },
  { name: "Monterrey", country: "Mexico" },
  { name: "São Paulo", country: "Brazil" },
  { name: "Rio de Janeiro", country: "Brazil" },
  { name: "Salvador", country: "Brazil" },
  { name: "Brasília", country: "Brazil" },
  { name: "Buenos Aires", country: "Argentina" },
  { name: "Córdoba", country: "Argentina" },
  { name: "Lima", country: "Peru" },
  { name: "Santiago", country: "Chile" },
  { name: "Bogotá", country: "Colombia" },
  { name: "Johannesburg", country: "South Africa" },
  { name: "Cape Town", country: "South Africa" },
  { name: "Cairo", country: "Egypt" },
  { name: "Istanbul", country: "Turkey" },
  { name: "Ankara", country: "Turkey" },
  { name: "Tel Aviv", country: "Israel" },
  { name: "Jerusalem", country: "Israel" },
  { name: "Tehran", country: "Iran" },
  { name: "Singapore", country: "Singapore" },
  { name: "Kuala Lumpur", country: "Malaysia" },
  { name: "Manila", country: "Philippines" },
  { name: "Jakarta", country: "Indonesia" },
  { name: "Seoul", country: "South Korea" },
  { name: "Bangkok", country: "Thailand" },
];

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [birthData, setBirthData] = useState<BirthPatternData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthTimeUnknown: true,
    placeOfBirth: "",
    email: "",
    consent: false,
    notificationConsent: true,
  });
  const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitMutation = useSubmitSurvey();
  
  // Filter cities by search term
  const filteredCities = useMemo(() => {
    if (birthData.placeOfBirth.trim().length < 1) return [];
    
    const searchTerm = birthData.placeOfBirth.toLowerCase();
    const results: { city: string; country: string; display: string }[] = [];
    
    for (const cityData of WORLD_CITIES) {
      const display = `${cityData.name}, ${cityData.country}`;
      if (display.toLowerCase().includes(searchTerm)) {
        results.push({
          city: cityData.name,
          country: cityData.country,
          display
        });
      }
      
      if (results.length >= 10) break;
    }
    
    return results;
  }, [birthData.placeOfBirth]);
  
  const isBirthPatternStep = currentStep === QUESTIONS.length;
  const totalSteps = QUESTIONS.length + 1;

  const question = !isBirthPatternStep ? QUESTIONS[currentStep] : null;
  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  const currentAnswer = question ? answers[question.id] : null;
  
  const isBirthFormValid = birthData.name.trim() && birthData.birthDate && 
    (birthData.birthTimeUnknown || birthData.birthTime) && birthData.placeOfBirth && 
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
          birthDate: birthData.birthDate,
          birthTime: birthData.birthTimeUnknown ? "Unknown" : birthData.birthTime,
          placeOfBirth: birthData.placeOfBirth,
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
                  <input
                    type="text"
                    value={birthData.placeOfBirth}
                    onChange={(e) => {
                      handleBirthPatternChange("placeOfBirth", e.target.value);
                      setPlaceSearchOpen(true);
                    }}
                    onFocus={() => setPlaceSearchOpen(true)}
                    onBlur={() => setTimeout(() => setPlaceSearchOpen(false), 200)}
                    placeholder="Search for your birth city (e.g., New York, London, Tokyo)"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-primary focus:outline-none transition-colors"
                  />
                  
                  {/* City Search Results */}
                  {placeSearchOpen && filteredCities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-primary/20 shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {filteredCities.map((result, idx) => (
                        <button
                          key={`${result.city}-${result.country}-${idx}`}
                          type="button"
                          onClick={() => {
                            handleBirthPatternChange("placeOfBirth", result.display);
                            setPlaceSearchOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 text-foreground hover:text-primary"
                        >
                          <div className="font-medium">{result.city}</div>
                          <div className="text-xs text-muted-foreground">{result.country}</div>
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
