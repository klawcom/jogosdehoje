import { WhatsAppIcon } from './icons/whatsapp-icon';

/**
 * Icon-only floating WhatsApp share button fixed at the bottom-right corner.
 */
export function FloatingWhatsAppButton({
  onClick,
  title = 'Compartilhar no WhatsApp',
}: {
  onClick: () => void;
  title?: string;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_4px_25px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <WhatsAppIcon className="h-6 w-6 fill-white" />
      </button>
    </div>
  );
}

