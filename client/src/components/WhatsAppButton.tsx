import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5511999999999"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-green-500/30"
      style={{ background: "linear-gradient(135deg, #25d366, #128c7e)" }}
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-white fill-white" />
    </a>
  );
}
