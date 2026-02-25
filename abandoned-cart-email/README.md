# 🛒 Dynamic Abandoned Cart Campaign (Frameler Eyewear)

## Overview
A behavioral lifecycle email designed to recover lost revenue. This project demonstrates my ability to build dynamic, data-driven templates triggered by user actions (cart abandonment). 

To ensure the highest quality development workflow, the structural blueprint is maintained in pure MJML, while the compiled HTML template utilizes **Handlebars.js** to inject personalized user and product data.

## Features
* **Behavioral Personalization:** Uses Handlebars (`{{ }}`) to inject the customer's name, abandoned item details, pricing, and dynamic checkout links.
* **Separation of Concerns:** The MJML file acts as the pure structural UI blueprint, preventing compiler conflicts with dynamic templating logic.
* **Accessibility (a11y):** Fully semantic HTML, localized `<html lang="en">` tag, and descriptive `alt` attributes for screen readers.
* **App & Social Integration:** Properly aligned app store badges and cleanly structured social sharing icons.

## Files in this Folder
* `index.mjml` - The pure structural blueprint (Responsive UI).
* `index.html` - The production-ready template (Handlebars injected).
* `data.json` - The mock backend data structure demonstrating how the ESP populates the HTML.