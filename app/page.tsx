import { ShowNewsletterOnce } from "@blocks/common/show-newsletter-once";
import { PageLayout } from "@blocks/layout/page-layout";
import { FeaturedProducts } from "@blocks/sections/featured-products";
import { Hero } from "@blocks/sections/hero";
import { InfoSections } from "@blocks/sections/info-sections";
import { Partners } from "@blocks/sections/partners";
import { Reviews } from "@blocks/sections/reviews";
import { generateSEO } from "@/lib/seo";

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export const metadata = generateSEO({
	title: "Premium E-Commerce Store",
	description:
		"Discover premium products with exceptional quality and service. Shop our curated collection of the latest trends and timeless classics.",
});

export default function HomePage() {
	return (
		<PageLayout>
			<Hero />
			<FeaturedProducts />
			<InfoSections />
			<Partners />
			<Reviews />
			<ShowNewsletterOnce />
		</PageLayout>
	);
}
