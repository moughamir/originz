import { test, expect } from '@playwright/test';

test.describe('Checkout Process', () => {
  test.beforeEach(async ({ page }) => {
    // Add product to cart
    await page.goto('/collections/all');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');
  });

  test('should complete checkout flow', async ({ page }) => {
    // Go to checkout
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Fill shipping information
    await page.fill('[data-testid="shipping-first-name"]', 'John');
    await page.fill('[data-testid="shipping-last-name"]', 'Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.fill('[data-testid="shipping-city"]', 'New York');
    await page.fill('[data-testid="shipping-state"]', 'NY');
    await page.fill('[data-testid="shipping-zip"]', '10001');
    await page.fill('[data-testid="shipping-phone"]', '+1234567890');

    // Fill billing information
    await page.check('[data-testid="different-billing"]');
    await page.fill('[data-testid="billing-first-name"]', 'John');
    await page.fill('[data-testid="billing-last-name"]', 'Doe');
    await page.fill('[data-testid="billing-address"]', '123 Main St');
    await page.fill('[data-testid="billing-city"]', 'New York');
    await page.fill('[data-testid="billing-state"]', 'NY');
    await page.fill('[data-testid="billing-zip"]', '10001');

    // Fill payment information
    await page.fill('[data-testid="card-number"]', '4111111111111111');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvv"]', '123');
    await page.fill('[data-testid="card-name"]', 'John Doe');

    // Submit order
    await page.click('[data-testid="place-order"]');
    
    // Verify success
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Try to submit without filling required fields
    await page.click('[data-testid="place-order"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="shipping-first-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-last-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-city-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-state-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-zip-error"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Fill invalid email
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.click('[data-testid="place-order"]');
    
    // Verify email validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
  });

  test('should validate phone number format', async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Fill invalid phone
    await page.fill('[data-testid="shipping-phone"]', 'invalid-phone');
    await page.click('[data-testid="place-order"]');
    
    // Verify phone validation error
    await expect(page.locator('[data-testid="shipping-phone-error"]')).toContainText('Invalid phone number');
  });

  test('should validate credit card number', async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Fill invalid card number
    await page.fill('[data-testid="card-number"]', '1234');
    await page.click('[data-testid="place-order"]');
    
    // Verify card validation error
    await expect(page.locator('[data-testid="card-number-error"]')).toContainText('Invalid card number');
  });

  test('should show order summary', async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Verify order summary is visible
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="subtotal"]')).toBeVisible();
    await expect(page.locator('[data-testid="tax"]')).toBeVisible();
    await expect(page.locator('[data-testid="total"]')).toBeVisible();
  });

  test('should apply discount code', async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Apply discount code
    await page.fill('[data-testid="discount-code"]', 'SAVE10');
    await page.click('[data-testid="apply-discount"]');
    
    // Verify discount applied
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="total"]')).toContainText('$');
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="checkout-button"]');
    
    await page.waitForURL('**/checkout');

    // Fill form with valid data
    await page.fill('[data-testid="shipping-first-name"]', 'John');
    await page.fill('[data-testid="shipping-last-name"]', 'Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.fill('[data-testid="shipping-city"]', 'New York');
    await page.fill('[data-testid="shipping-state"]', 'NY');
    await page.fill('[data-testid="shipping-zip"]', '10001');
    await page.fill('[data-testid="shipping-phone"]', '+1234567890');

    // Use declined card
    await page.fill('[data-testid="card-number"]', '4000000000000002');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvv"]', '123');
    await page.fill('[data-testid="card-name"]', 'John Doe');

    // Submit order
    await page.click('[data-testid="place-order"]');
    
    // Verify payment error
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText('payment');
  });
});