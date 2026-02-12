import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
                    <span className="font-semibold text-lg">Privacy Policy</span>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="prose prose-slate max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: February 10, 2026</p>

                    <h3>1. Introduction</h3>
                    <p>
                        BADA ("we", "our") respects your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our services.
                    </p>

                    <h3>2. Information We Collect</h3>
                    <p>
                        We collect the following personal information to provide our core service (Saju/Four Pillars analysis):
                    </p>
                    <ul>
                        <li><strong>Required:</strong> Email address (for account and report delivery).</li>
                        <li><strong>Service Data:</strong> Date of Birth, Time of Birth, Place of Birth (Country/City). This is sensitive personal data necessary for generating your chart.</li>
                        <li><strong>Survey Responses:</strong> Your answers to our behavioral/lifestyle questionnaire. These responses are used to personalize your report analysis.</li>
                        <li><strong>Optional:</strong> Name (only for display in the report).</li>
                        <li><strong>Automatically Collected:</strong> Usage data, IP address, and cookies for login sessions.</li>
                    </ul>

                    <h3>3. How We Use Your Information</h3>
                    <p>
                        We use your information strictly for:
                    </p>
                    <ul>
                        <li>Calculating your astrological chart (local algorithm).</li>
                        <li>Generating your personalized report using AI (Google Gemini).</li>
                        <li>Sending you your report and service notifications (Resend).</li>
                        <li>Improving our service and user experience.</li>
                    </ul>

                    <h3>4. Sharing with Third Parties</h3>
                    <p>
                        We share data with trusted third-party providers only to deliver the service:
                    </p>
                    <ul>
                        <li><strong>Google Gemini (AI):</strong> We send your chart structure (pseudonymized where possible) to generate text analysis. Google does not use this data to train their models.</li>
                        <li><strong>Gumroad (Payments):</strong> We use Gumroad to process payments. Your email and payment information are handled by Gumroad in accordance with their privacy policy. We do not store your payment details on our servers.</li>
                        <li><strong>Human Design API:</strong> We send your birth data (date, time, and place of birth) to a third-party Human Design API to retrieve your chart information.</li>
                        <li><strong>Resend:</strong> We use Resend to deliver transactional emails.</li>
                        <li><strong>Database Provider:</strong> Your data is stored securely in our cloud database (Supabase).</li>
                    </ul>

                    <h3>5. Data Retention</h3>
                    <p>
                        We retain your personal data for as long as your account is active or as needed to provide you with the Service. You may request deletion of your account and data at any time by emailing us at <strong>help@bada.one</strong>.
                    </p>
                    <p>
                        Upon receiving a valid deletion request, we will delete your personal data from our active systems within 30 days. Some data may be retained in encrypted backups for up to 90 days before being permanently purged.
                    </p>

                    <h3>6. Your Rights</h3>
                    <p>
                        You have the right to:
                    </p>
                    <ul>
                        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                        <li><strong>Correction:</strong> Request correction of any inaccurate data.</li>
                        <li><strong>Deletion:</strong> Request deletion of your account and all associated personal data.</li>
                        <li><strong>Portability:</strong> Request your data in a portable format.</li>
                    </ul>
                    <p>
                        To exercise any of these rights, please contact us at <strong>help@bada.one</strong>. We will respond to your request within 30 days.
                    </p>

                    <h3>7. Children's Privacy</h3>
                    <p>
                        Our Service is not directed to children under the age of 14. We do not knowingly collect personal information from children under 14. If we become aware that we have collected such information, we will delete it.
                    </p>

                    <h3>8. International Transfer</h3>
                    <p>
                        Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                    </p>

                    <h3>9. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at help@bada.one.
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
