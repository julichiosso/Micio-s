import Image from "next/image";

export default function FooterInfo() {
  return (
    <div className="pb-8 pt-6 flex flex-col items-center gap-3">
      <Image
        src="/micios_logo_white.svg"
        alt="Micio's"
        width={80}
        height={30}
        className="h-6 w-auto opacity-40"
      />
      <div className="flex flex-col items-center gap-1.5">
        <a
          href="https://instagram.com/webya.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/25 text-[11px] tracking-wider hover:text-white/40 transition-colors font-medium uppercase"
        >
          Impulsado por <span className="font-bold text-white/40">Webya</span>
        </a>
        <p className="text-white/15 text-[10px]">
          Micio&apos;s Pizzería · San Jorge, Santa Fe
        </p>
      </div>
    </div>
  );
}