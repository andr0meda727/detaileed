import Image from 'next/image';

/** The logo mark and wordmark used in the landing page's nav and footer. */
export function LandingLogo() {
  return (
    <>
      <Image src="/detaileed-logo.svg" alt="" width={40} height={37} unoptimized className="nav-logo-img" />
      <span className="nav-logo-text">
        <span className="nav-logo-accent">D</span>etaileed
      </span>
    </>
  );
}
