# 🧾 Dynamic Billing Receipt (Simplify English)

## Overview
A production-ready transactional email receipt built for a software/education platform. This project goes beyond static HTML by utilizing **Handlebars.js** templating to map mock customer data, billing cycles, and payment methods. 

## Features
* **Dynamic Data Injection:** Built to integrate seamlessly with ESPs (Email Service Providers) like SendGrid, Mailchimp, or Braze using `{{ }}` Handlebars syntax.
* **Mock JSON Data:** Includes a `data.json` file demonstrating how backend data structures map to the email layout.
* **Accessibility (a11y):** Fully semantic HTML, properly mapped `alt` attributes, and localized `<html lang="en">` tags for screen readers.

## Files in this Folder
* `index.mjml` - The structural blueprint.
* `index.html` - The compiled, Handlebars-ready production code.
* `data.json` - The mock backend data structure.