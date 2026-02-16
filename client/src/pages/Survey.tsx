import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { QUESTIONS, calculateScore } from "@/lib/scoring";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, Calendar, Clock, Mail, Globe, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { REPORT_LANGUAGES, detectUILanguage, getDefaultReportLanguage, useTranslation, type ReportLanguage } from "@/lib/simple-i18n";
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
  birthTimezone: string;     // Selected Timezone
  email: string;
  consent: boolean;
  notificationConsent: boolean;
  reportLanguage: ReportLanguage;
}

export default function Survey() {
  const { t, language } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // All Countries Data (Memoized)
  const allCountries = useMemo(() => Country.getAllCountries(), []);

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
    const defaultLang = getDefaultReportLanguage(language);
    return {
      name: "",
      gender: "",
      birthDate: "",
      birthTime: "",
      birthTimeUnknown: false,
      birthCountryCode: "",
      birthCityName: "",
      birthTimezone: "",
      email: "",
      consent: false,
      notificationConsent: true,
      reportLanguage: defaultLang,
    };
  });

  // Derived State for Cities based on selected Country
  const availableCities = useMemo(() => {
    if (!birthData.birthCountryCode) return [];
    return City.getCitiesOfCountry(birthData.birthCountryCode) || [];
  }, [birthData.birthCountryCode]);

  // Derived State for Timezones based on selected Country
  const availableTimezones = useMemo(() => {
    if (!birthData.birthCountryCode) return [];
    const country = allCountries.find(c => c.isoCode === birthData.birthCountryCode);
    return country?.timezones || [];
  }, [birthData.birthCountryCode, allCountries]);

  // Auto-select Timezone if only 1 exists
  useEffect(() => {
    if (availableTimezones.length === 1 && !birthData.birthTimezone) {
      setBirthData(prev => ({ ...prev, birthTimezone: availableTimezones[0].zoneName }));
    }
  }, [availableTimezones, birthData.birthTimezone]);

  const isBirthPatternStep = currentStep === QUESTIONS.length;
  const totalSteps = QUESTIONS.length + 1;

  const question = !isBirthPatternStep ? QUESTIONS[currentStep] : null;

  const isBirthFormValid = birthData.name.trim() && birthData.gender && birthData.birthDate &&
    (birthData.birthTimeUnknown || birthData.birthTime) &&
    birthData.birthCountryCode && birthData.birthTimezone &&
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
    // Use functional update with clamp to prevent double-advance from rapid clicks
    // (setTimeout in handleOptionSelect can fire twice if user clicks multiple options)
    setCurrentStep((prev) => Math.min(prev + 1, QUESTIONS.length));
  };

  const handleBirthPatternChange = (field: keyof BirthPatternData, value: any) => {
    setBirthData((prev) => {
      // If country changes, clear city and timezone
      if (field === 'birthCountryCode' && value !== prev.birthCountryCode) {
        return { ...prev, [field]: value, birthCityName: "", birthTimezone: "" };
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
      const selectedTimezoneObj = availableTimezones.find(tz => tz.zoneName === birthData.birthTimezone);
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
        timezone: birthData.birthTimezone,
        utcOffset: selectedTimezoneObj?.gmtOffsetName || "UTC",
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
        // Store navigation target, let GeneratingScreen finish animation first
        pendingNavRef.current = `/results/${result.reportId}`;
        setIsApiComplete(true);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      const msg = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setSubmitError(msg);
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
            onFinished={handleGeneratingFinished}
            onRetry={() => {
              setIsSubmitting(false);
              setSubmitError(null);
              setIsApiComplete(false);
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
                      <button
                        type="button"
                        onClick={() => setShowTimeModal(true)}
                        className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-6 text-lg text-left focus:outline-none focus:border-white transition-colors hover:border-white/40"
                      >
                        {birthData.birthTimeUnknown ? (
                          <span className="text-white/50">{t('birth.time_unknown')}</span>
                        ) : birthData.birthTime ? (
                          <span className="text-white font-mono">{birthData.birthTime}</span>
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

                    {/* Timezone Dropdown */}
                    <div className="relative mt-4">
                      <select
                        value={birthData.birthTimezone}
                        onChange={(e) => handleBirthPatternChange("birthTimezone", e.target.value)}
                        disabled={!birthData.birthCountryCode || availableTimezones.length === 0}
                        className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer disabled:opacity-30"
                      >
                        <option value="" className="bg-[#182339] text-white/50">
                          {availableTimezones.length === 0 ? "Timezone" : "Select Timezone"}
                        </option>
                        {availableTimezones.map((tz) => (
                          <option key={tz.zoneName} value={tz.zoneName} className="bg-[#182339] text-white">
                            {tz.zoneName} ({tz.gmtOffsetName})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
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
                      <span>
                        {language === 'ko' ? (
                          <>
                            <a href="/terms" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>이용약관</a>과 <a href="/privacy" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>개인정보 처리방침</a>에 동의합니다 *
                          </>
                        ) : language === 'id' ? (
                          <>
                            Saya setuju dengan <a href="/terms" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>Syarat Layanan</a> dan <a href="/privacy" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>Kebijakan Privasi</a> *
                          </>
                        ) : (
                          <>
                            I agree to the <a href="/terms" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and <a href="/privacy" target="_blank" className="underline hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>Privacy Policy</a> *
                          </>
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

