# ✉️ Email Development Portfolio - Linley Bignoux - HTML CSS MJML Handlebars.js

Welcome to my Email Development portfolio! This repository showcases production-ready, responsive HTML email campaigns built from scratch. 

My focus is on creating pixel-perfect, accessible, and highly engaging emails that render flawlessly across all major email clients (including the notoriously difficult Microsoft Outlook).

## 🛠️ Tech Stack & Skills
* **Framework:** MJML (Mailjet Markup Language)
* **Languages:** HTML5, CSS3 (Inline & Embedded)
* **Templating/Data:** Handlebars.js (`{{ }}`), JSON Mock Data Injection
* **Design Principles:** Mobile-First, Responsive Design, Fluid Typography
* **Best Practices:** Cross-client compatibility, Accessibility (Semantic HTML, Alt-text mapping), Dark Mode awareness.

## 📂 Projects in this Repository

### 1. Dynamic Billing Receipt (`simplify-english-receipt`)
A transactional email receipt built for a software/education platform, engineered for dynamic data injection.
* **Key Features:** Uses **Handlebars.js** templating to map customer data, billing cycles, and payment methods. Proves readiness for backend integration with platforms like SendGrid, Mailchimp, or Braze.
* **Files:** Contains the Handlebars-ready `index.html` template, the `index.mjml` blueprint, and the `data.json` mock data structure.

### 2. E-Commerce Promotional Email (`ecommerce-coffee-promo-email`)
A sleek, dark-themed promotional campaign for an Italian espresso brand.
* **Key Features:** High-end visual hierarchy, custom web fonts with web-safe fallbacks, optimized image rendering, and responsive grid layouts.
* **Files:** Contains both the raw `index.mjml` blueprint and the compiled `index.html` production file.

### 3. Retail Store Opening & Registration (`eyewear-store-opening-email`)
An engaging announcement email for a new retail store location, featuring event registration and app download calls-to-action.
* **Key Features:** Complex multi-column layouts, integrated social sharing icons, app store badge alignment, and strict adherence to accessibility standards for screen readers.
* **Files:** Contains both the raw `index.mjml` blueprint and the compiled `index.html` production file.

### 4. Dynamic Abandoned Cart Campaign (`abandoned-cart-email`)
A behavioral lifecycle email designed to recover lost revenue, utilizing a pure MJML structural blueprint and Handlebars.js data injection.
* **Key Features:** Behavioral personalization mapping customer data and abandoned item details, pure UI/logic separation, and comprehensive accessibility (a11y) fixes.
* **Files:** Contains the `index.mjml` structural blueprint, the `index.html` Handlebars production file, and the `data.json` mock backend data.

## 💡 My Development Workflow
To ensure maximum reliability across desktop, mobile, and webmail clients, I utilize **MJML**. By writing the structural logic in MJML, I can rapidly develop complex layouts while relying on the compiler to generate the robust, table-based HTML required for strict clients like Outlook and Yahoo Mail. For transactional sends, I build templates ready for dynamic injection using Handlebars.

---
*Feel free to explore the folders above to view the raw source code, JSON data structures, and the compiled HTML files!*