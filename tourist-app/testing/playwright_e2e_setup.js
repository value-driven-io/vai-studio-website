// 🎭 PLAYWRIGHT E2E BOOKING TEST SETUP
// Full frontend booking flow automation including Stripe

import { test, expect } from '@playwright/test'

// Test configuration
const STAGING_URL = 'http://localhost:3000' // Update with your staging URL
const TEST_TOUR_ID = '72baa47d-7d10-463d-bf0f-7e9d4e727034'

// Stripe test card details
const STRIPE_TEST_CARD = {
  number: '4242424242424242',
  expiry: '12/25',
  cvc: '123',
  zip: '12345'
}

test.describe('Complete Booking Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(STAGING_URL)

    // Wait for app to load
    await page.waitForLoadState('networkidle')
  })

  test('Full booking flow - Discover to Payment Success', async ({ page }) => {
    console.log('🧪 Starting full E2E booking test...')

    // Step 1: Navigate to Discover/Explore tab
    await test.step('Navigate to tours', async () => {
      await page.click('[data-testid="explore-tab"], .explore-tab, text=Explore')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.tour-card, .activity-card')).toBeVisible({ timeout: 10000 })
    })

    // Step 2: Find and click our test tour
    await test.step('Select test tour', async () => {
      // Try multiple selectors to find the tour
      const tourSelectors = [
        `[data-tour-id="${TEST_TOUR_ID}"]`,
        '.tour-card:has-text("Traditional Cooking Workshop")',
        '.activity-card:has-text("Traditional Cooking Workshop")',
        'text=Traditional Cooking Workshop'
      ]

      let tourFound = false
      for (const selector of tourSelectors) {
        try {
          const tourElement = page.locator(selector).first()
          if (await tourElement.isVisible({ timeout: 2000 })) {
            await tourElement.click()
            tourFound = true
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!tourFound) {
        throw new Error('Test tour not found on page')
      }

      await page.waitForLoadState('networkidle')
    })

    // Step 3: Click Book/Reserve button
    await test.step('Open booking modal', async () => {
      const bookingButtons = [
        '[data-testid="book-now-button"]',
        '[data-testid="book-tour-button"]',
        '.book-button',
        '.booking-button',
        'text=Book Now',
        'text=Reserve Now',
        'text=Book This Tour'
      ]

      let bookingOpened = false
      for (const selector of bookingButtons) {
        try {
          const button = page.locator(selector).first()
          if (await button.isVisible({ timeout: 2000 })) {
            await button.click()
            bookingOpened = true
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!bookingOpened) {
        throw new Error('Could not find booking button')
      }

      // Wait for booking modal/page to appear
      await expect(page.locator('.booking-modal, .booking-page, .booking-form')).toBeVisible({ timeout: 10000 })
    })

    // Step 4: Fill booking form
    await test.step('Fill booking details', async () => {
      // Customer name
      await page.fill('[data-testid="customer-name"], input[name="customer_name"], input[placeholder*="name" i]', 'Playwright Test User')

      // Email
      await page.fill('[data-testid="customer-email"], input[name="customer_email"], input[type="email"]', 'playwright-test@example.com')

      // Number of adults (if changeable)
      const adultsInput = page.locator('[data-testid="num-adults"], input[name="num_adults"]').first()
      if (await adultsInput.isVisible({ timeout: 1000 })) {
        await adultsInput.fill('1')
      }

      // Special requirements (optional)
      const requirementsField = page.locator('[data-testid="special-requirements"], textarea[name="special_requirements"]').first()
      if (await requirementsField.isVisible({ timeout: 1000 })) {
        await requirementsField.fill('Playwright automated test booking')
      }
    })

    // Step 5: Proceed to payment
    await test.step('Proceed to payment', async () => {
      const proceedButtons = [
        '[data-testid="proceed-to-payment"]',
        '[data-testid="continue-to-payment"]',
        'text=Continue to Payment',
        'text=Proceed to Payment',
        'text=Next'
      ]

      for (const selector of proceedButtons) {
        try {
          const button = page.locator(selector).first()
          if (await button.isVisible({ timeout: 2000 })) {
            await button.click()
            break
          }
        } catch (e) {
          continue
        }
      }

      // Wait for Stripe form to load
      await page.waitForLoadState('networkidle')
      await expect(page.frameLocator('iframe[title*="Secure payment"], iframe[name*="stripe"]')).toBeVisible({ timeout: 15000 })
    })

    // Step 6: Fill Stripe payment form
    await test.step('Fill payment details', async () => {
      // Get Stripe iframe
      const stripeFrame = page.frameLocator('iframe[title*="Secure payment"], iframe[name*="stripe"]').first()

      // Fill card number
      await stripeFrame.locator('[name="cardnumber"], [placeholder*="card number" i]').fill(STRIPE_TEST_CARD.number)

      // Fill expiry
      await stripeFrame.locator('[name="exp-date"], [placeholder*="MM"], [placeholder*="expiry" i]').fill(STRIPE_TEST_CARD.expiry)

      // Fill CVC
      await stripeFrame.locator('[name="cvc"], [placeholder*="CVC" i], [placeholder*="CVV" i]').fill(STRIPE_TEST_CARD.cvc)

      // Fill ZIP (if present)
      const zipField = stripeFrame.locator('[name="postal"], [placeholder*="ZIP" i]')
      if (await zipField.isVisible({ timeout: 2000 })) {
        await zipField.fill(STRIPE_TEST_CARD.zip)
      }
    })

    // Step 7: Submit payment
    await test.step('Submit booking', async () => {
      const submitButtons = [
        '[data-testid="submit-payment"]',
        '[data-testid="complete-booking"]',
        'text=Complete Booking',
        'text=Pay Now',
        'text=Submit Payment'
      ]

      for (const selector of submitButtons) {
        try {
          const button = page.locator(selector).first()
          if (await button.isVisible({ timeout: 2000 })) {
            await button.click()
            break
          }
        } catch (e) {
          continue
        }
      }

      // Wait for processing
      await page.waitForLoadState('networkidle', { timeout: 30000 })
    })

    // Step 8: Verify success
    await test.step('Verify booking success', async () => {
      // Look for success indicators
      const successSelectors = [
        '.booking-success',
        '.success-message',
        'text=Booking Confirmed',
        'text=Success',
        'text=Thank you'
      ]

      let successFound = false
      for (const selector of successSelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 5000 })) {
            successFound = true
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!successFound) {
        // Take screenshot for debugging
        await page.screenshot({ path: 'booking-failed.png', fullPage: true })
        throw new Error('Booking success not detected')
      }

      console.log('✅ Booking completed successfully!')
    })
  })

  test('Booking form validation', async ({ page }) => {
    // Test form validation without submitting
    await test.step('Test required field validation', async () => {
      // Navigate to booking form (similar to above)
      await page.goto(`${STAGING_URL}/explore`)

      // Open booking modal (simplified)
      await page.click('.tour-card:has-text("Traditional Cooking Workshop")')
      await page.click('text=Book Now')

      // Try to submit without filling required fields
      await page.click('[data-testid="proceed-to-payment"], text=Continue')

      // Verify validation messages appear
      await expect(page.locator('.error-message, .validation-error')).toBeVisible()
    })
  })

  test('Mobile booking flow', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile')

    // Same test as above but for mobile devices
    // Mobile-specific interactions and assertions
  })
})

// Helper functions
export const bookingTestHelpers = {
  // Clean up test bookings
  async cleanupTestBookings() {
    // Implementation to cancel/delete test bookings
    console.log('🧹 Cleaning up test bookings...')
  },

  // Wait for Stripe to load
  async waitForStripe(page) {
    await page.waitForFunction(() => window.Stripe !== undefined, { timeout: 10000 })
  },

  // Take debugging screenshot
  async debugScreenshot(page, name) {
    await page.screenshot({
      path: `debug-${name}-${Date.now()}.png`,
      fullPage: true
    })
  }
}