import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#182339] font-sans selection:bg-[#879DC6] selection:text-[#182339]">
            <header className="sticky top-0 z-50 w-full bg-[#FAFAFA]/80 backdrop-blur-md border-b border-[#E5E7EB]">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => setLocation("/")}
                        className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-lg">Terms of Service</span>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="prose prose-slate max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: February 10, 2026</p>

                    <h3>1. Introduction</h3>
                    <p>
                        Welcome to BADA ("we," "our," or "us"). By accessing or using our services, including our website and analysis reports (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms").
                    </p>

                    <h3>2. Nature of Service</h3>
                    <p>
                        <strong>For Entertainment & Self-Reflection Only.</strong> The Service provides analysis based on Eastern philosophy (Saju/Four Pillars) and AI interpretation. It is designed for entertainment and self-reflection purposes only.
                    </p>
                    <p>
                        <strong>Not Professional Advice.</strong> The Service does not provide medical, legal, financial, or psychological advice. You should not rely on the Service as a substitute for professional advice.
                    </p>
                    <p>
                        <strong>AI Limitations.</strong> Our reports are generated using Artificial Intelligence (Google Gemini). While we strive for quality, AI may produce inaccurate or "hallucinated" information. We do not guarantee the accuracy of the analysis.
                    </p>

                    <h3>3. User Eligibility</h3>
                    <p>
                        You must be at least 14 years old (or the minimum age of digital consent in your country) to use our Service.
                    </p>

                    <h3>4. Purchases and Refunds</h3>
                    <p>
                        <strong>Payment Platform.</strong> All purchases are processed through <strong>Gumroad</strong>, a third-party payment platform. By making a purchase, you also agree to Gumroad's terms of service.
                    </p>
                    <p>
                        <strong>Digital Goods.</strong> Our full reports are digital content that is rendered immediately upon purchase. After completing payment on Gumroad, you will receive an unlock code to access your full report.
                    </p>
                    <p>
                        <strong>Refund Policy.</strong> Due to the nature of digital goods, <strong>all sales are final and non-refundable</strong> once the report has been generated or viewed ("Unlocked").
                    </p>
                    <p>
                        <strong>Exceptions.</strong> If a technical error prevents you from receiving or accessing your report, please contact us for a full refund or replacement.
                    </p>

                    <h3>5. Intellectual Property</h3>
                    <p>
                        We own all rights, title, and interest in the Service, including our algorithm, UI, and branding. You retain ownership of your personal data. You are granted a limited license to use your personal report for personal, non-commercial use.
                    </p>

                    <h3>6. Limitation of Liability</h3>
                    <p>
                        To the maximum extent permitted by law, BADA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or use.
                    </p>

                    <h3>7. Governing Law</h3>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of Korea</strong>, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Seoul, Republic of Korea.
                    </p>

                    <h3>8. Changes to These Terms</h3>
                    <p>
                        We may update these Terms from time to time. When we make material changes, we will notify you by updating the "Last Updated" date at the top of this page and, where appropriate, by sending you an email notification. Your continued use of the Service after the changes take effect constitutes your acceptance of the revised Terms.
                    </p>

                    <h3>9. Contact Us</h3>
                    <p>
                        If you have any questions about these Terms, please contact us at help@bada.one.
                    </p>
                </div>
            </main>

            <footer className="border-t border-[#E5E7EB] bg-white mt-12">
                <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} BADA. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
