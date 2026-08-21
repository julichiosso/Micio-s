export default function Footer() {
  return (
    <div className="relative pb-8 pt-4 flex flex-col items-center gap-1.5 overflow-hidden">
      <span
        className="absolute inset-x-0 text-center text-[56px] font-black text-black/[0.03] tracking-tighter select-none pointer-events-none"
        style={{ fontFamily: "var(--font-heading)", top: "50%", transform: "translateY(-50%)" }}
        aria-hidden="true"
      >
        MICIO&apos;S
      </span>
      
       <a href="https://instagram.com/webya.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-black/25 text-[11px] tracking-wider hover:text-black/40 transition-colors font-medium uppercase"
      >
        Impulsado por <span className="font-bold text-black/35">Webya</span>
      </a>
      <p className="text-black/15 text-[10px]">Micio&apos;s Pizzería · San Jorge, Santa Fe</p>
    </div>
  );
}