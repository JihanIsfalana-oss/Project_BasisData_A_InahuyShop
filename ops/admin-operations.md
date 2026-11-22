# Admin operations guide

This guide covers the workflows supported by the current Admin Web and Admin
Mobile interfaces. It does not authorize production operations; production
access, incident ownership, payment policy, and support channels must be
approved and configured first.

## Access

Create or rotate an admin account from a trusted workstation with database
access. Do not expose admin registration over HTTP or share credentials:

```powershell
$env:ADMIN_USERNAME = 'store-admin'
$env:ADMIN_PASSWORD = '<secure password of at least 16 characters>'
pnpm --filter api admin:create
```

Provide credentials through an approved secret manager or password manager.
Admin and customer sessions are separate. Admin bearer tokens expire after
seven days; sign out when finished. The current system has one admin role with
the same permissions for all admin accounts.

## Supported workflows

### Orders and shipments

Use the Orders view in Admin Web or Admin Mobile to search orders and inspect
their status. The interfaces support:

- Moving a paid order to processing.
- Cancelling a pending-payment order.
- Creating a manual shipment for a processing order with a physical item.
- Adding tracking updates: `in_transit`, `out_for_delivery`, or `delivered`.

The API rejects invalid state transitions. Do not use order-status changes to
record real payment; payment is simulated and no payment provider is
integrated. Shipping price is currently zero because the product policy is
undefined.

### Categories and product visibility

Admin Web can create and delete categories and display active products with
their category and variant count. It does not provide product or variant
creation/editing, image management, or digital asset registration. Admin
Mobile only shows a read-only product summary.

Do not treat direct API calls or database edits as an approved workaround.
Product/variant and digital-asset operations need a reviewed, access-controlled
procedure before production use. Digital files must remain under the private
`DIGITAL_STORAGE_ROOT`; never place them in a public web directory.

### Vouchers

Admin Web can create vouchers and deactivate them. It does not edit existing
voucher terms. The form accepts `fixed` or `percentage` discounts, a discount
value, minimum purchase, and expiry date. The API limits percentage discounts
to 100%, uses integer IDR amounts, and allows one voucher per order.

Confirm the code, discount, minimum, and expiry with the product owner before
creation. Deactivation preserves transaction history; do not delete voucher
records directly.

## Audit and support

Successful admin mutations record the admin, action, resource ID, and request
ID in `admin_audit_log`. Request bodies, credentials, and digital-file paths
are not recorded. Records expire after 365 days.

For an unexpected result, stop repeating the mutation. Record the time,
environment, affected order or resource ID, and `requestId`; remove
credentials, personal data, and download tokens from any report. Follow the
[production incident procedure](./production-runbook.md#support-and-incident-procedure).

Production admin ownership, support channel, and escalation contact are not
configured. Assign them before granting production access.
