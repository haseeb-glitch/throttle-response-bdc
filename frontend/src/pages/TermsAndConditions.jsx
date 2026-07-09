export default function TermsAndConditions() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, sans-serif', color: '#111827', lineHeight: 1.7 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>T</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>ThrottleResponseBDC</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Terms and Conditions</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Last updated: July 1, 2026</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p>By submitting an inquiry or interacting with ThrottleResponseBDC on behalf of Falcons Fury Harley-Davidson, you agree to these Terms and Conditions. If you do not agree, please do not use this service.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. SMS Messaging Terms</h2>
          <p>By providing your phone number, you acknowledge and agree to the following:</p>
          <ul style={{ paddingLeft: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>You may receive SMS messages from Falcons Fury Harley-Davidson related to your vehicle inquiry, appointments, and dealership updates.</li>
            <li><strong>Consent to receive SMS is optional</strong> and is not a condition of purchasing any goods or services.</li>
            <li>Message frequency varies. You may receive multiple messages per week depending on your inquiry status.</li>
            <li>Message and data rates may apply.</li>
            <li>To opt out at any time, reply <strong>STOP</strong> to any message.</li>
            <li>To get help, reply <strong>HELP</strong> or contact the dealership directly.</li>
            <li>Supported carriers include but are not limited to: AT&T, T-Mobile, Verizon, Sprint, and other major US carriers.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Use of Service</h2>
          <p>This platform is intended to facilitate communication between prospective customers and Falcons Fury Harley-Davidson. You agree not to use this service for any unlawful purpose or in any way that could damage, disable, or impair the platform.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. No Guarantee of Availability</h2>
          <p>Vehicle availability, pricing, and promotions are subject to change without notice. Information provided through this platform is for general inquiry purposes only and does not constitute a binding offer or contract.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Pricing and Financing</h2>
          <p>All pricing, payment estimates, and financing terms mentioned through this platform are for informational purposes only and are subject to credit approval, lender terms, and dealership confirmation. Final pricing and financing terms are determined by the dealership and applicable lenders.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Limitation of Liability</h2>
          <p>ThrottleResponseBDC and Falcons Fury Harley-Davidson shall not be liable for any indirect, incidental, or consequential damages arising from your use of this platform or reliance on information provided through SMS or email communications.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Changes to Terms</h2>
          <p>We reserve the right to update these Terms and Conditions at any time. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>8. Contact</h2>
          <div style={{ marginTop: 12, padding: 16, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
            <p><strong>ThrottleResponseBDC</strong></p>
            <p>On behalf of Falcons Fury Harley-Davidson</p>
            <p>Email: info@throttleresponsebdc.com</p>
            <p>Website: ThrottleResponseBDC.com</p>
          </div>
        </section>

      </div>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', color: '#9CA3AF', fontSize: 13 }}>
        © 2026 ThrottleResponseBDC. All rights reserved.
      </div>
    </div>
  )
}