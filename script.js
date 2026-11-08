
document.documentElement.classList.add("js-enabled");

const currentPage = document.body.dataset.page || "home";

const pages = [
    ["home", "Home", "index.html"],
    ["menu", "Our coffee", "menu.html"],
    ["about", "Our place", "about.html"],
    ["gallery", "Gallery", "gallery.html"],
    ["contact", "Contact", "contact.html"]
];

const headerContainer = document.getElementById("site-header");
const footerContainer = document.getElementById("site-footer");

if (headerContainer) {
    headerContainer.innerHTML = `
        <div class="reading-progress" id="reading-progress"></div>

        <div class="concept-bar">
            <span>YOURCOMPANYNAME</span>
            <span class="concept-star">✳</span>
            <span>GOOD COFFEE · NO RUSH</span>
        </div>

        <header class="site-header">
            <div class="header-inner">
                <a class="brand" href="index.html" aria-label="YourCompanyName homepage">
                    YourCompanyName<span>.</span>
                </a>

                <button
                    class="menu-toggle"
                    type="button"
                    aria-label="Open navigation"
                    aria-expanded="false"
                    aria-controls="primary-navigation"
                >
                    <span></span>
                    <span></span>
                </button>

                <nav class="main-nav" id="primary-navigation" aria-label="Main navigation">
                    ${pages.map(([id, label, url]) => `
                        <a
                            href="${url}"
                            class="${id === currentPage ? "active" : ""} ${id === "contact" ? "nav-contact" : ""}"
                            ${id === currentPage ? 'aria-current="page"' : ""}
                        >
                            ${label}
                        </a>
                    `).join("")}
                </nav>
            </div>
        </header>
    `;
}

if (footerContainer) {
    footerContainer.innerHTML = `
        <footer class="site-footer">
            <div class="footer-main shell">
                <a class="brand" href="index.html">
                    YourCompanyName<span>.</span>
                </a>

                <p>Good coffee. Good company. No rush.</p>

                <nav class="footer-nav" aria-label="Footer navigation">
                    <a href="menu.html">Menu</a>
                    <a href="about.html">Our place</a>
                    <a href="gallery.html">Gallery</a>
                    <a href="contact.html">Contact</a>
                </nav>
            </div>

            <div class="footer-bottom shell">
                <span>© ${new Date().getFullYear()} YourCompanyName</span>
                <span>YourCompany Address · Your City</span>
            </div>
        </footer>
    `;
}

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const header = document.querySelector(".site-header");

function closeMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");

    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
}

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

        if (isExpanded) {
            closeMenu();
            return;
        }

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation");

        navigation.classList.add("is-open");
        document.body.classList.add("menu-open");
    });

    navigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", event => {
        if (header && !header.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 820) {
            closeMenu();
        }
    });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px 35px 0px"
        }
    );

    revealElements.forEach(element => revealObserver.observe(element));
} else {
    revealElements.forEach(element => element.classList.add("is-visible"));
}

const progress = document.getElementById("reading-progress");

const backToTop = document.createElement("button");

backToTop.type = "button";
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "Back to top");
backToTop.textContent = "↑";

document.body.appendChild(backToTop);

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "instant" : "smooth"
    });
});

let scrollPending = false;

function updateScrollUI() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? window.scrollY / scrollable * 100 : 0;

    if (progress) {
        progress.style.width = `${Math.max(0, Math.min(percent, 100))}%`;
    }

    backToTop.classList.toggle("visible", window.scrollY > 600);

    scrollPending = false;
}

window.addEventListener("scroll", () => {
    if (!scrollPending) {
        scrollPending = true;
        requestAnimationFrame(updateScrollUI);
    }
}, { passive: true });

updateScrollUI();

const heroVisual = document.querySelector(".hero-visual");

if (heroVisual && !reducedMotion) {
    heroVisual.addEventListener("pointermove", event => {
        if (event.pointerType === "touch") return;

        const rect = heroVisual.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        heroVisual.style.setProperty("--rotate-x", `${-y * 5}deg`);
        heroVisual.style.setProperty("--rotate-y", `${x * 5}deg`);
    });

    heroVisual.addEventListener("pointerleave", () => {
        heroVisual.style.setProperty("--rotate-x", "0deg");
        heroVisual.style.setProperty("--rotate-y", "0deg");
    });
}

const ticker = document.querySelector(".ticker");
const tickerTrack = document.querySelector(".ticker-track");
const originalTickerGroup = tickerTrack?.querySelector(".ticker-group");
const tickerHTML = originalTickerGroup?.innerHTML;

