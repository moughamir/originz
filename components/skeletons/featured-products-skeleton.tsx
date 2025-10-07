import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton";

export function FeaturedProductsSkeleton() {
	return (
		<div className="bg-white py-12">
			<div className="px-4 container">
				{/* Section header */}
				<div className="mb-12 text-center">
					<Skeleton className="mx-auto mb-4 w-48 h-8" />
					<Skeleton className="mx-auto w-96 h-4" />
				</div>

				{/* Featured product grid */}
				<div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<ProductCardSkeleton key={`${Date.now()}-${i}`} />
					))}
				</div>

				{/* View all button skeleton */}
				<div className="mt-12 text-center">
					<Skeleton className="mx-auto rounded-md w-32 h-12" />
				</div>
			</div>
		</div>
	);
}

export function HeroSectionSkeleton() {
	return (
		<div className="relative flex items-center bg-gray-100 min-h-[500px]">
			<div className="px-4 container">
				<div className="items-center gap-12 grid lg:grid-cols-2">
					{/* Content skeleton */}
					<div className="space-y-6">
						<Skeleton className="w-3/4 h-12" />
						<Skeleton className="w-full h-6" />
						<Skeleton className="w-2/3 h-6" />
						<div className="flex space-x-4">
							<Skeleton className="rounded-md w-32 h-12" />
							<Skeleton className="rounded-md w-32 h-12" />
						</div>
					</div>

					{/* Image skeleton */}
					<div className="relative aspect-square">
						<Skeleton className="rounded-lg w-full h-full" />
					</div>
				</div>
			</div>
		</div>
	);
}
