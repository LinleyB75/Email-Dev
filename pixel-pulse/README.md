# Kick off: payment receipt email (MJML + Brevo)

A transactional "we have successfully charged your account" receipt, for Brevo. This is a real
client project (Kick off → Your English), rebuilt so the receipt details come from JSON instead
of being typed into the email.

The client tells me which params they will send. I build the template to use exactly those params,
set it up in Brevo (Brevo gives it a template ID), and hand over the ID, the HTML and the params
list. The client's team connects their system and sends the email.

MJML template -> compiled HTML -> Brevo template (template ID) -> client sends the ID plus the JSON params.

## Status

| Check | Status |
|---|---|
| Template compiles (MJML strict mode), Brevo tags kept | Done |
| Rendered with the data from the original email: all 47 lines of text match, in order | Done (local approximation of Brevo) |
| `check-params`: names match, values follow the rules, card numbers refused | Done |
| `send.js` builds the right request (dry run, and against a fake local server) | Done |
| **Template created in Brevo and a real test email sent** | Not done yet |
| Layout in real email clients (Outlook, Gmail, Apple Mail) and dark mode | Not checked yet |
| How Brevo handles special characters and missing optional fields | Not checked yet |

## Steps

1. `npm install`
2. Put the client's example JSON in `data/params.json`. If their names differ from the template's,
   change the names in `templates/payment-receipt.mjml` to match.
3. `npm run check-params` checks the names and the values.
4. `npm run build` makes `dist/payment-receipt.html`
5. In Brevo, create a transactional template from your own HTML, paste in `dist/payment-receipt.html`,
   set the sender and subject, then save and activate it. Brevo shows the **template ID**. Note it.
   (Menu names can change, so check Brevo's help pages.)
6. Optional test send: copy `.env.example` to `.env`, fill it in, then `npm run send:dry` and `npm run send`.

## The JSON params

Brevo receives these as `params`, and the template reads them as `{{ params.customerName }}` and so on.
Send dates and amounts already formatted the way they should appear in the email.
See `data/params.json` for a full example.

| Param | Required | If missing |
|---|---|---|
| `customerName` | Yes | "Bill to" shows no name |
| `receiptNumber` | Yes | "Receipt #" shows no number |
| `invoiceDate`, `paymentDate` | Yes | The date lines show no date |
| `planSummary` | Yes | The sentence about the monthly cost has a gap, for example `$50 (2 hour class plan)` |
| `lineItems` (a list of `description`, `amount`) | Yes | No charge rows. Never send an empty list. |
| `total` | Yes | The total rows show no amount |
| `cardBrand`, `cardEnding` | Yes | The "Amount paid with" line has gaps. `cardEnding` is only the last digits, for example `*****42`. |
| `billingPeriod` | No | The billing period box is hidden |
| `billingAddressLines` (a list of text lines) | No | The billing address is hidden. Never send an empty list. |

**Never send a full card number.** `check-params` refuses a `cardEnding` that is longer than the last
few digits, and any value that looks like a card number.

## Who does what

- **Me:** the template, the params list, the Brevo template and its ID, and test sends.
- **The client's team:** the params (they decide the names and the formatting), when the receipt is
  sent, the API key, and the production call to Brevo. The template ID is different in every Brevo
  account, so it must be created in theirs.

## Before this goes live (questions for the client)

- Two different company addresses appear in the email (the seller block and the footer). Confirm which is correct.
- The "Contact Support" and "info@" links use placeholder addresses (`example.com`) while the visible text shows real ones. Set the real `mailto:` addresses.
- The "here" link (transaction history), the "Download Now" button and the social icons use placeholder links.
- The email mixes a receipt with a promotion for an ebook. Check with the client whether that matters for how the email is classified in the places they send to.
- Real company details are in the template. Use placeholders in anything you publish.

## Notes

- Never commit `.env` or an API key.
- The sample data in `data/params.json` is made up.