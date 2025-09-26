import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { FEATURED_PRODUCTS } from '@/lib/data/products'

export async function FeaturedProducts() {
  const products = await FEATURED_PRODUCTS

  return (
    <section className="py-16 lg:py-24">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Discover our most popular and trending items
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
