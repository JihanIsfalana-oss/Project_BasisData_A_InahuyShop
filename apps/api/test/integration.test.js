import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const runDatabaseIntegration = process.env.RUN_DB_INTEGRATION === 'true'

test(
  'MySQL commerce integration: mixed checkout, payment, ownership, downloads, shipment, and reviews',
  { skip: !runDatabaseIntegration },
  async () => {
    const [{ prisma }, { createApp }] = await Promise.all([
      import('@inahuyshop/database'),
      import('../src/app.js'),
    ])
    const storageRoot = await mkdtemp(join(tmpdir(), 'inahuyshop-private-assets-'))
    process.env.DIGITAL_STORAGE_ROOT = storageRoot
    await mkdir(join(storageRoot, 'ebooks'))
    const fileContent = Buffer.from('private digital asset fixture')
    await writeFile(join(storageRoot, 'ebooks', 'fixture.bin'), fileContent)

    const server = createApp({
      prisma,
      checkDatabase: () => prisma.$queryRaw`SELECT 1`,
    }).listen(0, '127.0.0.1')
    await once(server, 'listening')
    const baseUrl = `http://127.0.0.1:${server.address().port}`

    async function request(path, { method = 'GET', token, body, headers = {} } = {}) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      })
      if (response.status === 204) return { response, data: null }
      const contentType = response.headers.get('content-type') ?? ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.arrayBuffer()
      return { response, data }
    }

    try {
      const adminLogin = await request('/api/v1/auth/admin/login', {
        method: 'POST',
        body: { identifier: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD },
      })
      assert.equal(adminLogin.response.status, 200)
      const adminToken = adminLogin.data.data.token

      const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const register = await request('/api/v1/auth/register', {
        method: 'POST',
        body: {
          fullName: 'Integration Customer',
          email: `customer-${suffix}@example.test`,
          phone: `+628${String(Date.now()).slice(-9)}`,
          password: 'integration-password-123',
          birthDate: '2000-01-02',
        },
      })
      assert.equal(register.response.status, 201)
      const customerToken = register.data.data.token

      const otherRegister = await request('/api/v1/auth/register', {
        method: 'POST',
        body: {
          fullName: 'Other Customer',
          email: `other-${suffix}@example.test`,
          phone: `+628${String(Date.now() - 1).slice(-9)}`,
          password: 'integration-password-456',
          birthDate: '2000-01-03',
        },
      })
      assert.equal(otherRegister.response.status, 201)
      const otherToken = otherRegister.data.data.token
      const otherAddress = await request('/api/v1/customer/addresses', {
        method: 'POST',
        token: otherToken,
        body: {
          label: 'Home',
          street: '2 Test Street',
          district: 'Test District',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
      })
      assert.equal(otherAddress.response.status, 201)

      const categoryResponse = await request('/api/v1/admin/categories', {
        method: 'POST',
        token: adminToken,
        body: { name: 'Integration Category', slug: `integration-${suffix}` },
      })
      assert.equal(categoryResponse.response.status, 201)
      const categoryId = categoryResponse.data.data.categoryId

      const productResponse = await request('/api/v1/admin/products', {
        method: 'POST',
        token: adminToken,
        body: {
          name: 'Integration Mixed Product',
          categoryId,
          variants: [
            {
              sku: `DIG-${suffix}`,
              variantName: 'Digital',
              price: 2500,
              stockQty: 0,
              deliveryType: 'digital',
            },
            {
              sku: `PHY-${suffix}`,
              variantName: 'Physical',
              price: 1200,
              stockQty: 10,
              weightGram: 300,
              deliveryType: 'physical',
            },
          ],
        },
      })
      assert.equal(productResponse.response.status, 201)
      const digitalVariant = productResponse.data.data.variants.find(
        (variant) => variant.deliveryType === 'digital',
      )
      const physicalVariant = productResponse.data.data.variants.find(
        (variant) => variant.deliveryType === 'physical',
      )

      const assetResponse = await request(
        `/api/v1/admin/variants/${digitalVariant.variantId}/digital-assets`,
        {
          method: 'POST',
          token: adminToken,
          body: {
            fileUrl: 'ebooks/fixture.bin',
            fileName: 'fixture.bin',
            fileSize: fileContent.length,
          },
        },
      )
      assert.equal(assetResponse.response.status, 201)

      const voucherResponse = await request('/api/v1/admin/vouchers', {
        method: 'POST',
        token: adminToken,
        body: {
          code: `SAVE-${suffix}`,
          discountType: 'percentage',
          discountValue: 10,
          minPurchase: 0,
          usageLimit: 1,
          validUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      })
      assert.equal(voucherResponse.response.status, 201)

      const addressResponse = await request('/api/v1/customer/addresses', {
        method: 'POST',
        token: customerToken,
        body: {
          label: 'Home',
          street: '1 Test Street',
          district: 'Test District',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
      })
      assert.equal(addressResponse.response.status, 201)
      const addressId = addressResponse.data.data.addressId

      for (const [variantId, quantity] of [
        [physicalVariant.variantId, 2],
        [digitalVariant.variantId, 1],
      ]) {
        const added = await request('/api/v1/customer/cart/items', {
          method: 'POST',
          token: customerToken,
          body: { variantId, quantity },
        })
        assert.equal(added.response.status, 200)
      }

      const idempotencyKey = `integration-${suffix}`
      const checkout = await request('/api/v1/customer/checkout', {
        method: 'POST',
        token: customerToken,
        headers: { 'idempotency-key': idempotencyKey },
        body: { addressId, voucherCode: `SAVE-${suffix}` },
      })
      assert.equal(checkout.response.status, 201)
      const order = checkout.data.data
      assert.equal(Number(order.subtotal), 4900)
      assert.equal(Number(order.discountAmount), 490)
      assert.equal(Number(order.grandTotal), 4410)
      assert.equal(order.status, 'pending_payment')

      const retryCheckout = await request('/api/v1/customer/checkout', {
        method: 'POST',
        token: customerToken,
        headers: { 'idempotency-key': idempotencyKey },
        body: { addressId, voucherCode: `SAVE-${suffix}` },
      })
      assert.equal(retryCheckout.response.status, 200)
      assert.equal(retryCheckout.data.data.orderId, order.orderId)
      assert.equal(retryCheckout.data.meta.idempotentReplay, true)

      const hiddenOrder = await request(`/api/v1/customer/orders/${order.orderId}`, {
        token: otherToken,
      })
      assert.equal(hiddenOrder.response.status, 404)

      const catalog = await request(`/api/v1/products/${productResponse.data.data.productId}`)
      assert.equal(catalog.response.status, 200)
      assert.equal(
        catalog.data.data.variants.find((variant) => variant.deliveryType === 'digital')
          .hasDigitalAssets,
        true,
      )

      const paid = await request(`/api/v1/customer/orders/${order.orderId}/payment/simulate`, {
        method: 'POST',
        token: customerToken,
        body: { status: 'success' },
      })
      assert.equal(paid.response.status, 200)
      assert.equal(paid.data.data.status, 'paid')
      const digitalItem = paid.data.data.items.find((item) => item.deliveryType === 'digital')
      const physicalItem = paid.data.data.items.find((item) => item.deliveryType === 'physical')
      assert.equal(digitalItem.digitalDeliveries.length, 1)

      const downloadToken = await request(
        `/api/v1/customer/digital-deliveries/${digitalItem.digitalDeliveries[0].deliveryId}/token`,
        { method: 'POST', token: customerToken },
      )
      assert.equal(downloadToken.response.status, 200)
      const downloadPath = downloadToken.data.data.downloadUrl
      const staleDownloadHeaders = {
        'x-download-token': downloadToken.data.data.downloadToken,
      }

      const rotatedDownloadToken = await request(
        `/api/v1/customer/digital-deliveries/${digitalItem.digitalDeliveries[0].deliveryId}/token`,
        { method: 'POST', token: customerToken },
      )
      assert.equal(rotatedDownloadToken.response.status, 200)
      const downloadHeaders = {
        'x-download-token': rotatedDownloadToken.data.data.downloadToken,
      }

      const staleDownload = await request(downloadPath, {
        token: customerToken,
        headers: staleDownloadHeaders,
      })
      assert.equal(staleDownload.response.status, 404)

      const forbiddenDownload = await request(downloadPath, {
        token: otherToken,
        headers: downloadHeaders,
      })
      assert.equal(forbiddenDownload.response.status, 404)

      const download = await request(downloadPath, {
        token: customerToken,
        headers: downloadHeaders,
      })
      assert.equal(download.response.status, 200)
      assert.deepEqual(Buffer.from(download.data), fileContent)

      const processing = await request(`/api/v1/admin/orders/${order.orderId}/status`, {
        method: 'PATCH',
        token: adminToken,
        body: { status: 'processing' },
      })
      assert.equal(processing.response.status, 200)

      const shipment = await request(`/api/v1/admin/orders/${order.orderId}/shipment`, {
        method: 'POST',
        token: adminToken,
        body: {
          courier: 'Test Courier',
          serviceType: 'Regular',
          trackingNumber: `TRACK-${suffix}`,
        },
      })
      assert.equal(shipment.response.status, 201)
      for (const status of ['in_transit', 'out_for_delivery', 'delivered']) {
        const tracking = await request(
          `/api/v1/admin/shipments/${shipment.data.data.shipmentId}/tracking`,
          {
            method: 'POST',
            token: adminToken,
            body: { status },
          },
        )
        assert.equal(tracking.response.status, 201)
      }

      const review = await request(
        `/api/v1/customer/order-items/${physicalItem.orderItemId}/reviews`,
        {
          method: 'POST',
          token: customerToken,
          body: { rating: 5, comment: 'Verified integration review' },
        },
      )
      assert.equal(review.response.status, 201)

      const completed = await request(`/api/v1/customer/orders/${order.orderId}`, {
        token: customerToken,
      })
      assert.equal(completed.data.data.status, 'completed')
      assert.equal(completed.data.data.shipment.tracking.at(-1).status, 'delivered')

      const duplicateReview = await request(
        `/api/v1/customer/order-items/${physicalItem.orderItemId}/reviews`,
        {
          method: 'POST',
          token: customerToken,
          body: { rating: 4 },
        },
      )
      assert.equal(duplicateReview.response.status, 409)

      await request('/api/v1/customer/cart/items', {
        method: 'POST',
        token: customerToken,
        body: { variantId: physicalVariant.variantId, quantity: 1 },
      })
      const exhaustedVoucher = await request('/api/v1/customer/checkout', {
        method: 'POST',
        token: customerToken,
        headers: { 'idempotency-key': `voucher-${suffix}` },
        body: { addressId, voucherCode: `SAVE-${suffix}` },
      })
      assert.equal(exhaustedVoucher.response.status, 409)
      assert.equal(exhaustedVoucher.data.error.code, 'VOUCHER_EXHAUSTED')

      const failedCheckout = await request('/api/v1/customer/checkout', {
        method: 'POST',
        token: customerToken,
        headers: { 'idempotency-key': `failed-${suffix}` },
        body: { addressId },
      })
      assert.equal(failedCheckout.response.status, 201)
      const failedPayment = await request(
        `/api/v1/customer/orders/${failedCheckout.data.data.orderId}/payment/simulate`,
        {
          method: 'POST',
          token: customerToken,
          body: { status: 'failed' },
        },
      )
      assert.equal(failedPayment.response.status, 200)
      assert.equal(failedPayment.data.data.status, 'cancelled')
      const restoredVariant = await prisma.productVariant.findUnique({
        where: { variantId: physicalVariant.variantId },
      })
      assert.equal(restoredVariant.stockQty, 8)

      for (const token of [customerToken, otherToken]) {
        const added = await request('/api/v1/customer/cart/items', {
          method: 'POST',
          token,
          body: { variantId: physicalVariant.variantId, quantity: 6 },
        })
        assert.equal(added.response.status, 200)
      }
      const concurrentResults = await Promise.all([
        request('/api/v1/customer/checkout', {
          method: 'POST',
          token: customerToken,
          headers: { 'idempotency-key': `race-a-${suffix}` },
          body: { addressId },
        }),
        request('/api/v1/customer/checkout', {
          method: 'POST',
          token: otherToken,
          headers: { 'idempotency-key': `race-b-${suffix}` },
          body: { addressId: otherAddress.data.data.addressId },
        }),
      ])
      assert.deepEqual(concurrentResults.map(({ response }) => response.status).sort(), [201, 409])
      const winningOrder = concurrentResults.find(({ response }) => response.status === 201).data
        .data
      const cancelled = await request(`/api/v1/admin/orders/${winningOrder.orderId}/status`, {
        method: 'PATCH',
        token: adminToken,
        body: { status: 'cancelled' },
      })
      assert.equal(cancelled.response.status, 200)
      const raceStock = await prisma.productVariant.findUnique({
        where: { variantId: physicalVariant.variantId },
      })
      assert.equal(raceStock.stockQty, 8)
    } finally {
      server.closeAllConnections()
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
      await prisma.$disconnect()
      await rm(storageRoot, { recursive: true, force: true })
      delete process.env.DIGITAL_STORAGE_ROOT
    }
  },
)
