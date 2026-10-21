export function Tarjeta({
  children,
  className = '',
  como: Como = 'div',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  como?: 'div' | 'section' | 'article' | 'li';
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Como className={`rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6 ${className}`} {...props}>
      {children}
    </Como>
  );
}
