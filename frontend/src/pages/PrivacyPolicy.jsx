export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', fontFamily: 'Inter, sans-serif', color: '#111827', lineHeight: 1.7 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>T</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>ThrottleResponseBDC</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Last updated: July 1, 2026</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Overview</h2>
          <p>ThrottleResponseBDC ("we," "our," or "us") operates an AI-powered Business Development Center platform on behalf of Falcons Fury Harley-Davidson. This Privacy Policy explains how we collect, use, and protect information provided by customers who interact with our platform.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Information We Collect</h2>
          <p>We collect information that customers voluntarily provide when submitting inquiries, including:</p>
          <ul style={{ paddingLeft: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Vehicle interest and inquiry details</li>
            <li>Communication history (SMS and email exchanges)</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. SMS Communications</h2>
          <p>By providing your phone number and submitting an inquiry, you may receive SMS text messages from Falcons Fury Harley-Davidson regarding your vehicle inquiry, follow-up communications, appointment reminders, inventory updates, and dealership promotions.</p>
          <ul style={{ paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Consent is optional</strong> — it is not required to receive any service or complete any transaction with the dealership.</li>
            <li><strong>Message frequency varies</strong> depending on your inquiry and engagement.</li>
            <li><strong>Message and data rates may apply</strong> depending on your carrier plan.</li>
            <li><strong>To opt out</strong> at any time, reply <strong>STOP</strong> to any message. You will receive a confirmation and no further messages will be sent.</li>
            <li><strong>For help</strong>, reply <strong>HELP</strong> or contact us directly.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. How We Use Your Information</h2>
          <p>We use the information collected to:</p>
          <ul style={{ paddingLeft: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Respond to your vehicle inquiries</li>
            <li>Schedule and manage dealership appointments</li>
            <li>Send follow-up communications regarding your inquiry</li>
            <li>Improve our customer engagement processes</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Data Sharing</h2>
          <p>We do not sell your personal information to third parties. <strong>Mobile phone numbers and SMS consent information are never shared with third parties or affiliates for marketing purposes.</strong> Your information may be shared with Falcons Fury Harley-Davidson staff for the purpose of fulfilling your inquiry and with service providers (such as Twilio for SMS delivery) solely to operate the platform.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Data Retention</h2>
          <p>We retain your information for as long as necessary to fulfill the purposes outlined in this policy or as required by applicable law. You may request deletion of your data at any time by contacting us.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Security</h2>
          <p>We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, disclosure, or loss.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>8. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:</p>
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