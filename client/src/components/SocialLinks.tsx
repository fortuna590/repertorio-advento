import { Instagram, MessageCircle, Mail } from "lucide-react";

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const socialLinks: SocialLink[] = [
  {
    name: "Instagram",
    icon: <Instagram className="w-6 h-6" />,
    url: "https://www.instagram.com/louvamais.solutions?igsh=enh5eTIzYThic3R3",
    color: "hover:text-pink-400",
  },
  {
    name: "WhatsApp",
    icon: <MessageCircle className="w-6 h-6" />,
    url: "https://wa.me/5518996890414",
    color: "hover:text-green-400",
  },
  {
    name: "Email",
    icon: <Mail className="w-6 h-6" />,
    url: "mailto:contato@louvamais.com",
    color: "hover:text-purple-400",
  },
];

interface SocialLinksProps {
  layout?: "horizontal" | "vertical";
  size?: "small" | "medium" | "large";
  showLabels?: boolean;
}

export default function SocialLinks({
  layout = "horizontal",
  size = "medium",
  showLabels = false,
}: SocialLinksProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-12 h-12",
  };

  const iconSizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div
      className={`flex ${
        layout === "horizontal" ? "flex-row gap-4" : "flex-col gap-3"
      } items-center`}
    >
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-slate-700 text-purple-300 transition-all duration-300 ${link.color} hover:bg-slate-600 hover:scale-110`}
        >
          <div className={iconSizeClasses[size]}>{link.icon}</div>
        </a>
      ))}
    </div>
  );
}
