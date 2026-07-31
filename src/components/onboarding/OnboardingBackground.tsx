import Image from "next/image";

function OnboardingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden="true">
      <Image
        src="/onboarding/onboarding-2.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30"
      />
    </div>
  );
}

export { OnboardingBackground };
