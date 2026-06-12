import {Link} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Last updated: {new Date().toLocaleDateString('en-PH', {year: 'numeric', month: 'long', day: 'numeric'})}
      </p>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Data Privacy Notice
          </h2>
          <p>
            Kuya Bong's Car Selection ("we", "our", "us") is committed to protecting your
            personal data. This Privacy Policy explains how we collect, use, and safeguard
            your information when you use our platform to inquire about vehicles, in
            compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) of the
            Philippines.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Information We Collect
          </h2>
          <p className="mb-2">
            We collect only the personal information that you voluntarily provide through our
            inquiry form:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your full name</li>
            <li>Your email address</li>
            <li>Your phone number (optional)</li>
            <li>Your message or inquiry details</li>
            <li>Your interest type (questions, test drive, or finance)</li>
          </ul>
          <p className="mt-2">
            We do not collect any personal data from passive browsing. No cookies or tracking
            mechanisms are used to collect personal information.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            How We Use Your Information
          </h2>
          <p className="mb-2">Your personal data is used solely for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Forwarding your inquiry</strong> — Your name, email, phone, and message
              are sent directly to the respective vehicle seller so they can respond to your
              inquiry.
            </li>
            <li>
              <strong>Record-keeping</strong> — A record of the inquiry is stored in our
              database for internal record-keeping and dispute resolution.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Data Sharing and Disclosure
          </h2>
          <p>
            We do not sell, trade, or transfer your personal information to third parties.
            Your data is shared only with the specific seller of the vehicle you are inquiring
            about, and only for the purpose of responding to your inquiry. We do not authorize
            sellers to use your information for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Data Storage and Retention
          </h2>
          <p>
            Your personal data is stored in our secure database. We retain inquiry records for
            as long as necessary to fulfill the purposes described in this policy or as
            required by applicable law. When no longer needed, records are securely deleted.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Your Rights Under RA 10173
          </h2>
          <p className="mb-2">
            Under the Data Privacy Act of 2012, you have the following rights regarding your
            personal data:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Right to access</strong> — You may request a copy of the personal data
              we hold about you.
            </li>
            <li>
              <strong>Right to correction</strong> — You may request that we correct any
              inaccurate or incomplete data.
            </li>
            <li>
              <strong>Right to deletion</strong> — You may request that we delete your
              personal data, subject to certain legal limitations.
            </li>
            <li>
              <strong>Right to object</strong> — You may object to the processing of your
              personal data.
            </li>
            <li>
              <strong>Right to data portability</strong> — You may request a copy of your data
              in a commonly used format.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Consent
          </h2>
          <p>
            By checking the consent checkbox on our inquiry form, you explicitly acknowledge
            that you have read this Privacy Policy and consent to the collection, use, and
            disclosure of your personal data as described herein. You may withdraw your
            consent at any time by contacting us, but please note that withdrawal may affect
            our ability to process your inquiry.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Contact Information
          </h2>
          <p className="mb-2">
            If you have any questions, concerns, or requests regarding your personal data or
            this Privacy Policy, you may contact us at:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-slate-900">Kuya Bong's Car Selection</p>
            <p>Email: privacy@kuyabongscars.com</p>
          </div>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on
            this page with an updated revision date. We encourage you to review this policy
            periodically.
          </p>
        </section>
      </div>
    </main>
  );
}