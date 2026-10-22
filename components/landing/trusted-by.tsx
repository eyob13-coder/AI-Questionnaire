export function TrustedBy() {
  const companies = [
    "CloudKin",
    "VaultStack",
    "TrustLayer",
    "ComplianceHQ",
    "DataForge",
    "Sentinels",
  ];

  return (
    <section className="relative py-12 border-y border-white/[0.04] bg-dark-2/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-widest text-light-4 font-semibold mb-6">
          Trusted by fast-moving security &amp; compliance teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-50">
          {companies.map((name) => (
            <span
              key={name}
              className="font-heading text-base sm:text-lg font-bold tracking-tight text-light-3 hover:text-light transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
