import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add product to cart', async ({ page }) => {
    // Navigate to products page
    await page.click('text=Collections');
    await page.waitForURL('**/collections/all');

    // Click on first product
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForURL('**/products/**');

    // Add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Verify cart count updated
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Verify success toast
    await expect(page.locator('.toast')).toContainText('added to cart');
  });

  test('should update cart quantity', async ({ page }) => {
    // Add product to cart first
    await page.goto('/collections/all');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');

    // Open cart
    await page.click('[data-testid="cart-toggle"]');
    
    // Update quantity
    await page.click('[data-testid="quantity-increase"]');
    
    // Verify quantity updated
    await expect(page.locator('[data-testid="cart-quantity"]')).toHaveText('2');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/collections/all');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');

    // Open cart
    await page.click('[data-testid="cart-toggle"]');
    
    // Remove item
    await page.click('[data-testid="remove-item"]');
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0');
    await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();
  });

  test('should persist cart across page navigation', async ({ page }) => {
    // Add product to cart
    await page.goto('/collections/all');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');

    // Navigate to different page
    await page.goto('/about');
    
    // Verify cart count persists
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });

  test('should clear entire cart', async ({ page }) => {
    // Add multiple products to cart
    await page.goto('/collections/all');
    
    // Add first product
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Go back and add second product
    await page.goBack();
    await page.click('[data-testid="product-card"]:nth-child(2)');
    await page.click('[data-testid="add-to-cart-button"]');

    // Open cart and clear
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-testid="clear-cart"]');
    
    // Confirm clear
    await page.click('[data-testid="confirm-clear"]');
    
    // Verify cart is empty
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0');
  });
});