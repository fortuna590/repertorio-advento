import { Mail } from "lucide-react";

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
}

const socialLinks: SocialLink[] = [
  {
    name: "Instagram",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
      </svg>
    ),
    url: "https://www.instagram.com/louvamais.solutions?igsh=enh5eTIzYThic3R3",
    bgColor: "bg-gradient-to-br from-purple-500 to-pink-500",
    hoverColor: "hover:from-purple-600 hover:to-pink-600",
    textColor: "text-white",
  },
  {
    name: "WhatsApp",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.782 1.14l-.046.028-4.774.798.81-4.884a9.9 9.9 0 011.141-4.734 9.9 9.9 0 014.655-3.734C13.28 1.039 17.33 2.11 20.06 4.84c2.73 2.73 3.8 6.78 2.898 10.271-.9 3.467-3.9 6.148-7.368 6.758-3.468.61-7.08-.822-9.263-3.765l-.035-.041-4.842.806.667-4.657-.013-.032a9.9 9.9 0 011.141-4.738c1.025-1.92 2.605-3.537 4.543-4.752 1.938-1.216 4.154-1.823 6.359-1.822z" />
      </svg>
    ),
    url: "https://wa.me/5518996890414",
    bgColor: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    textColor: "text-white",
  },
  {
    name: "Email",
    icon: <Mail className="w-5 h-5" />,
    url: "mailto:contato@louvamais.com",
    bgColor: "bg-gradient-to-br from-blue-500 to-purple-500",
    hoverColor: "hover:from-blue-600 hover:to-purple-600",
    textColor: "text-white",
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
    small: "w-9 h-9",
    medium: "w-11 h-11",
    large: "w-14 h-14",
  };

  const iconSizeClasses = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-7 h-7",
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <div
      className={`flex ${
        layout === "horizontal" ? "flex-row gap-3 md:gap-4" : "flex-col gap-4"
      } items-center`}
    >
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full ${link.bgColor} ${link.hoverColor} ${link.textColor} transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md`}
        >
          <div className={iconSizeClasses[size]}>{link.icon}</div>
        </a>
      ))}
      {showLabels && layout === "vertical" && (
        <div className="mt-2 text-center">
          {socialLinks.map((link) => (
            <div key={link.name} className={`${textSizeClasses[size]} text-purple-300`}>
              {link.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
