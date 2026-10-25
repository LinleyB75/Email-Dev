# Kick off: account setup email (MJML + Brevo)

A transactional "set up your account" email with dynamic content, for Brevo.

The client tells me which params they will send. I build the template to use exactly those params,
set it up in Brevo (Brevo gives it a template ID), and hand over the ID, the HTML and the params
list. The client connects their system and sends the email.

MJML template -> compiled HTML -> Brevo template (template ID) -> client sends the ID plus the JSON params.

## Status

| Check | Status |
|---|---|
| Template compiles, Brevo tags kept | Done |
| `check-params` finds a mismatch between the template and the client's JSON | Done |
| `send.js` builds the right request (dry run, and against a fake local server) | Done |
| **Template created in Brevo and a real test email sent** | Not done yet |
| How Brevo handles special characters and missing fields | Not checked yet |
| Layout in real email clients and dark mode | Not checked yet |

## Steps

1. `npm install`
2. Put the client's example JSON in `data/params.json`. If their names differ from the template's
   (for example `first_name` instead of `firstName`), change the names in
   `templates/account-setup.mjml` to match.
3. `npm run check-params` checks that every param the template reads is in their JSON.
4. `npm run build` makes `dist/account-setup.html`
5. In Brevo, create a transactional template from your own HTML, paste in `dist/account-setup.html`,
   set the sender and subject, then save and activate it. Brevo shows the **template ID**. Note it.
   (Menu names can change, so check Brevo's help pages.)
6. Optional test send: copy `.env.example` to `.env`, fill it in, then `npm run send:dry` and `npm run send`.

## The JSON params

Brevo receives these as `params`, and the template reads them as `{{ params.firstName }}` and so on.
See `data/params.json` for a full example.

| Param | Required | If missing |
|---|---|---|
| `setupLink` (starts with `https://`) | Yes | The button has no link |
| `maskedEmail` | Yes | The reminder line is empty |
| `firstName` | No | Greeting becomes "Hi there," |
| `linkExpiresInHours` (a number above 0) | No | The expiry line is hidden |
| `plan` (`name`, `classesPerWeek`) | No | The plan box is hidden |
| `classes` (a list of `day`, `time`, `teacher`) | No | The classes table is hidden. Needs `plan`. Leave the key out instead of sending an empty list. |

## Who does what

- **Me:** the template, the params list, the Brevo template and its ID, and test sends.
- **The client's team:** the params (they decide the names), when the email is sent, the set-up link
  and token, the API key, and the production call to Brevo. The template ID is different in every
  Brevo account, so it must be created in theirs.

## Notes

- Never commit `.env` or an API key.
- Brand names, logos and links in the sample email are placeholders from a practice email.