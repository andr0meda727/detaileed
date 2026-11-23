import { siteUrl } from '@/shared/lib/site';
import { forStudiosJsonLd } from '../model/jsonLd';
import { ScrollReveal } from './LandingEffects';
import { LandingNav } from './LandingNav';
import { LandingFooter } from './LandingFooter';
import { HeroSection } from './HeroSection';
import { CtaSection, DemoSection, FeaturesSection, HowItWorksSection, PricingSection } from './Sections';
import '../styles/landing.css';

/**
 * The landing page for studio owners. Rendered on the server as static HTML; only the theme switch, the scroll reveal
 * and the dashboard demo run in the browser.
 */
export function ForStudiosPage() {
  return (
    <div className="landing min-h-screen bg-background font-sans text-foreground antialiased">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped, so no text can close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(forStudiosJsonLd(siteUrl('/for-studios'))).replace(/</g, '\u003c'),
        }}
      />
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
