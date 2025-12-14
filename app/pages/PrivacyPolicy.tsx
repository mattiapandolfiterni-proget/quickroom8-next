import { Header } from "@/components/Header";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Data Controller</h2>
            <p>
              QuickRoom8 operates this platform and is the data controller responsible for your personal information. 
              You can contact us at: support@quickroom8.com or +356 9930 1803.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
            <p className="mb-4">
              We collect the following types of information:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Information You Provide:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (name, email, phone number, password)</li>
                  <li>Profile details (age, gender, nationality, occupation, languages)</li>
                  <li>Lifestyle preferences (cleanliness, noise tolerance, sleep schedule, smoking status, pets)</li>
                  <li>Room preferences (budget, location, room type, amenities)</li>
                  <li>Room listing information (title, description, price, location, amenities, images)</li>
                  <li>Messages and communications with other users</li>
                  <li>Verification documents (ID, social media profiles)</li>
                  <li>Reviews and ratings</li>
                  <li>Payment information (processed securely by Stripe)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Automatically Collected Information:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages viewed, features used, time spent)</li>
                  <li>Location data (with your permission)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Optional ID Verification</h2>
            <p className="mb-4">
              <strong>ID verification is completely optional</strong> and not required to register or use QuickRoom8. 
              We offer optional identity verification to enhance trust and safety within our community.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Why We Offer Optional ID Verification:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Enhanced trust and safety for all users</li>
                  <li>Prevention of fraud and fake profiles</li>
                  <li>Increased confidence when viewing rooms or meeting flatmates</li>
                  <li>Better protection for property owners and room seekers</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Benefits for Verified Users:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Display a "Verified" badge on your profile</li>
                  <li>Increased visibility in search results</li>
                  <li>Higher trust from other users</li>
                  <li>Priority support from our team</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">How We Handle ID Documents:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Voluntary submission:</strong> You decide if and when to verify your identity</li>
                  <li><strong>Secure storage:</strong> Documents are encrypted and stored in secure, access-controlled systems</li>
                  <li><strong>Limited retention:</strong> Documents are deleted within 90 days after successful verification</li>
                  <li><strong>Privacy protection:</strong> Your ID details are never shared with other users—only the verification badge is displayed</li>
                  <li><strong>GDPR compliance:</strong> We process ID data based on your explicit consent and our legitimate interest in platform safety</li>
                  <li><strong>Data minimization:</strong> We only collect the minimum information necessary for verification</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Control:</h3>
                <p>
                  You can use QuickRoom8 without ID verification. If you choose to verify, you can request deletion 
                  of your verification data at any time by contacting support@quickroom8.com. Note that removing 
                  verification will also remove your verified badge.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Legal Basis for Processing (GDPR)</h2>
            <p className="mb-4">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contract Performance:</strong> To provide our matching and messaging services</li>
              <li><strong>Legitimate Interests:</strong> To improve our services, ensure platform safety, and prevent fraud</li>
              <li><strong>Consent:</strong> For marketing communications, non-essential cookies, and optional ID verification</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. How We Use Your Information</h2>
            <p className="mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our room and flatmate matching services</li>
              <li>Calculate compatibility scores using our AI-powered algorithm</li>
              <li>Facilitate communication between room seekers, owners, and tenants</li>
              <li>Display your profile and listings to other users</li>
              <li>Send notifications about matches, messages, appointments, and platform updates</li>
              <li>Process payments for boosted listings</li>
              <li>Verify user identity and prevent fraud</li>
              <li>Respond to support requests and resolve disputes</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Information Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell your personal information. We share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>With Other Users:</strong> Your profile information, listings, and compatibility scores are visible to other users</li>
              <li><strong>Service Providers:</strong> We share data with trusted third parties who assist us (hosting, analytics, payment processing, email delivery)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Third-Party Services</h2>
            <p className="mb-4">
              We use the following third-party services that may collect information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> For secure payment processing of listing boosts</li>
              <li><strong>Mapbox:</strong> For map display and location services</li>
              <li><strong>Resend:</strong> For transactional email notifications</li>
              <li><strong>Google Analytics:</strong> For usage analytics (if implemented)</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Understand how you use our platform</li>
              <li>Improve platform performance</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services. 
              When you delete your account, we will delete or anonymize your personal data within 30 days, except where 
              we are required to retain it for legal, regulatory, or safety reasons. Anonymized data may be retained for 
              analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication</li>
              <li>Secure data centers</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your 
              information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Your Rights Under GDPR</h2>
            <p className="mb-4">
              As a user in the European Union, you have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at support@quickroom8.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Automated Decision Making</h2>
            <p>
              Our platform uses automated algorithms to calculate compatibility scores between users and listings. 
              This helps match room seekers with suitable accommodations. You can request human review of any 
              compatibility score by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries outside the European Economic Area (EEA). 
              We ensure appropriate safeguards are in place, such as Standard Contractual Clauses, to protect your data 
              in compliance with GDPR requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Children's Privacy</h2>
            <p>
              Our services are not intended for users under the age of 18. We do not knowingly collect personal 
              information from children. If we become aware that we have collected data from a child, we will delete 
              it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of significant changes via email or platform notification. Your continued use of the platform 
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">16. Contact Information</h2>
            <p className="mb-4">
              For questions, concerns, or to exercise your rights under this Privacy Policy, contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> support@quickroom8.com</li>
              <li><strong>Phone:</strong> +356 9930 1803</li>
              <li><strong>Privacy-specific inquiries:</strong> privacy@quickroom8.com</li>
            </ul>
          </section>

          <p className="text-sm mt-8 pt-8 border-t border-border">
            <strong>Last updated:</strong> January 2025<br />
            <strong>Effective date:</strong> January 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
