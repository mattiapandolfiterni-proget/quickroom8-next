import { Header } from "@/components/Header";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using QuickRoom8 ("the Platform", "we", "us", "our"), you accept and agree to be bound 
              by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use our Platform. 
              These Terms constitute a legally binding agreement between you and QuickRoom8.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
            <p className="mb-4">
              QuickRoom8 is an online platform that connects room seekers with room owners and current tenants in Malta. 
              Our services include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI-powered compatibility matching between users and listings</li>
              <li>Room and flatmate listing creation and browsing</li>
              <li>In-app messaging between users</li>
              <li>Appointment scheduling for property viewings</li>
              <li>User verification services (ID and social media)</li>
              <li>Review and rating system</li>
              <li>Paid listing boost/promotion features</li>
            </ul>
            <p className="mt-4">
              <strong>Important:</strong> QuickRoom8 is a matching platform only. We do not own, manage, rent, or control 
              any properties listed on our Platform. We are not a party to any rental agreements or transactions between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Eligibility and User Accounts</h2>
            <p className="mb-4">
              To use QuickRoom8, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have legal capacity to enter into binding contracts</li>
              <li>Provide accurate, complete, and current information during registration</li>
              <li>Maintain the accuracy of your account information</li>
              <li>Not have been previously suspended or removed from the Platform</li>
              <li>Not create multiple accounts for deceptive purposes</li>
            </ul>
            <div className="mt-4 space-y-2">
              <p><strong>Account Security:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your password</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>We reserve the right to disable any account at any time</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. User Conduct and Prohibited Activities</h2>
            <p className="mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Fraudulent or Deceptive Conduct:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Post false, misleading, or fraudulent listings</li>
                  <li>Impersonate any person or entity</li>
                  <li>Provide false identity or verification documents</li>
                  <li>Engage in any form of scam or fraud</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Harmful or Illegal Conduct:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Harass, threaten, abuse, or harm other users</li>
                  <li>Discriminate based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, or other protected characteristics</li>
                  <li>Use the Platform for any illegal purpose</li>
                  <li>Post content that is defamatory, obscene, or violates any law</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Technical Violations:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                  <li>Use automated systems (bots, scrapers) without permission</li>
                  <li>Interfere with or disrupt the Platform's operation</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Data Misuse:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Collect, store, or use other users' personal information without consent</li>
                  <li>Share or sell user data to third parties</li>
                  <li>Use contact information for marketing without permission</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Room Listings and Property Requirements</h2>
            <p className="mb-4">
              Users posting room listings ("Listers") agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, complete, and truthful information about the property</li>
              <li>Have the legal right to rent, sublet, or share the property</li>
              <li>Comply with all applicable local housing, rental, and subletting laws and regulations</li>
              <li>Obtain necessary permissions from landlords or property owners before listing</li>
              <li>Accurately represent property features, amenities, and conditions</li>
              <li>Use only genuine, current photographs of the property</li>
              <li>Clearly disclose any property defects or limitations</li>
              <li>Honor the terms stated in the listing</li>
            </ul>
            <p className="mt-4">
              <strong>Anti-Discrimination Policy:</strong> Listers must not discriminate or state discriminatory 
              preferences based on race, color, religion, sex, national origin, familial status, disability, or other 
              protected characteristics under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Payments, Fees, and Transactions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Platform Fees:</h3>
                <p className="mb-2">
                  QuickRoom8 charges fees for certain premium features, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Listing Boost/Promotion: €5 for 24 hours, €9 for 48 hours, €25 for 7 days</li>
                  <li>All payments are processed securely through Stripe</li>
                  <li>Prices are in Euros (€) and include applicable VAT</li>
                  <li>Fees are non-refundable except as required by law</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">User-to-User Transactions:</h3>
                <p className="mb-2">
                  <strong>CRITICAL DISCLAIMER:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All rental agreements, deposits, and rent payments are made directly between users</li>
                  <li>QuickRoom8 is NOT a party to any rental agreement or transaction</li>
                  <li>We do NOT handle, process, or hold any rental payments or deposits</li>
                  <li>We are NOT responsible for payment disputes, fraud, non-payment, or scams between users</li>
                  <li>Users are solely responsible for ensuring the legitimacy of transactions</li>
                  <li>We strongly recommend conducting due diligence before any financial commitment</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Content Ownership and License</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Content:</h3>
                <p className="mb-2">
                  You retain ownership of all content you post on QuickRoom8 (photos, descriptions, messages, reviews). 
                  By posting content, you grant us a worldwide, non-exclusive, royalty-free, transferable license to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use, display, reproduce, and distribute your content on the Platform</li>
                  <li>Modify or adapt content for technical requirements</li>
                  <li>Use content for marketing and promotional purposes</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Platform Content:</h3>
                <p>
                  The QuickRoom8 Platform, including design, features, graphics, and software, is owned by us or our 
                  licensors and protected by intellectual property laws. You may not copy, modify, distribute, or create 
                  derivative works without our written permission.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Verification and Safety</h2>
            <p className="mb-4">
              QuickRoom8 offers optional verification services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ID verification through document upload</li>
              <li>Social media account verification</li>
              <li>Verified badges on user profiles</li>
            </ul>
            <p className="mt-4">
              <strong>IMPORTANT DISCLAIMER:</strong> Verification does not guarantee the trustworthiness, reliability, 
              or accuracy of any user or listing. We do not conduct comprehensive background checks. Verification only 
              confirms basic identity information. Users must exercise their own judgment and caution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Reviews and Ratings</h2>
            <p className="mb-4">
              Users may post reviews and ratings of other users and listings. You agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reviews must be based on genuine experiences</li>
              <li>Reviews must be honest, fair, and not defamatory</li>
              <li>You will not post fake or misleading reviews</li>
              <li>You will not offer incentives for positive reviews</li>
              <li>We may remove reviews that violate these Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Disclaimer of Warranties</h2>
            <p className="mb-4">
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST 
              EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Warranties of merchantability and fitness for a particular purpose</li>
              <li>Warranties regarding the accuracy, reliability, or availability of the Platform</li>
              <li>Warranties that the Platform will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding the conduct, identity, or legitimacy of users</li>
              <li>Warranties regarding the accuracy of listings or user-provided information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUICKROOM8 AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS 
              SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or goodwill</li>
              <li>Damages arising from user interactions, transactions, or agreements</li>
              <li>Damages from fraudulent listings, scams, or user misconduct</li>
              <li>Damages from unauthorized access or data breaches</li>
              <li>Property damage, personal injury, or death arising from use of the Platform</li>
            </ul>
            <p className="mt-4">
              OUR TOTAL LIABILITY FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS 
              PRECEDING THE CLAIM, OR €100, WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless QuickRoom8 and its affiliates, officers, directors, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
              arising from: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any 
              rights of another user; (d) your content or listings; or (e) your rental transactions or agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Account Suspension and Termination</h2>
            <p className="mb-4">
              We reserve the right to suspend or terminate your account at any time, with or without notice, for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent, harmful, or illegal activity</li>
              <li>Multiple user complaints or reports</li>
              <li>Non-payment of fees</li>
              <li>Extended period of inactivity</li>
              <li>Any reason we deem necessary to protect the Platform or users</li>
            </ul>
            <p className="mt-4">
              You may terminate your account at any time through account settings. Upon termination, your right to 
              use the Platform immediately ceases.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Disputes Between Users:</h3>
                <p>
                  QuickRoom8 is not responsible for resolving disputes between users. Users agree to resolve disputes 
                  directly with each other. We may, at our discretion, provide information to assist with dispute resolution 
                  but are not obligated to do so.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Disputes with QuickRoom8:</h3>
                <p className="mb-2">
                  For disputes with QuickRoom8, you agree to first contact us at support@quickroom8.com to attempt 
                  informal resolution. If informal resolution fails, disputes shall be resolved through:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Binding arbitration for disputes under €10,000</li>
                  <li>Litigation in the courts of Malta for disputes over €10,000</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Malta, without regard to 
              conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in 
              Malta for the resolution of any disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">16. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes via 
              email or platform notification at least 30 days before they take effect. Your continued use of the 
              Platform after changes constitutes acceptance of the modified Terms. If you do not agree to the changes, 
              you must stop using the Platform and terminate your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">17. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions 
              shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">18. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and QuickRoom8 
              regarding use of the Platform and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">19. Contact Information</h2>
            <p className="mb-4">
              For questions, concerns, or notices regarding these Terms of Service, contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> support@quickroom8.com</li>
              <li><strong>Phone:</strong> +356 9930 1803</li>
              <li><strong>Legal inquiries:</strong> terms@quickroom8.com</li>
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

export default TermsOfService;