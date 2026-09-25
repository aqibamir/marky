// The priority-road diamond: ink outline, a surface-coloured band and a
// road-sign-yellow centre. Plain geometry - the app has no logo file.
export default function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 .8L23.2 12 12 23.2.8 12z" className="fill-foreground" />
      <path d="M12 2.4L21.6 12 12 21.6 2.4 12z" className="fill-card" />
      <path d="M12 5.2L18.8 12 12 18.8 5.2 12z" className="fill-signal" />
    </svg>
  );
}
