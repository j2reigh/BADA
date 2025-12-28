import { useState } from "react";
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

const BIRTH_PLACES = [
  // Countries
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Korea North", "Korea South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
  // Major Cities
  "New York, United States", "Los Angeles, United States", "Chicago, United States", "Houston, United States",
  "Phoenix, United States", "Philadelphia, United States", "San Antonio, United States", "San Diego, United States",
  "Dallas, United States", "San Jose, United States", "London, United Kingdom", "Manchester, United Kingdom",
  "Liverpool, United Kingdom", "Birmingham, United Kingdom", "Leeds, United Kingdom", "Glasgow, United Kingdom",
  "Paris, France", "Lyon, France", "Marseille, France", "Toulouse, France", "Nice, France",
  "Berlin, Germany", "Munich, Germany", "Cologne, Germany", "Frankfurt, Germany", "Hamburg, Germany",
  "Madrid, Spain", "Barcelona, Spain", "Valencia, Spain", "Seville, Spain", "Zaragoza, Spain",
  "Rome, Italy", "Milan, Italy", "Naples, Italy", "Turin, Italy", "Palermo, Italy",
  "Amsterdam, Netherlands", "Rotterdam, Netherlands", "The Hague, Netherlands", "Utrecht, Netherlands",
  "Brussels, Belgium", "Antwerp, Belgium", "Ghent, Belgium", "Charleroi, Belgium",
  "Vienna, Austria", "Graz, Austria", "Linz, Austria", "Salzburg, Austria",
  "Prague, Czech Republic", "Brno, Czech Republic", "Ostrava, Czech Republic",
  "Warsaw, Poland", "Kraków, Poland", "Łódź, Poland", "Wrocław, Poland", "Poznań, Poland",
  "Budapest, Hungary", "Debrecen, Hungary", "Szeged, Hungary", "Pécs, Hungary",
  "Athens, Greece", "Thessaloniki, Greece", "Patras, Greece", "Heraklion, Greece",
  "Lisbon, Portugal", "Porto, Portugal", "Covilhã, Portugal", "Faro, Portugal",
  "Dublin, Ireland", "Cork, Ireland", "Limerick, Ireland", "Galway, Ireland",
  "Bucharest, Romania", "Cluj-Napoca, Romania", "Timișoara, Romania", "Constanța, Romania",
  "Sofia, Bulgaria", "Plovdiv, Bulgaria", "Varna, Bulgaria", "Burgas, Bulgaria",
  "Moscow, Russia", "Saint Petersburg, Russia", "Novosibirsk, Russia", "Yekaterinburg, Russia",
  "Tokyo, Japan", "Osaka, Japan", "Kyoto, Japan", "Yokohama, Japan", "Kobe, Japan",
  "Bangkok, Thailand", "Chiang Mai, Thailand", "Phuket, Thailand", "Pattaya, Thailand",
  "Bangkok, Thailand", "Hong Kong, China", "Shanghai, China", "Beijing, China", "Shenzhen, China",
  "Mumbai, India", "Delhi, India", "Bangalore, India", "Hyderabad, India", "Chennai, India",
  "Dubai, United Arab Emirates", "Abu Dhabi, United Arab Emirates", "Sharjah, United Arab Emirates",
  "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia",
  "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Calgary, Canada", "Edmonton, Canada",
  "Mexico City, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico", "Cancun, Mexico",
  "São Paulo, Brazil", "Rio de Janeiro, Brazil", "Salvador, Brazil", "Brasília, Brazil",
  "Buenos Aires, Argentina", "Córdoba, Argentina", "Rosario, Argentina", "Mendoza, Argentina",
  "Lima, Peru", "Arequipa, Peru", "Cusco, Peru", "Trujillo, Peru",
  "Santiago, Chile", "Valparaíso, Chile", "Concepción, Chile", "Temuco, Chile",
  "Bogotá, Colombia", "Medellín, Colombia", "Cali, Colombia", "Barranquilla, Colombia",
  "Caracas, Venezuela", "Valencia, Venezuela", "Maracaibo, Venezuela",
  "Johannesburg, South Africa", "Cape Town, South Africa", "Durban, South Africa", "Pretoria, South Africa",
  "Cairo, Egypt", "Giza, Egypt", "Alexandria, Egypt", "Aswan, Egypt",
  "Istanbul, Turkey", "Ankara, Turkey", "Izmir, Turkey", "Antalya, Turkey",
  "Tel Aviv, Israel", "Jerusalem, Israel", "Haifa, Israel", "Beersheba, Israel",
  "Tehran, Iran", "Mashhad, Iran", "Isfahan, Iran", "Tabriz, Iran",
  "Bangkok, Thailand", "Singapore, Singapore", "Kuala Lumpur, Malaysia", "Manila, Philippines",
  "Jakarta, Indonesia", "Surabaya, Indonesia", "Bandung, Indonesia", "Medan, Indonesia",
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
  
  const filteredPlaces = birthData.placeOfBirth.trim().length > 0
    ? BIRTH_PLACES.filter(place =>
        place.toLowerCase().includes(birthData.placeOfBirth.toLowerCase())
      ).slice(0, 8)
    : [];
  
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
                    Place of Birth (City, Country) *
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
                    placeholder="Search city or country (e.g., New York, USA or Tokyo, Japan)"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-primary focus:outline-none transition-colors"
                  />
                  
                  {/* Search Suggestions */}
                  {placeSearchOpen && filteredPlaces.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-primary/20 shadow-lg z-50"
                    >
                      {filteredPlaces.map((place) => (
                        <button
                          key={place}
                          type="button"
                          onClick={() => {
                            handleBirthPatternChange("placeOfBirth", place);
                            setPlaceSearchOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 text-foreground hover:text-primary"
                        >
                          {place}
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
