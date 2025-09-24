export const SITE_CONFIG = {
  name: "OriGinz",
  description: "Premium e-commerce storefront built with Next.js",
  domain: "originz.vercel.app",
  url: "https://originz.vercel.app",
  ogImage: "https://originz.vercel.app/og.jpg",
  author: "OriGinz Team",
  lastUpdate: "June 30, 2025",
  keywords: [
    "e-commerce",
    "online store",
    "shopping",
    "retail",
    "products",
    "storefront",
  ],
};

export const buildEmail = (handle: string, ltd: string = SITE_CONFIG.domain) =>
  `${handle}@${ltd}`;

export const buildPhone = (ext: number, callSign: string, zone?: number) =>
  `+${ext} ${zone ? `(${zone})` : ""} ${callSign}`;

export const buildAddress = ({
  street,
  city,
  state,
  zipCode,
}: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}): string => `${street}, ${city},<br/> ${state} ${zipCode}`;
export const APP_CONTACTS = {
  email: {
    getInTouch: buildEmail("hello"),
    shipping: buildEmail("shipping"),
    legal: buildEmail("legal"),
    rewards: buildEmail("rewards"),
    support: buildEmail("support"),
    privacy: buildEmail("privacy"),
    dmca: buildEmail("dmca"),
  },
  phone: {
    main: buildPhone(1, "123-4567", 555),
  },
  address: {
    office: buildAddress({
      street: "123 Commerce St",
      city: "Valhalla",
      state: "Asgard",
      zipCode: "1525-5VG",
    }),
  },
};
export const NAVIGATION_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Shipping Info", href: "/shipping-delivery" },
    { name: "Returns", href: "/returns-exchange" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Rewards Terms", href: "/rewards-terms" },
  ],
};
