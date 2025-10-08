import { Star } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Review {
  count: number;
  rating?: number;
  avatars: {
    src: string;
    alt: string;
  }[];
}

interface ReviewsProps {
  reviews: Review;
  avatarClassName?: string;
}

export function Reviews({ reviews, avatarClassName }: ReviewsProps) {
  return (
    <div className="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row">
      <span className="mx-4 inline-flex items-center -space-x-4">
        {reviews.avatars.map((avatar, index) => (
          <Avatar key={index} className={cn("border", avatarClassName)}>
            <AvatarImage src={avatar.src} alt={avatar.alt} />
          </Avatar>
        ))}
      </span>
      <div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="size-5 fill-yellow-400 text-yellow-400"
            />
          ))}
          <span className="mr-1 font-semibold">
            {reviews.rating?.toFixed(1)}
          </span>
        </div>
        <p className="text-muted-foreground text-left font-medium">
          from {reviews.count}+ reviews
        </p>
      </div>
    </div>
  );
}
