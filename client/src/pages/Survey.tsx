import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { QUESTIONS, calculateScore } from "@/lib/scoring";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, Calendar, Clock, Mail, Globe, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { REPORT_LANGUAGES, useTranslation, type ReportLanguage } from "@/lib/simple-i18n";
import LanguageDropdown from "@/components/LanguageDropdown";
import { Country, City } from "country-state-city";
import GeneratingScreen from "@/components/GeneratingScreen";
import TimePickerModal from "@/components/TimePickerModal";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BirthPatternData {
  name: string;
  gender: "Male" | "Female" | "Rather not to say" | "";
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  birthCountryCode: string;  // ISO Code for Dropdown
  birthCityName: string;     // Selected City Name
  email: string;
  consent: boolean;
  notificationConsent: boolean;
  reportLanguage: ReportLanguage | "";
}

export default function Survey() {
  const { t, language, setLanguage } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // All Countries Data (Memoized)
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Read giftCode from URL params (from /gift flow)
  const giftCode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("giftCode") || "";
  }, []);

  // Restore progress from sessionStorage on refresh, or start fresh
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = sessionStorage.getItem("bada_survey_step");
    if (savedStep) return parseInt(savedStep, 10);
    const params = new URLSearchParams(window.location.search);
    const start = params.get("start");
    return start ? parseInt(start, 10) : 0;
  });

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    // Restore from sessionStorage first (refresh case)
    const savedAnswers = sessionStorage.getItem("bada_survey_answers");
    if (savedAnswers) {
      try { return JSON.parse(savedAnswers); } catch {}
    }
    // Load first answer from localStorage if available (landing → survey)
    const savedFirst = localStorage.getItem("bada_first_answer");
    if (savedFirst) {
      try {
        const parsed = JSON.parse(savedFirst);
        localStorage.removeItem("bada_first_answer");
        return parsed;
      } catch {
        return {};
      }
    }
    return {};
  });

  const [birthData, setBirthData] = useState<BirthPatternData>({
    name: "",
    gender: "",
    birthDate: "",
    birthTime: "",
    birthTimeUnknown: false,
    birthCountryCode: "",
    birthCityName: "",
    email: "",
    consent: false,
    notificationConsent: true,
    reportLanguage: "",
  });

  // Persist progress to sessionStorage (survives refresh)
  useEffect(() => {
    sessionStorage.setItem("bada_survey_step", String(currentStep));
  }, [currentStep]);

  useEffect(() => {
    sessionStorage.setItem("bada_survey_answers", JSON.stringify(answers));
  }, [answers]);

  // Derived State for Cities based on selected Country
  const availableCities = useMemo(() => {
    if (!birthData.birthCountryCode) return [];
    return City.getCitiesOfCountry(birthData.birthCountryCode) || [];
  }, [birthData.birthCountryCode]);

  const isBirthPatternStep = currentStep === QUESTIONS.length;
  const totalSteps = QUESTIONS.length + 1;

  const question = !isBirthPatternStep ? QUESTIONS[currentStep] : null;

  const isBirthFormValid = birthData.name.trim() && birthData.gender && birthData.birthDate &&
    (birthData.birthTimeUnknown || birthData.birthTime) &&
    birthData.birthCountryCode &&
    birthData.email.trim() && birthData.consent &&
    birthData.reportLanguage;

  const handleOptionSelect = (value: string) => {
    if (question) {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      (document.activeElement as HTMLElement)?.blur();
      setTimeout(() => {
        handleNext();
      }, 400);
    }
  };

  const handleNext = () => {
    // Use functional update with clamp to prevent double-advance from rapid clicks
    // (setTimeout in handleOptionSelect can fire twice if user clicks multiple options)
    setCurrentStep((prev) => Math.min(prev + 1, QUESTIONS.length));
  };

  const handleBirthPatternChange = (field: keyof BirthPatternData, value: any) => {
    setBirthData((prev) => {
      // If country changes, clear city
      if (field === 'birthCountryCode' && value !== prev.birthCountryCode) {
        return { ...prev, [field]: value, birthCityName: "" };
      }
      return { ...prev, [field]: value };
    });

    // Removed auto-open time modal — users tap the time field manually
  };

  const handleTimeSelect = (time: string | null, unknown: boolean) => {
    if (unknown) {
      setBirthData((prev) => ({ ...prev, birthTime: "", birthTimeUnknown: true }));
    } else if (time) {
      setBirthData((prev) => ({ ...prev, birthTime: time, birthTimeUnknown: false }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApiComplete, setIsApiComplete] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const pendingNavRef = useRef<string | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const handleGeneratingFinished = () => {
    if (pendingNavRef.current) {
      setLocation(pendingNavRef.current);
    }
  };

  const handleBirthPatternSubmit = async () => {
    if (!isBirthFormValid) return;

    setIsSubmitting(true);
    setIsApiComplete(false);
    setSubmitError(null);
    pendingNavRef.current = null;

    try {
      const result = calculateScore(answers);

      const genderMap: Record<string, "male" | "female" | "other"> = {
        "Male": "male",
        "Female": "female",
        "Rather not to say": "other",
      };

      // Get Country + City Details for Lat/Lon
      const selectedCountry = allCountries.find(c => c.isoCode === birthData.birthCountryCode);
      const countryName = selectedCountry?.name || "Unknown";
      const selectedCity = birthData.birthCityName
        ? availableCities.find(c => c.name === birthData.birthCityName)
        : null;

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

        // Location Data: City if selected, Country fallback
        birthCity: birthData.birthCityName || countryName,
        birthCountry: countryName,
        latitude: selectedCity ? Number(selectedCity.latitude) : (selectedCountry ? Number(selectedCountry.latitude) : 0),
        longitude: selectedCity ? Number(selectedCity.longitude) : (selectedCountry ? Number(selectedCountry.longitude) : 0),

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

        // Auto-redeem gift code if present
        if (giftCode) {
          try {
            const redeemRes = await fetch("/api/codes/redeem", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: giftCode, reportId: result.reportId }),
            });
            const redeemData = await redeemRes.json();
            if (redeemData.success) {
              console.log("Gift code redeemed successfully:", giftCode);
            } else {
              console.error("Gift code redeem failed:", redeemData.error);
            }
          } catch (redeemErr) {
            console.error("Gift code redeem error:", redeemErr);
          }
        }

        sessionStorage.removeItem("bada_survey_step");
        sessionStorage.removeItem("bada_survey_answers");
        pendingNavRef.current = `/results/${result.reportId}?new=1`;
        setIsApiComplete(true);
      } else {
        // Log full server error for debugging, but don't show to user
        const errorBody = await response.json().catch(() => ({}));
        console.error("Assessment server error:", response.status, errorBody);
        throw new Error("GENERATION_FAILED");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      // Always show generic message — never expose server internals
      setSubmitError("GENERATION_FAILED");
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

      {/* Generating Screen Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <GeneratingScreen
            isComplete={isApiComplete}
            isError={!!submitError}
            errorMessage={submitError || undefined}
            retryCount={retryAttempt}
            language={language}
            onFinished={handleGeneratingFinished}
            onRetry={() => {
              setSubmitError(null);
              setIsApiComplete(false);
              setRetryAttempt(a => a + 1);
              handleBirthPatternSubmit();
            }}
          />
        )}
      </AnimatePresence>

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        onSelect={handleTimeSelect}
        initialTime={birthData.birthTime}
        initialUnknown={birthData.birthTimeUnknown}
        t={t}
      />

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
        <a href="/" className="mix-blend-difference">
          <img src="/logo-badaone.svg" alt="bada.one" className="h-5" />
        </a>
      </header>

      {/* Bottom bar — Exit + Language */}
      <div className="fixed bottom-6 left-6 right-6 z-50 flex items-center justify-between">
        <button
          onClick={() => setLocation("/")}
          className="text-sm text-white/60 hover:text-white/100 transition-colors px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/30"
        >
          {t('survey.exit')}
        </button>
        <LanguageDropdown language={language} setLanguage={setLanguage} variant="footer" />
      </div>

      {/* Depth Indicator */}
      <div className="fixed top-8 right-8 z-50 text-right">
        <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#402525' }}>
          {t('survey.depth')}
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
                <div className="flex items-center gap-2 mb-8">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/20 text-white/40 hover:text-white/80 hover:border-white/40 transition-colors"
                      aria-label={t('survey.back')}
                    >
                      <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                    </button>
                  )}
                  <span className="inline-block text-xs font-mono border border-white/20 text-white/60 px-3 py-1 rounded-full">
                    Q{currentStep + 1}
                  </span>
                </div>

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
                    {t('survey.final')}
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
                      <button
                        type="button"
                        onClick={() => setShowTimeModal(true)}
                        className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-6 text-lg text-left focus:outline-none focus:border-white transition-colors hover:border-white/40"
                      >
                        {birthData.birthTimeUnknown ? (
                          <span className="text-white/50">{t('birth.time_unknown')}</span>
                        ) : birthData.birthTime ? (
                          <span className="text-white font-mono">{(() => {
                            const [h, m] = birthData.birthTime.split(":").map(Number);
                            const period = h >= 12 ? "PM" : "AM";
                            const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                            return `${h12}:${String(m).padStart(2, "0")} ${period}`;
                          })()}</span>
                        ) : (
                          <span className="text-white/30">{t('birth.time.placeholder') || "Select time"}</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-white/80 flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4" /> {t('birth.location')} *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Country Dropdown (Combobox) */}
                      <div className="relative">
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 h-auto text-lg text-white hover:bg-transparent hover:text-white hover:border-white/40 font-normal focus:bg-transparent active:bg-transparent data-[state=open]:border-white"
                            >
                              {birthData.birthCountryCode
                                ? allCountries.find((country) => country.isoCode === birthData.birthCountryCode)?.name
                                : <span className="text-white/50">Select Country</span>}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0 max-h-[300px]" align="start">
                            <Command>
                              <CommandInput placeholder="Search country..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                  {allCountries.map((country) => (
                                    <CommandItem
                                      key={country.isoCode}
                                      value={country.name}
                                      onSelect={(currentValue) => {
                                        const selected = allCountries.find(
                                          (c) => c.name.toLowerCase() === currentValue.toLowerCase()
                                        );
                                        handleBirthPatternChange("birthCountryCode", selected?.isoCode || "");
                                        setOpen(false);
                                      }}
                                    >
                                      {country.name}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          birthData.birthCountryCode === country.isoCode ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* City Dropdown (Combobox) */}
                      <div className="relative">
                        <Popover open={cityOpen} onOpenChange={setCityOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              role="combobox"
                              aria-expanded={cityOpen}
                              disabled={!birthData.birthCountryCode || availableCities.length === 0}
                              className="w-full justify-between bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 h-auto text-lg text-white hover:bg-transparent hover:text-white hover:border-white/40 font-normal focus:bg-transparent active:bg-transparent data-[state=open]:border-white disabled:opacity-30"
                            >
                              {birthData.birthCityName
                                ? birthData.birthCityName
                                : <span className="text-white/50">{availableCities.length === 0 ? "City" : "Select City"}</span>}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0 max-h-[300px]" align="start">
                            <Command>
                              <CommandInput placeholder="Search city..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                  {availableCities.map((city) => (
                                    <CommandItem
                                      key={`${city.name}-${city.latitude}-${city.longitude}`}
                                      value={city.name}
                                      onSelect={(currentValue) => {
                                        handleBirthPatternChange("birthCityName", currentValue);
                                        setCityOpen(false);
                                      }}
                                    >
                                      {city.name}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          birthData.birthCityName === city.name ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

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
                        className={`w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-6 text-xl focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer ${birthData.reportLanguage ? 'text-white' : 'text-white/30'}`}
                      >
                        <option value="" disabled className="bg-[#182339] text-white/50">
                          {t('birth.report_language.placeholder')}
                        </option>
                        {[...REPORT_LANGUAGES]
                          .sort((a, b) => {
                            if (a.code === language) return -1;
                            if (b.code === language) return 1;
                            return 0;
                          })
                          .map((lang) => (
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
                      <span>
                        {t('birth.consent.full').split(/(\{\{terms\}\}|\{\{privacy\}\})/).map((part, i) =>
                          part === '{{terms}}' ? (
                            <a key={i} href="/terms" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>{t('birth.consent.terms')}</a>
                          ) : part === '{{privacy}}' ? (
                            <a key={i} href="/privacy" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>{t('birth.consent.privacy')}</a>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </span>
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

