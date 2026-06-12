import {Link} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';

export default function TermsOfService() {
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
        Terms of Service
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Last updated: {new Date().toLocaleDateString('en-PH', {year: 'numeric', month: 'long', day: 'numeric'})}
      </p>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Site Usage Terms
          </h2>
          <p className="mb-2">
            By accessing and using Kuya Bong's Car Selection ("the Platform"), you agree to
            comply with and be bound by the following terms and conditions. If you do not agree
            with any part of these terms, you must not use the Platform.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              The Platform is provided for informational purposes to browse and inquire about
              used vehicles listed by independent sellers.
            </li>
            <li>
              You agree to use the Platform only for lawful purposes and in a manner that does
              not infringe the rights of others or restrict their use of the Platform.
            </li>
            <li>
              You agree not to submit false, misleading, or fraudulent inquiries through the
              Platform.
            </li>
            <li>
              We reserve the right to modify, suspend, or discontinue any aspect of the
              Platform at any time without prior notice.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Disclaimer of Warranties
          </h2>
          <p>
            All vehicles listed on the Platform are offered for sale by independent third-party
            sellers. Kuya Bong's Car Selection acts solely as an intermediary platform and
            makes no representations or warranties of any kind, express or implied, regarding
            any vehicle listed on the Platform.
          </p>
          <p className="mt-2">
            All vehicles are sold <strong>"AS IS"</strong> and <strong>"WHERE IS"</strong>,
            without any warranty whatsoever, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, or non-infringement. Buyers are
            strongly encouraged to conduct their own independent inspections, obtain
            professional mechanical evaluations, and verify all vehicle details directly with
            the seller before making any purchase decision.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by applicable law, Kuya Bong's Car Selection, its
            owners, operators, employees, and affiliates shall not be liable for any direct,
            indirect, incidental, special, consequential, or punitive damages arising out of or
            relating to:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              The use of or inability to use the Platform
            </li>
            <li>
              Any vehicle purchased or sold through the Platform
            </li>
            <li>
              Any misrepresentation, defect, or issue with a vehicle listed by a seller
            </li>
            <li>
              Any unauthorized access to or alteration of your transmissions or data
            </li>
            <li>
              Any other matter relating to the Platform or any vehicle listing
            </li>
          </ul>
          <p className="mt-2">
            Your sole remedy against Kuya Bong's Car Selection shall be limited to the
            discontinuation of your use of the Platform.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Governing Law
          </h2>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the
            laws of the Republic of the Philippines. Any disputes arising out of or relating to
            these terms or the use of the Platform shall be subject to the exclusive
            jurisdiction of the courts of the Philippines.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-3">
            Contact Information
          </h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-slate-900">Kuya Bong's Car Selection</p>
            <p>Email: legal@kuyabongscars.com</p>
          </div>
        </section>
      </div>
    </main>
  );
}
