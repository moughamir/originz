export interface BaseImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onError?: () => void;
}
