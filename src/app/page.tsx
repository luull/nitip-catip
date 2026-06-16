import { Globe, MessageCircle, User } from "lucide-react";

const WA_GROUP_LINK =
  "https://chat.whatsapp.com/GR91ffPlxPuI1jfG3ABrup?mode=gi_t";
const WA_PERSONAL_LINK = "https://wa.me/6281809010906";

const links = [
  {
    label: "Website Nitip Catip",
    description: "Order jastip merchandise & event",
    href: "/order",
    icon: Globe,
    bgClass: "bg-pink hover:bg-pink/80",
    isInternal: true,
  },
   {
    label: "Chat Admin Pribadi",
    description: "Hubungi admin langsung via WhatsApp",
    href: WA_PERSONAL_LINK,
    icon: User,
    bgClass: "bg-white hover:bg-gray-100",
    isInternal: false,
  },
  {
    label: "Grup WhatsApp Jastip",
    description: "Join grup untuk update produk jastip",
    href: WA_GROUP_LINK,
    icon: MessageCircle,
    bgClass: "bg-green hover:bg-green/80",
    isInternal: false,
  },
 
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFF8FB] text-black antialiased font-sans flex flex-col">
      {/* Decorative top border */}
      <div className="h-2 bg-pink border-b-4 border-black" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Profile / Brand */}
        <div className="text-center space-y-4 mb-12">
          <div className="w-66 h-50 mx-auto overflow-hidden">
            <img
              src="/icon-1.png"
              alt="Nitip Catip"
              className="w-full h-full object-cover"
            />
          </div>
          {/* <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider">
              Nitip Catip
            </h1>
            <p className="text-sm font-bold text-black/60 mt-1 tracking-widest uppercase">
              Jasa Titip Belanja
            </p>
          </div> */}
          {/* <p className="text-sm font-bold text-black/70 max-w-xs mx-auto leading-relaxed">
            Happy shopping untuk para pemalas, disini kita bakal bantu kalian buat dapetin barang yang kalian pengen, tanpa harus antri dan ribet beli tiket masuk
          </p> */}
        </div>

        {/* Link Buttons */}
        <div className="w-full max-w-md space-y-4">
          {links.map((link) => {
            const Icon = link.icon;
            const Tag = link.isInternal ? "a" : "a";
            const linkProps = link.isInternal
              ? { href: link.href }
              : { href: link.href, target: "_blank", rel: "noopener noreferrer" };

            return (
              <Tag
                key={link.label}
                {...linkProps}
                className={`block w-full ${link.bgClass} border-4 border-black p-5 shadow-nb-sm hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all group`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center shrink-0 shadow-nb-sm group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-base sm:text-lg uppercase tracking-wide leading-tight">
                      {link.label}
                    </p>
                    <p className="text-xs font-bold text-black/60 mt-0.5">
                      {link.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Tag>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-16 text-xs font-bold text-black/40 text-center">
          &copy; {new Date().getFullYear()} Nitip Catip &middot; Jasa Titip
        </p>
      </main>

      {/* Bottom border */}
      <div className="h-2 bg-black" />
    </div>
  );
}
