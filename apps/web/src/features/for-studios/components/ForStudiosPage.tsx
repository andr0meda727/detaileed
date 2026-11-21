import { siteUrl } from '@/shared/lib/site';
import { forStudiosJsonLd } from '../model/jsonLd';
import { CustomCursor, ScrollReveal } from './LandingEffects';
import { LandingNav } from './LandingNav';
import { LandingFooter } from './LandingFooter';
import { CtaSection, DemoSection, FeaturesSection, HeroSection, HowItWorksSection, PricingSection } from './Sections';
import '../styles/landing.css';

/**
 * The landing page for studio owners. Rendered on the server as static HTML; only the nav, the cursor, the scroll
 * reveal and the dashboard demo run in the browser.
 */
export function ForStudiosPage() {
  return (
    <div className="landing">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped, so no text can close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(forStudiosJsonLd(siteUrl('/for-studios'))).replace(/</g, '\\u003c'),
        }}
      />
      <CustomCursor />
      <LandingNav />
      <main>
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
      <ScrollReveal />
    </div>
  );
}
