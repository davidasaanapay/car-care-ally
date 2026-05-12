import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Car Care Ally" },
      { name: "description", content: "Car Care Ally privacy policy. CCPA / CPRA, GDPR, and US state privacy law compliant. Learn how we collect, use, and protect your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell>
      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: May 12, 2026 · Last updated: May 12, 2026</p>

        <div className="mt-8 space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">1. Who we are</h2>
            <p className="mt-3">Car Care Ally ("CCA", "we", "us", "our") operates carcareally.com and the Car Care Ally platform connecting drivers with accredited automotive shops and independent specialists. Contact: <a className="text-primary" href="mailto:privacy@carcareally.com">privacy@carcareally.com</a> · 1-302-640-0060.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Information we collect</h2>
            <ul className="mt-3 list-disc ml-6 space-y-2">
              <li><strong>Account data</strong> — name, email, phone, password (hashed), city, state.</li>
              <li><strong>Vehicle data</strong> — year, make, model, trim, mileage, service history, optional VIN and license plate.</li>
              <li><strong>Service data</strong> — appointments, diagnostics inputs, AI chat history, invoices, payments.</li>
              <li><strong>Device & usage data</strong> — IP address, browser type, pages viewed, referrer, cookies.</li>
              <li><strong>Communications</strong> — messages you send to us or to a shop through the platform.</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">We do <strong>not</strong> collect Social Security numbers, government IDs, biometric data, or precise geolocation. We do not knowingly collect data from children under 16.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. How we use your information</h2>
            <ul className="mt-3 list-disc ml-6 space-y-2">
              <li>Provide and improve the Car Care Ally platform.</li>
              <li>Match you with accredited shops, generate AI diagnostics, and process bookings.</li>
              <li>Send transactional emails (account, appointments, invoices, maintenance reminders).</li>
              <li>Detect fraud, enforce our Terms, and comply with law.</li>
              <li>With your consent, send marketing — you can opt out anytime.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. How we share your information</h2>
            <p className="mt-3">We share data only with: (a) the shop or specialist you book with; (b) processors acting on our behalf under written contract — payments (Stripe), email delivery (Resend), AI inference (Lovable AI Gateway), hosting (Supabase / Cloudflare); (c) authorities when required by law. <strong>We do not sell your personal information.</strong> We do not "share" personal information for cross-context behavioral advertising as defined under CPRA.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Your California rights (CCPA / CPRA)</h2>
            <p className="mt-3">If you are a California resident, you have the right to:</p>
            <ul className="mt-3 list-disc ml-6 space-y-2">
              <li><strong>Know</strong> what personal information we have collected about you.</li>
              <li><strong>Delete</strong> personal information, subject to legal exceptions.</li>
              <li><strong>Correct</strong> inaccurate personal information.</li>
              <li><strong>Opt out</strong> of sale or sharing for cross-context behavioral advertising — we do not sell or share, but you may still submit a request.</li>
              <li><strong>Limit</strong> use of sensitive personal information — we do not use sensitive PI for inferring characteristics.</li>
              <li><strong>Non-discrimination</strong> for exercising your rights.</li>
              <li><strong>Authorized agent</strong> — you may designate one in writing.</li>
            </ul>
            <p className="mt-3">Submit any of the above to <a className="text-primary" href="mailto:privacy@carcareally.com">privacy@carcareally.com</a> or call 1-302-640-0060. We will verify your identity and respond within 45 days.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">6. Other US state rights</h2>
            <p className="mt-3">Residents of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), Texas, Oregon, Montana, Iowa, Tennessee, Indiana, Delaware, New Hampshire, New Jersey, Minnesota, Maryland, and other states with comprehensive privacy laws have similar rights to access, delete, correct, and port their data, and to opt out of targeted advertising, sale, and profiling. Use the same contact above.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">7. EU/UK rights (GDPR)</h2>
            <p className="mt-3">If you are in the EEA, UK, or Switzerland, our lawful bases are contract performance, legitimate interest, consent, and legal obligation. You have the right to access, rectification, erasure, restriction, portability, objection, and to lodge a complaint with your supervisory authority.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">8. Data retention</h2>
            <p className="mt-3">We retain account data while your account is active, plus up to 7 years after closure for tax, accounting, and dispute resolution. Diagnostic and chat history is kept for 24 months, then anonymized. You can request earlier deletion at any time.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">9. Security</h2>
            <p className="mt-3">We use TLS 1.2+ in transit, encryption at rest, role-based access, row-level security on all customer data, and least-privilege server-side secrets. No system is perfectly secure — please use a strong unique password and notify us immediately at <a className="text-primary" href="mailto:security@carcareally.com">security@carcareally.com</a> if you suspect unauthorized access.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">10. Cookies</h2>
            <p className="mt-3">We use strictly necessary cookies for authentication and session management. We do not use advertising or cross-site tracking cookies. You may disable cookies in your browser, but some features may not work.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">11. Changes</h2>
            <p className="mt-3">We will post material changes here with a new effective date and, where required, notify you by email.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">12. Contact</h2>
            <p className="mt-3">Car Care Ally · Privacy Office · <a className="text-primary" href="mailto:privacy@carcareally.com">privacy@carcareally.com</a> · <a className="text-primary" href="tel:13026400060">1-302-640-0060</a>.</p>
          </section>
        </div>
      </article>
    </PageShell>
  );
}
