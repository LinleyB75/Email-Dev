# ✉️ Email Development Portfolio - LinleyBignoux - Email Developer | Email Marketing Development.

🌐 **View my full portfolio website:** [linleyb.com](https://linleyb.com/) HTML,CSS,MJML & Handlebars.js

📝 **Read my blog:** [Email Dev Notes](https://linleyb.com/blog/) - real email rendering bugs, tested in real clients, with the fix.

Welcome to my Email Development portfolio. This repository showcases my ability to build clean, responsive, and highly accessible email templates that render perfectly across all major email clients (including Microsoft Outlook, Gmail, and Apple Mail). I specialize in pure MJML structural blueprinting, static HTML conversions, and dynamic Handlebars data injection.

---

## 📂 Projects in this Repository

**1. Dynamic Billing Receipt (simplify-english-receipt)**
A transactional email receipt built for a software/education platform, engineered for dynamic data injection.
* **Key Features:** Uses Handlebars.js templating to map customer data, billing cycles, and payment methods. Proves readiness for backend integration with platforms like SendGrid, Mailchimp, or Braze.
* **Files:** Contains the Handlebars-ready index.html template, the index.mjml blueprint, and the data.json mock data structure.

**2. E-Commerce Promotional Email (ecommerce-coffee-promo-email)**
A sleek, dark-themed promotional campaign for an Italian espresso brand.
* **Key Features:** High-end visual hierarchy, custom web fonts with web-safe fallbacks, optimized image rendering, and responsive grid layouts.
* **Files:** Contains both the raw index.mjml blueprint and the compiled index.html production file.

**3. Retail Store Opening & Registration (eyewear-store-opening-email)**
An engaging announcement email for a new retail store location, featuring event registration and app download calls-to-action.
* **Key Features:** Complex multi-column layouts, integrated social sharing icons, app store badge alignment, and strict adherence to accessibility standards for screen readers.
* **Files:** Contains both the raw index.mjml blueprint and the compiled index.html production file.

**4. Dynamic Abandoned Cart Campaign (abandoned-cart-email)**
A behavioral lifecycle email designed to recover lost revenue, utilizing a pure MJML structural blueprint and Handlebars.js data injection.
* **Key Features:** Behavioral personalization mapping customer data and abandoned item details, pure UI/logic separation, and comprehensive accessibility (a11y) fixes.
* **Files:** Contains the index.mjml structural blueprint, the index.html Handlebars production file, and the data.json mock backend data.

**5. Two-Factor Authentication Security Alert (2fa-security-email)**
A transactional security email notifying users of successful 2FA enrollment, engineered for dynamic data injection.
* **Key Features:** Uses Handlebars.js templating to map user names, masked account details, and dynamic support links. Features enterprise-grade structural comments and pure UI/logic separation.
* **Files:** Contains the Handlebars-ready index.html template, the index.mjml structural blueprint, and the data.json mock data structure.

**6. Linx Systems Headphone Promo (linx-promo-email)**
A sleek promotional campaign for a premium headphone brand, focusing on high-end visual hierarchy and modern aesthetics.
* **Key Features:** Verified HTML rendering, strict adherence to accessibility standards (a11y) for screen readers, responsive grid layouts, and comprehensive structural code comments for readability.
* **Files:** Contains both the raw linx-promo1.mjml blueprint and the compiled linx-promo1.html production file.

**7. Tomma Pasta Sauce Promo (tomma-pasta-promo)**
A clean, responsive promotional email for a food brand utilizing a classic alternating Z-pattern layout.
* **Key Features:** Optimized for high readability, bulletproof functionality across tough email clients, integrated hidden preheader text, and fully verified, accessible HTML code.
* **Files:** Contains both the raw tomma-pasta-promo1.mjml blueprint and the compiled tomma-pasta-promo1.html production file.

**8. Frameler Eyewear Order Notification (frameler-order-shipped)**
A transactional shipping confirmation email featuring a responsive product grid and dynamic tracking details.
* **Key Features:** Native MJML mobile column stacking, injected Dark Mode metadata for email client compatibility, and Handlebars.js templating for dynamic order and shipping data.
* **Files:** Contains the Handlebars-ready index.html template, the index.mjml structural blueprint, and the data.json mock backend payload.

**9. Meaty Australia Promotional Campaign (meaty-australia-promo)**
A high-contrast promotional email designed with a premium vanilla and black aesthetic.
* **Key Features:** Strict Light Mode design preservation with seamless native Dark Mode auto-inversion. Features CSS drop-shadow enhancements for transparent PNG social icons to ensure visibility across varying environments.
* **Files:** Contains both the raw index.mjml blueprint and the compiled index.html production file.

**10. Dynamic Billing Receipt - Kick-Off English (kick-off-billing-receipt)**
A transactional email receipt designed for an online English learning platform, built with a pure MJML structural blueprint and engineered for backend data integration.
* **Key Features:** Features a custom CSS "sniper" fix for perfect Dark Mode rendering across nested MJML table cells. Utilizes Handlebars.js templating to dynamically inject customer profiles, variable billing dates, and payment statement descriptors.
* **Files:** Contains the raw `index.mjml` blueprint, the Handlebars-ready `index.html` production file, and the `data.json` mock backend payload.

---

## 🐞 Issue Log

Real rendering problems found while testing, each with the cause (marked confirmed or suspected), the fix, and where it was retested. Every entry has a trimmed MJML example you can compile yourself.

| ID | Problem | Log entry | Example |
|---|---|---|---|
| 001 | MJML images shrink and space apart in columns (`mj-group`) | [ISSUE-001](issues/ISSUE-001-mj-group-padding.md) | [before](examples/issue-001-before.mjml), [after](examples/issue-001-after.mjml) |
| 002 | CTA button colours changed by dark mode | [ISSUE-002](issues/ISSUE-002-outlook-dark-mode-button.md) | [button](examples/issue-002-cta-button.mjml) |
| 003 | Footer colour and social icons changed by dark mode inversion | [ISSUE-003](issues/ISSUE-003-footer-social-inversion.md) | [footer and social](examples/issue-003-footer-social.mjml) |
| 004 | Footer text black instead of white on grey in macOS dark mode | [ISSUE-004](issues/ISSUE-004-footer-text-macos-dark.md) | [footer](examples/issue-004-footer-apple.mjml) |

ISSUE-002 to ISSUE-004 come from the Re-cafe coffee newsletter. The full compiled email is here: [recafe1.html](examples/recafe1.html)

---

## 📝 Blog: Email Dev Notes

Each issue above is written up on my blog:

* [MJML images shrinking and spacing apart in columns: the padding fix](https://linleyb.com/blog/mj-group-padding.html)
* [What dark mode inversion did to my newsletter, and the fixes](https://linleyb.com/blog/dark-mode-inversion-fixes.html)
* [Footer text turning black in macOS dark mode: the fix](https://linleyb.com/blog/footer-text-macos-dark-mode.html)
* [Building a dark promo email: what broke, what fixed it, and what to watch for](https://linleyb.com/blog/dark-promo-email-fundamentals.html)