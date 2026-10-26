# Template tags: payment receipt email

Every Brevo tag used in `templates/payment-receipt.mjml` and `dist/payment-receipt.html`.
Brevo fills these from the `params` object in the send request. See `data/params.json` for example values.

## All the tags

```
{{ params.planSummary }}        {{ params.receiptNumber }}      {{ params.invoiceDate }}
{{ params.paymentDate }}        {{ params.customerName }}       {{ params.total }}  (used twice)
{{ params.cardBrand }}          {{ params.cardEnding }}         {{ params.billingPeriod }}  (optional)
{% if params.billingPeriod %} ... {% endif %}
{% if params.billingAddressLines %} ... {% for line in params.billingAddressLines %}{{ line }}{% endfor %} ... {% endif %}
{% for item in params.lineItems %}{{ item.description }}{{ item.amount }}{% endfor %}
```

## What each one does

| Tag | Required | Where it appears | If it is missing |
|---|---|---|---|
| `{{ params.planSummary }}` | Yes | "This will include the monthly cost for your ..." | The sentence has a gap |
| `{{ params.receiptNumber }}` | Yes | "Receipt #..." | No number is shown |
| `{{ params.invoiceDate }}` | Yes | "Invoice Date: ..." | No date is shown |
| `{{ params.paymentDate }}` | Yes | "Payment Received: ..." | No date is shown |
| `{{ params.customerName }}` | Yes | "Bill to" | No name is shown |
| `{{ params.total }}` | Yes | The Total row and the "Amount paid with" row (twice) | Both amounts are empty |
| `{{ params.cardBrand }}` | Yes | "Amount paid with ..." | The line has a gap |
| `{{ params.cardEnding }}` | Yes | "(ending in ...)". Last digits only, for example `*****42`. | The line has a gap |
| `{{ params.billingPeriod }}` | No | The "billing period" box | The whole box is hidden |
| `{% if params.billingAddressLines %}` | No | The "Billing address" block, one line per list item | The block is hidden |
| `{% for item in params.lineItems %}` | Yes | One charge row per item, using `item.description` and `item.amount` | No charge rows |

## Rules

- Never send an empty list. Leave the key out instead.
- Send dates and amounts already formatted the way they should appear in the email.
- Never send a full card number. `npm run check-params` refuses it.
- The loop name `line` (address lines) and `item` (charge rows) only exist inside their loops.