import Image from "next/image";

interface PaymentMethodProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
}

function PaymentMethod({
  src,
  alt,
  width = 36,
  height = 24,
}: PaymentMethodProps) {
  return (
    <div className="flex justify-center items-center bg-white p-1 border border-gray-200 rounded">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
}

export function PaymentMethods() {
	return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Credit Cards */}
      <PaymentMethod src="/payment-logos/cards/visa.svg" alt="Visa" />
      <PaymentMethod
        src="/payment-logos/cards/mastercard.svg"
        alt="Mastercard"
      />
      <PaymentMethod
        src="/payment-logos/cards/american-express.svg"
        alt="American Express"
      />
      <PaymentMethod src="/payment-logos/cards/discover.svg" alt="Discover" />
      <PaymentMethod src="/payment-logos/cards/jcb.svg" alt="JCB" />

      {/* Digital Wallets */}
      <PaymentMethod
        src="/payment-logos/wallets/apple-pay.svg"
        alt="Apple Pay"
      />
      <PaymentMethod
        src="/payment-logos/wallets/google-pay.svg"
        alt="Google Pay"
      />
      <PaymentMethod src="/payment-logos/apm/paypal.svg" alt="PayPal" />
    </div>
  );
}
