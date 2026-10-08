import LegalLayout, { Section } from "../components/LegalLayout";
import { APP_NAME } from "../config";

const CONTACT_EMAIL = "support@example.com";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="October 2026">
      <p>
        This policy explains what information {APP_NAME} collects, why, and how it is used.
      </p>

      <Section title="1. Information we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>Account details: your name, email address, phone number and WhatsApp number.</li>
          <li>Adverts you post: titles, descriptions, prices, photos, city and category.</li>
          <li>Activity: adverts you save, adverts you report, and view counts on adverts.</li>
        </ul>
      </Section>

      <Section title="2. Why we collect it">
        <ul className="list-disc pl-5 space-y-1">
          <li>To create and manage your account.</li>
          <li>To show your adverts and let buyers contact you.</li>
          <li>To keep the platform safe, and review reports of abuse.</li>
        </ul>
      </Section>

      <Section title="3. What other people can see">
        <p>
          Your name, city, and the phone and WhatsApp numbers on your profile are shown to visitors
          on your adverts so buyers can contact you. Do not post details you do not want to be
          public. Your email address and password are never shown to other users.
        </p>
      </Section>

      <Section title="4. Who we share data with">
        <p>
          We do not sell your information. Your data is stored with our service providers, who host
          the website, the database, the image storage and the emails we send (for example account
          confirmation). We may disclose information if the law requires it.
        </p>
      </Section>

      <Section title="5. How long we keep it">
        <p>
          We keep your data while your account is active. When an advert is deleted, its photos are
          deleted too. You can ask us to delete your account and data at any time.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          You can view and edit your details, delete your adverts, and ask for your account and data
          to be removed. Contact us to do this.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Privacy questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-700 font-semibold hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}