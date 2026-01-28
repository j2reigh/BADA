import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { QUESTIONS, calculateScore } from "@/lib/scoring";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, MapPin, Calendar, Clock, Mail, User, Loader2, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { REPORT_LANGUAGES, detectUILanguage, getDefaultReportLanguage, useTranslation, type ReportLanguage } from "@/lib/simple-i18n";

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
  reportLanguage: ReportLanguage;
}

export default function Survey() {
  const { t } = useTranslation();

  // Check if coming from landing page with first answer
  const [currentStep, setCurrentStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const start = params.get("start");
    return start ? parseInt(start, 10) : 0;
  });

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    // Load first answer from localStorage if available
    const savedFirst = localStorage.getItem("bada_first_answer");
    if (savedFirst) {
      try {
        const parsed = JSON.parse(savedFirst);
        localStorage.removeItem("bada_first_answer"); // Clean up
        return parsed;
      } catch {
        return {};
      }
    }
    return {};
  });
  const [birthData, setBirthData] = useState<BirthPatternData>(() => {
    const defaultLang = getDefaultReportLanguage(detectUILanguage());
    return {
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
      reportLanguage: defaultLang,
    };
  });
  const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      // Auto-advance to next question after a short delay
      setTimeout(() => {
        handleNext();
      }, 400);
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
        language: birthData.reportLanguage,
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

  // New color palette: #879DC6 (Soft Blue) -> #182339 (Deep Navy)
  // Interpolate based on progress through 9 pages
  const progress = currentStep / QUESTIONS.length;
  const startColor = { r: 135, g: 157, b: 198 }; // #879DC6
  const endColor = { r: 24, g: 35, b: 57 };      // #182339

  const currentBg = {
    r: Math.round(startColor.r + (endColor.r - startColor.r) * progress),
    g: Math.round(startColor.g + (endColor.g - startColor.g) * progress),
    b: Math.round(startColor.b + (endColor.b - startColor.b) * progress),
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000"
         style={{ backgroundColor: `rgb(${currentBg.r}, ${currentBg.g}, ${currentBg.b})` }}>
      
      {/* Dynamic Background Noise/Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10 mix-blend-overlay" 
        style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Background Gradient Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0, ${currentStep * 0.05}) 100%)`
        }}
      />

      <header className="fixed top-0 left-0 right-0 p-6 flex justify-center items-center z-50">
        <a href="/" className="text-xl font-semibold tracking-tight mix-blend-difference text-white">
          BADA
        </a>
      </header>

      {/* Exit button moved to bottom left */}
      <button 
        onClick={() => setLocation("/")} 
        className="fixed bottom-6 left-6 text-sm text-white/60 hover:text-white/100 transition-colors z-50 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/30"
      >
        Exit
      </button>

      {/* Depth Indicator */}
      <div className="fixed top-8 right-8 z-50 text-right">
        <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#402525' }}>
          Current Depth
        </div>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-display"
          style={{ color: '#402525' }}
        >
          {currentStep + 1}/{totalSteps}
        </motion.div>
        <div className="mt-2 h-1 w-32 ml-auto rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(64, 37, 37, 0.2)' }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: '#402525' }}
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / (totalSteps)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <main className="relative z-10 w-full pt-20 pb-12">
        <AnimatePresence mode="wait">
          {!isBirthPatternStep ? (
            <div className="max-w-4xl mx-auto w-full px-6" key={currentStep}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <span className="inline-block text-xs font-mono border border-white/20 text-white/60 px-3 py-1 mb-8 rounded-full">
                  Q{currentStep + 1}
                </span>
                
                <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-16 leading-tight">
                  {t(`survey.q${currentStep + 1}.text`)}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {question?.options.map((option, idx) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      onClick={() => handleOptionSelect(option.value)}
                      className="group text-left p-6 border border-white/10 hover:border-white/40 hover:bg-white/5 transition-all duration-300 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-lg text-white/80 group-hover:text-white transition-colors">
                        {t(`survey.q${currentStep + 1}.${option.value}`)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white/0 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full px-6" key="birthPattern">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-12">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2 block">
                    Final
                  </span>
                  <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
                    {t('birth.title')}
                  </h2>
                  <p className="text-white/60">
                    {t('birth.subtitle')}
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-white/80 block mb-4">{t('birth.name')} *</label>
                    <input
                      type="text"
                      value={birthData.name}
                      onChange={(e) => handleBirthPatternChange("name", e.target.value)}
                      placeholder={t('birth.name.placeholder')}
                      className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-6 text-xl text-white focus:outline-none focus:border-white placeholder:text-white/20 transition-colors"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-white/80 block">{t('birth.gender')} *</label>
                    <div className="flex flex-col space-y-1">
                      {[
                        { value: "Male", label: t('birth.gender.male') },
                        { value: "Female", label: t('birth.gender.female') },
                        { value: "Rather not to say", label: t('birth.gender.other') }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 space-y-0 text-white/70 hover:text-white transition-colors cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={option.value}
                            checked={birthData.gender === option.value}
                            onChange={(e) => handleBirthPatternChange("gender", e.target.value)}
                            className="w-4 h-4 accent-white"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-white/80 flex items-center gap-2 mb-4">
                        <Calendar className="w-4 h-4" /> {t('birth.date')} *
                      </label>
                      <input
                        type="date"
                        value={birthData.birthDate}
                        onChange={(e) => handleBirthPatternChange("birthDate", e.target.value)}
                        min="1900-01-01"
                        max="2025-12-28"
                        className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-6 text-lg text-white focus:outline-none focus:border-white transition-colors dark-calendar-icon"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4" /> {t('birth.time')}
                      </label>
                      <input
                        type="time"
                        value={birthData.birthTime}
                        onChange={(e) => handleBirthPatternChange("birthTime", e.target.value)}
                        disabled={birthData.birthTimeUnknown}
                        className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-6 text-lg text-white focus:outline-none focus:border-white disabled:opacity-30 transition-colors dark-time-icon"
                      />
                      <div className="pt-2">
                        <label className="flex items-start space-x-3 space-y-0 text-white/50 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={birthData.birthTimeUnknown}
                            onChange={(e) => handleBirthPatternChange("birthTimeUnknown", e.target.checked)}
                            className="w-4 h-4 accent-white mt-0.5"
                          />
                          <span>{t('birth.time_unknown')}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-white/80 flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4" /> {t('birth.location')} *
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
                        placeholder={t('birth.location.placeholder')}
                        className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-6 text-xl text-white focus:outline-none focus:border-white placeholder:text-white/20 transition-colors"
                        data-testid="input-birth-city"
                      />
                      {isSearching && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    
                    {birthData.placeOfBirthCity && (
                      <div className="flex items-center gap-2 text-sm text-white/90 bg-white/10 px-3 py-2 mt-2 rounded">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{birthData.placeOfBirthCity.displayName}</span>
                        <span className="text-white/60">({birthData.placeOfBirthCity.utcOffset})</span>
                      </div>
                    )}
                    
                    {placeSearchOpen && cityResults.length > 0 && !birthData.placeOfBirthCity && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-black/80 border border-white/20 shadow-lg z-50 max-h-64 overflow-y-auto backdrop-blur-sm"
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
                            className="w-full text-left px-3 py-2.5 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 text-white/80 hover:text-white"
                            data-testid={`city-result-${result.id}`}
                          >
                            <div className="font-medium text-sm">{result.city}</div>
                            <div className="text-xs text-white/50 flex items-center justify-between">
                              <span>{result.state ? `${result.state}, ${result.country}` : result.country}</span>
                              <span className="text-white/70 font-medium">{result.utcOffset}</span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="text-white/80 flex items-center gap-2 mb-4">
                      <Mail className="w-4 h-4" /> {t('birth.email')} *
                    </label>
                    <input
                      type="email"
                      value={birthData.email}
                      onChange={(e) => handleBirthPatternChange("email", e.target.value)}
                      placeholder={t('birth.email.placeholder')}
                      className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-6 text-xl text-white focus:outline-none focus:border-white placeholder:text-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-white/80 flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4" /> {t('birth.report_language')}
                    </label>
                    <div className="relative">
                      <select
                        value={birthData.reportLanguage}
                        onChange={(e) => handleBirthPatternChange("reportLanguage", e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-6 text-xl text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                      >
                        {REPORT_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code} className="bg-[#182339] text-white">
                            {lang.native} ({lang.name})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      {t('birth.report_language.note')}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <label className="flex items-start gap-3 text-sm cursor-pointer text-white/80">
                      <input
                        type="checkbox"
                        checked={birthData.consent}
                        onChange={(e) => handleBirthPatternChange("consent", e.target.checked)}
                        className="w-4 h-4 accent-white mt-0.5"
                      />
                      <span>{t('birth.consent')} *</span>
                    </label>

                    <label className="flex items-start gap-3 text-sm cursor-pointer text-white/50">
                      <input
                        type="checkbox"
                        checked={birthData.notificationConsent}
                        onChange={(e) => handleBirthPatternChange("notificationConsent", e.target.checked)}
                        className="w-4 h-4 accent-white mt-0.5"
                      />
                      <span>{t('birth.marketing')}</span>
                    </label>
                  </div>

                  <div className="pt-8">
                    <button
                      type="button"
                      onClick={handleBirthPatternSubmit}
                      disabled={!isBirthFormValid || isSubmitting}
                      className="w-full bg-white text-black font-bold text-lg py-5 rounded-full hover:scale-[1.01] hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t('common.loading') : t('survey.submit')} <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Decorative Compass/Grid Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
         <div className="absolute top-1/2 left-0 w-full h-px bg-white" />
         <div className="absolute top-0 left-1/2 h-full w-px bg-white" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] border border-white rounded-full" />
      </div>

    </div>
  );
}
