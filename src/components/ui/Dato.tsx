// Un dato con su rótulo, dentro de una lista de definiciones (<dl>).
export function Dato({ termino, children, className = '' }: { termino: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[0.9375rem] text-tinta-suave">{termino}</dt>
      <dd className="mt-0.5 font-semibold">{children}</dd>
    </div>
  );
}
