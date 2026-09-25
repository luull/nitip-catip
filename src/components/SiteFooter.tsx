import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Globe,
  History,
  MessageCircle,
  Phone,
  ShoppingCart,
} from "lucide-react";

const WA_GROUP_URL =
  "https://chat.whatsapp.com/GR91ffPlxPuI1jfG3ABrup?mode=gi_t";
const WA_ADMIN_NUMBER =
  process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || "6281809010906";
const INSTAGRAM_URL = "https://www.instagram.com/nitipcatip.id/";

const navigationLinks = [
  { href: "/order#request-form", label: "Form Pemesanan" },
  { href: "/cart", label: "Keranjang Saya", icon: ShoppingCart },
  { href: "/riwayat", label: "Riwayat Pesanan", icon: History },
];

export default function SiteFooter() {
  return (
    <footer className="border-t-4 border-black bg-black text-white">
      <div className="h-2 bg-pink" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-12 lg:px-8 lg:py-16">
        <div className="space-y-5">
          <Link
            href="/order"
            aria-label="Kembali ke halaman utama Nitip Catip"
            className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            <Image
              src="/icon-2.png"
              width={120}
              height={96}
              alt="Nitip Catip"
              className="h-20 w-auto object-contain"
            />
          </Link>
          <p className="max-w-md text-sm font-bold leading-relaxed text-white/70">
            Jasa titip belanja yang membantu kamu mendapatkan produk pilihan
            dengan proses yang mudah, transparan, dan terpercaya.
          </p>
          <span className="inline-flex border-2 border-white/30 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-green">
            Belanja titipan jadi lebih praktis
          </span>
        </div>

        <nav aria-label="Navigasi footer">
          <h2 className="mb-4 w-fit border-b-2 border-pink pb-1 text-sm font-black uppercase tracking-wider text-pink">
            Navigasi
          </h2>
          <ul className="space-y-1 text-sm font-bold">
            {navigationLinks.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-10 items-center gap-2 py-2 text-white/80 transition-colors hover:text-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
                >
                  {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={WA_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 py-2 text-white/80 transition-colors hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Grup WhatsApp Jastip
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 w-fit border-b-2 border-green pb-1 text-sm font-black uppercase tracking-wider text-green">
            Hubungi Kami
          </h2>
          <ul className="space-y-1 text-sm font-bold">
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 py-2 text-white/80 transition-colors hover:text-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                @nitipcatip.id
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${WA_ADMIN_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 py-2 text-white/80 transition-colors hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                0818-0901-0906
              </a>
            </li>
            <li className="flex min-h-10 items-center gap-2 py-2 text-white/70">
              <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Setiap hari, 09.00–17.00 WIB</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t-2 border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs font-bold text-white/50 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>&copy; {new Date().getFullYear()} Nitip Catip Jasa Titip.</p>
          <p>Dibuat untuk pengalaman jastip yang aman dan nyaman.</p>
        </div>
      </div>
    </footer>
  );
}
