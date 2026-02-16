export default function PrivacyPolicy() {
    return (
        <main className="flex-grow pt-20 pb-16 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Last updated: January 25, 2026
                </p>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Welcome to Prodsnap. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you about how we look after your personal data when you visit our
                            website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            We collect and process the following types of information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                            <li><strong>Account Information:</strong> Name, email address, and authentication details when you create an account</li>
                            <li><strong>Practice Data:</strong> Your responses to case studies, feedback, and practice history</li>
                            <li><strong>Payment Information:</strong> Payment screenshots and transaction details for subscription verification</li>
                            <li><strong>Usage Data:</strong> Information about how you use our platform, including pages visited and features used</li>
                            <li><strong>Communication Data:</strong> Messages you send us through contact forms or support channels</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            We use your information to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Provide and maintain our services</li>
                            <li>Process your subscription and payments</li>
                            <li>Generate AI-powered feedback on your practice responses</li>
                            <li>Send you important updates about your account and our services</li>
                            <li>Improve our platform and develop new features</li>
                            <li>Respond to your inquiries and provide customer support</li>
                            <li>Ensure the security and integrity of our platform</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Data Storage and Security</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            We use industry-standard security measures to protect your data. Your information is stored securely
                            using Supabase (PostgreSQL database) with encryption in transit and at rest. We implement appropriate
                            technical and organizational measures to prevent unauthorized access, disclosure, or destruction of your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            We use the following third-party services:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                            <li><strong>Supabase:</strong> For authentication and database services</li>
                            <li><strong>Google Gemini AI:</strong> For generating feedback on your practice responses</li>
                            <li><strong>Groq AI:</strong> For high-speed AI processing and extraction</li>
                            <li><strong>Brevo:</strong> For sending transactional emails</li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                            These services have their own privacy policies and we encourage you to review them.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate or incomplete data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Export your data in a portable format</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            We use essential cookies to maintain your session and provide core functionality. We do not use
                            third-party advertising or tracking cookies. You can control cookie settings through your browser.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            We retain your personal data only for as long as necessary to provide our services and comply with
                            legal obligations. Practice history and feedback are retained while your account is active. You can
                            request deletion of your account and associated data at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Our services are not intended for children under 13 years of age. We do not knowingly collect
                            personal information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            We may update this privacy policy from time to time. We will notify you of any changes by posting
                            the new privacy policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            If you have any questions about this privacy policy or our data practices, please contact us at:
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                            <strong>Email:</strong> <a href="mailto:support@prodsnap.in" className="text-violet-600 hover:text-violet-700">support@prodsnap.in</a><br />
                            <strong>Website:</strong> <a href="https://prodsnap.in" className="text-violet-600 hover:text-violet-700">prodsnap.in</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