function rebuildTicker() {
    if (!ticker || !tickerTrack || !originalTickerGroup || !tickerHTML) return;

    tickerTrack.style.animation = "none";

    tickerTrack.querySelectorAll(".ticker-group").forEach(group => {
        if (group !== originalTickerGroup) {
            group.remove();
        }
    });

    originalTickerGroup.innerHTML = tickerHTML;

    const requiredWidth = Math.max(ticker.clientWidth + 150, 850);
    let copies = 0;

    while (originalTickerGroup.scrollWidth < requiredWidth && copies < 20) {
        originalTickerGroup.insertAdjacentHTML("beforeend", tickerHTML);
        copies++;
    }

    const clonedGroup = originalTickerGroup.cloneNode(true);

    clonedGroup.setAttribute("aria-hidden", "true");
    tickerTrack.appendChild(clonedGroup);

    void tickerTrack.offsetWidth;
    tickerTrack.style.animation = "";
}

if (tickerTrack) {
    rebuildTicker();

    let tickerResizeTimer;

    window.addEventListener("resize", () => {
        clearTimeout(tickerResizeTimer);

        tickerResizeTimer = setTimeout(() => {
            rebuildTicker();
        }, 180);
    });
}

const moodButtons = document.querySelectorAll("[data-mood]");
const moodResult = document.getElementById("mood-result");

const moods = {
    energized: {
        title: "Espresso",
        description: "A little boost for a busy day. Rich, bold and ready when you are."
    },
    relaxed: {
        title: "Flat white",
        description: "Smooth, creamy and perfect for a calm afternoon break."
    },
    adventurous: {
        title: "Matcha latte",
        description: "Try something a little different and discover a new favourite."
    }
};

moodButtons.forEach(button => {
    button.addEventListener("click", () => {
        const mood = moods[button.dataset.mood];

        if (!mood || !moodResult) return;

        moodButtons.forEach(item => {
            item.classList.toggle("active", item === button);
            item.setAttribute("aria-pressed", String(item === button));
        });

        moodResult.querySelector("h3").textContent = mood.title;
        moodResult.querySelector("p").textContent = mood.description;
    });
});

const filterButtons = document.querySelectorAll("[data-filter]");
const menuCards = document.querySelectorAll(".menu-card");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const category = button.dataset.filter;

        filterButtons.forEach(item => {
            const active = item === button;

            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        menuCards.forEach(card => {
            card.hidden = category !== "all" && card.dataset.category !== category;
        });
    });
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const galleryButtons = Array.from(document.querySelectorAll("[data-lightbox]"));

let selectedImage = 0;

function showGalleryImage(index) {
    if (!lightboxImage || galleryButtons.length === 0) return;

    selectedImage = (index + galleryButtons.length) % galleryButtons.length;

    const image = galleryButtons[selectedImage].querySelector("img");

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
}

if (lightbox && lightboxImage) {
    galleryButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            showGalleryImage(index);
            lightbox.showModal();
        });
    });

    document.getElementById("lightbox-close").addEventListener("click", () => {
        lightbox.close();
    });

    document.getElementById("lightbox-prev").addEventListener("click", () => {
        showGalleryImage(selectedImage - 1);
    });

    document.getElementById("lightbox-next").addEventListener("click", () => {
        showGalleryImage(selectedImage + 1);
    });

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });

    lightbox.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") {
            showGalleryImage(selectedImage - 1);
        }

        if (event.key === "ArrowRight") {
            showGalleryImage(selectedImage + 1);
        }
    });
}

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const sendButton = document.getElementById("send-button");

if (contactForm && formStatus && sendButton) {
    contactForm.addEventListener("submit", async event => {
        event.preventDefault();

        const hostname = window.location.hostname;
        const isNetlify = hostname.endsWith(".netlify.app");

        if (!isNetlify) {
            formStatus.textContent = "This form can send messages after deployment on Netlify.";
            return;
        }

        sendButton.disabled = true;
        formStatus.textContent = "Sending your message...";

        try {
            const formData = new FormData(contactForm);

            const response = await fetch(contactForm.action, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(formData).toString()
            });

            if (!response.ok) {
                throw new Error("Your message could not be sent.");
            }

            formStatus.textContent = "Thank you! Your message has been submitted.";
            contactForm.reset();
        } catch {
            formStatus.textContent = "Something went wrong. Please try again.";
        } finally {
            sendButton.disabled = false;
        }
    });
}
