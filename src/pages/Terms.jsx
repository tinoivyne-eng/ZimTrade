import LegalLayout, { Section } from "../components/LegalLayout";
import { APP_NAME } from "../config";

const CONTACT_EMAIL = "tinoivyne@gmail.com";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Use" updated="October 2026">
      <p>
        By using {APP_NAME} you agree to these terms. If you do not agree, please do not use the
        website.
      </p>

      <Section title="1. What we are">
        <p>
          {APP_NAME} is an online classifieds platform. We let people post adverts and contact each
          other. We are not a party to any sale, and we do not own, inspect, store or deliver any
          item or service advertised.
        </p>
      </Section>

      <Section title="2. Your account">
        <p>
          You must give accurate details and keep your password safe. You are responsible for
          everything done through your account. You must be at least 18 years old to post adverts.
        </p>
      </Section>

      <Section title="3. Posting adverts">
        <p>You agree that your adverts will:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Be truthful, and describe the item or service honestly.</li>
          <li>Use photos you have the right to use.</li>
          <li>Not offer illegal, stolen, counterfeit or dangerous goods, weapons, or drugs.</li>
          <li>Not contain offensive, discriminatory or misleading content.</li>
          <li>Not be spam, duplicates, or used to collect money in advance without delivering.</li>
        </ul>
      </Section>

      <Section title="4. Removal of content">
        <p>
          We may hide or delete any advert, and suspend any account, that breaks these terms or that
          is reported as harmful, without notice.
        </p>
      </Section>

      <Section title="5. Dealing with other users">
        <p>
          Transactions are between you and the other person. Meet in a public place, inspect items
          before you pay, and never pay in advance for something you have not seen. We are not
          responsible for losses, disputes, fraud or injuries arising from dealings between users.
        </p>
      </Section>

      <Section title="6. Our liability">
        <p>
          The website is provided "as is". We do not guarantee that it will always be available or
          error free. To the extent the law allows, we are not liable for indirect or consequential
          losses arising from your use of {APP_NAME}.
        </p>
      </Section>

      <Section title="7. Changes">
        <p>
          We may update these terms from time to time. Continuing to use {APP_NAME} after a change
          means you accept the new terms.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          Questions or reports:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-700 font-semibold hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}