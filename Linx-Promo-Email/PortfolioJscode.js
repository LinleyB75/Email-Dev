<script async src="https://www.googletagmanager.com/gtag/js?id=G-E37T8FJ661"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-E37T8FJ661");
</script>
```[cite: 2]

---

### 2. JSON-LD Structured Data Script
```json
{
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": "https://linleyb.com/#website",
            "url": "https://linleyb.com/",
            "name": "Linley Bignoux | Freelance Email Developer",
            "inLanguage": "en-AU",
            "publisher": { "@id": "https://linleyb.com/#person" }
        },
        {
            "@type": "Person",
            "@id": "https://linleyb.com/#person",
            "name": "Linley Bignoux",
            "jobTitle": "Email Developer",
            "url": "https://linleyb.com/",
            "image": "https://i.ibb.co/TD8P4tx2/IRw-Qy-FCDJgx7s-Ovm-DHk0-Kr-QPZdh-Il-Cnl2-DUi2-BML.jpg",
            "nationality": { "@type": "Country", "name": "Australia" },
            "workLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressCountry": "MU" } },
            "sameAs": ["https://github.com/LinleyB75", "https://linleybignouxzqme9nmu.contra.com/"],
            "knowsAbout": ["Email Development", "MJML", "Maizzle", "HTML/CSS for Email", "Handlebars"]
        },
        {
            "@type": "ProfessionalService",
            "@id": "https://linleyb.com/#service",
            "name": "Linley Bignoux Email Development",
            "url": "https://linleyb.com/",
            "image": "https://i.ibb.co/TD8P4tx2/IRw-Qy-FCDJgx7s-Ovm-DHk0-Kr-QPZdh-Il-Cnl2-DUi2-BML.jpg",
            "description": "Freelance email developer turning designs into bulletproof HTML/CSS, MJML, Maizzle and Handlebars emails.",
            "provider": { "@id": "https://linleyb.com/#person" },
            "areaServed": [
                { "@type": "Country", "name": "Mauritius" },
                { "@type": "AdministrativeArea", "name": "Worldwide" }
            ],
            "serviceType": [
                "MJML development",
                "HTML email coding",
                "Maizzle development",
                "Handlebars email templating",
                "Email testing and QA"
            ]
        }
    ]
}
```[cite: 2]

---

### 3. Custom Site JavaScript (Mobile Menu & Theme Toggle)
```javascript
// MOBILE MENU
const menuBtn = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
function setMenu(open) {
    navLinks.classList.toggle("active", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.querySelector("i").className = open ? "fas fa-times" : "fas fa-bars";
}
menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("active")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", (e) => {
    if (!e.target.closest(".site-header")) setMenu(false);
});

// THEME TOGGLE
const themeBtn = document.getElementById("themeToggle");
const icon = themeBtn.querySelector("i");
const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
    updateIcon(storedTheme);
}
themeBtn.addEventListener("click", () => {
    let currentTheme = document.documentElement.getAttribute("data-theme");
    let targetTheme = currentTheme === "dark" ? "light" : "dark";
    if (!currentTheme) {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        targetTheme = systemDark ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", targetTheme);
    localStorage.setItem("theme", targetTheme);
    updateIcon(targetTheme);
});
function updateIcon(theme) {
    if (theme === "dark") {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }
}
