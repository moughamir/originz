import type { Partner } from "@/lib/types";
import { generateImage } from "../utils";

export const PARTNERS: Partner[] = [
  {
    id: 1,
    name: "TechCorp",
    logo: "https://placehold.co/180x96/fff/000?text=TechCorp",
    website: "https://techcorp.com",
  },
  {
    id: 2,
    name: "GreenLife",
    logo: generateImage({
      text: "GreenLife",
      bg: "fff",
      fg: "000",
      dim: {
        w: 180,
        h: 96,
      },
    }),
    website: "https://greenlife.com",
  },
  {
    id: 3,
    name: "Urban Style",
    logo: "https://placehold.co/180x96/fff/000?text=Urban+Style",
    website: "https://urbanstyle.com",
  },
  {
    id: 4,
    name: "Wellness Co",
    logo: "https://placehold.co/180x96/fff/000?text=Wellness+Co",
    website: "https://wellness.com",
  },
];
