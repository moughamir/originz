import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/contexts/cart-context';
import type { ApiProduct, ApiProductVariant } from '@/lib/types';

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Test component that uses the cart context
const TestComponent = () => {
  const cart = useCart();
  
  return (
    <div>
      <div data-testid="cart-items-count">{cart.getTotalItems()}</div>
      <div data-testid="cart-total-price">{cart.getTotalPrice()}</div>
      <div data-testid="cart-is-open">{cart.isOpen ? 'open' : 'closed'}</div>
      <button 
        data-testid="toggle-cart"
        onClick={cart.toggleCart}
      >
        Toggle Cart
      </button>
      <button 
        data-testid="add-item"
        onClick={() => cart.addItem(mockProduct, mockVariant, 2)}
      >
        Add Item
      </button>
      <button 
        data-testid="remove-item"
        onClick={() => cart.removeItem(mockProduct.id, mockVariant.id)}
      >
        Remove Item
      </button>
      <button 
        data-testid="update-quantity"
        onClick={() => cart.updateQuantity(mockProduct.id, mockVariant.id, 5)}
      >
        Update Quantity
      </button>
      <button 
        data-testid="clear-cart"
        onClick={cart.clearCart}
      >
        Clear Cart
      </button>
    </div>
  );
};

const mockProduct: ApiProduct = {
  id: '1',
  title: 'Test Product',
  handle: 'test-product',
  body_html: '<p>Test product description</p>',
  price: 29.99,
  compare_at_price: 39.99,
  images: [
    {
      id: '1',
      product_id: '1',
      position: 1,
      alt: 'Test product image',
      src: 'https://example.com/image.jpg',
      width: 800,
      height: 600,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  product_type: 'Test Type',
  in_stock: true,
  rating: 4.5,
  review_count: 10,
  tags: 'test,product',
  vendor: 'Test Vendor',
  variants: [
    {
      id: '1',
      product_id: '1',
      title: 'Default Title',
      option1: 'Red',
      option2: 'Large',
      sku: 'TEST-001',
      requires_shipping: true,
      taxable: true,
      featured_image: 'https://example.com/image.jpg',
      available: true,
      price: 29.99,
      grams: 500,
      compare_at_price: 39.99,
      position: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  options: [
    {
      id: '1',
      product_id: '1',
      name: 'Color',
      position: 1,
      values: ['Red', 'Blue', 'Green'],
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockVariant: ApiProductVariant = mockProduct.variants[0];

describe('CartProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  it('should provide cart context to children', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total-price')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-is-open')).toHaveTextContent('closed');
  });

  it('should add items to cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('59.98');
    });
  });

  it('should remove items from cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item first
    await user.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('2');
    });

    // Remove item
    await user.click(screen.getByTestId('remove-item'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('0');
    });
  });

  it('should update item quantity', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item first
    await user.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('2');
    });

    // Update quantity
    await user.click(screen.getByTestId('update-quantity'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('5');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('149.95');
    });
  });

  it('should clear cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item first
    await user.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('2');
    });

    // Clear cart
    await user.click(screen.getByTestId('clear-cart'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('0');
    });
  });

  it('should toggle cart open/closed state', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-is-open')).toHaveTextContent('closed');

    await user.click(screen.getByTestId('toggle-cart'));

    expect(screen.getByTestId('cart-is-open')).toHaveTextContent('open');

    await user.click(screen.getByTestId('toggle-cart'));

    expect(screen.getByTestId('cart-is-open')).toHaveTextContent('closed');
  });

  it('should persist cart to localStorage when user is not authenticated', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await user.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'originz-cart',
        expect.stringContaining('Test Product')
      );
    });
  });

  it('should handle adding same product variant multiple times', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item twice
    await user.click(screen.getByTestId('add-item'));
    await user.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('4');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('119.96');
    });
  });

  it('should handle removing item with quantity 0', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add item first
    await user.click(screen.getByTestId('add-item'));
    
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('2');
    });

    // Update quantity to 0 (should remove item)
    await user.click(screen.getByTestId('update-quantity'));
    
    // Manually trigger updateQuantity with 0
    act(() => {
      const cart = useCart();
      cart.updateQuantity(mockProduct.id, mockVariant.id, 0);
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0');
    });
  });
});

describe('useCart hook', () => {
  it('should throw error when used outside CartProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');

    console.error = originalError;
  });
});