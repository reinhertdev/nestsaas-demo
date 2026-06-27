export function DemoBanner() {
  return (
    <div className="w-full bg-foreground text-background px-4 py-2 text-center text-sm">
      <span className="opacity-80">
        Live demo — sign in with{' '}
        <strong className="opacity-100">demo@nestsaas.com</strong> /{' '}
        <strong className="opacity-100">demo1234</strong>
      </span>
      <span className="mx-3 opacity-30">|</span>
      <a
        href={process.env.NEXT_PUBLIC_PURCHASE_URL ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline underline-offset-2 hover:opacity-80"
      >
        Get NestSaaS →
      </a>
    </div>
  );
}
