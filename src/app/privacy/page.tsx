import { Display, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy | Pragya Labs",
  description:
    "How Pragya Labs handles your information: no accounts, no cookies, contact by email or phone only.",
  canonical: "/privacy",
});

/** Privacy: states exactly what the site does — nothing more. */
export default function PrivacyPage() {
  return (
    <SectionContainer eyebrow="Privacy Policy">
      <Reveal>
        <Display as="h1" size="lg" className="max-w-[20ch]">
          Your information stays yours.
        </Display>
        <Body className="mt-6">
          This website has no accounts, no contact forms, and sets no cookies. The only
          way information reaches Pragya Labs is if you send it — by email at{" "}
          {site.contact.email} or by phone at {site.contact.phone}.
        </Body>
        <Body className="mt-4">
          Anonymous, cookie-free analytics measure visits so the site can be improved.
          Nothing you send by email or phone is shared, sold, or used for marketing.
        </Body>
        <Body className="mt-4">
          Project work is agreed in writing before it starts, including what data the
          project touches and how it is handled.
        </Body>
      </Reveal>
    </SectionContainer>
  );
}
