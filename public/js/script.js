/*--Typing Animation--
var typed = new Typed(".typing", {
    strings: ["", "Data Analyst", "Programmer"],
    typeSpeed: 100,
    BackSpeed: 60,
    loop: true
})*/

/*--Aside / Navigation--*/
const nav = document.querySelector(".nav"),
    navList = nav.querySelectorAll("li"),
    totalNavList = navList.length;
allSection = document.querySelectorAll(".section"),
    totalSection = allSection.length;

for (let i = 0; i < totalNavList; i++) {
    const a = navList[i].querySelector("a");
    a.addEventListener("click", function () {
        removeBackSection();
        for (let j = 0; j < totalNavList; j++) {
            if (navList[j].querySelector("a").classList.contains("active")) {
                addBackSection(j);
            }
            navList[j].querySelector("a").classList.remove("active");
        }
        this.classList.add("active")
        showSection(this);
        if (window.innerWidth < 1200) {
            asideSectionTogglerBtn();
        }
    })
}

function removeBackSection() {
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove("back-section");
    }
}

function addBackSection(num) {
    allSection[num].classList.add("back-section");
}

function showSection(element) {
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove("active");
    }
    const target = element.getAttribute("href").split("#")[1];
    document.querySelector("#" + target).classList.add("active")
}

function updateNav(element) {
    for (let i = 0; i < totalNavList; i++) {
        navList[i].querySelector("a").classList.remove("active");
        const target = element.getAttribute("href").split("#")[1];
        if (target === navList[i].querySelector("a").getAttribute("href").split("#")[1]) {
            navList[i].querySelector("a").classList.add("active");
        }
    }
}

document.querySelector(".hire-me").addEventListener("click", function () {
    const sectionIndex = this.getAttribute("data-section-index");
    showSection(this);
    updateNav(this);
    removeBackSection();
    addBackSection(sectionIndex)
})

const navTogglerBtn = document.querySelector(".nav-toggler"),
    aside = document.querySelector(".aside");
navTogglerBtn.addEventListener("click", () => {
    asideSectionTogglerBtn();
})

function asideSectionTogglerBtn() {
    aside.classList.toggle("open");
    navTogglerBtn.classList.toggle("open");
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.toggle("open");
    }
}

/*--Dynamic Services Loader--*/
async function loadServices() {
    const row = document.getElementById('servicesRow');
    if (!row) return;

    try {
        const res = await fetch('/api/services');
        const data = await res.json();

        if (!res.ok || !data.success || !data.data || data.data.length === 0) {
            // Biarkan konten hardcode yang sudah ada sebagai fallback
            return;
        }

        row.innerHTML = data.data.map(function (s) {
            return '<div class="service-item padd-15">'
                + '<div class="service-item-inner">'
                + '<div class="icon"><i class="fa ' + (s.icon || 'fa-code') + '"></i></div>'
                + '<h4>' + (s.title || '') + '</h4>'
                + '<p>' + (s.description || '') + '</p>'
                + '</div></div>';
        }).join('');
    } catch (err) {
        // Fallback ke konten hardcode jika API error
        console.warn('Services API tidak tersedia, menggunakan konten default.');
    }
}

/*--Dynamic Profile Loader--*/
async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (!res.ok || !data.success || !data.data) return;

        const p = data.data;

        // Home section
        const nameEl = document.querySelector('.hello span');
        if (nameEl && p.name) nameEl.textContent = p.name;

        const typingEl = document.querySelector('.typing');
        if (typingEl && p.role && window.typed) {
            window.typed.strings = ['', p.role];
            window.typed.reset();
        }

        const homeBio = document.querySelector('.home-info p');
        if (homeBio && p.bio) homeBio.textContent = p.bio;

        // Profile image
        const profileImg = document.querySelector('.home-img img');
        if (profileImg && p.profile_image_url) {
            profileImg.src = p.profile_image_url;
        }

        // CV button
        if (p.cv_file_url) {
            const cvBtn = document.querySelector('.home-info .btn');
            if (cvBtn) { cvBtn.href = p.cv_file_url; cvBtn.setAttribute('download', ''); }
        }

        // About - personal info
        const infoMap = {
            'Birthday': 'birthday',
            'Age': 'age',
            'Instagram': 'instagram',
            'Gmail': 'email',
            'Website': 'website',
            'Phone': 'phone',
            'City': 'location',
            'Country': 'country',
            'Freelance': 'freelance',
        };

        const infoItems = document.querySelectorAll('.info-item p');
        infoItems.forEach(function (item) {
            const text = item.textContent || '';
            for (const [label, key] of Object.entries(infoMap)) {
                if (text.includes(label + ' :') && p[key]) {
                    const span = item.querySelector('span');
                    if (span) span.textContent = p[key];
                }
            }
        });

        // Contact info
        const contactItems = document.querySelectorAll('.contact-info-item p');
        contactItems.forEach(function (el) {
            const h4 = el.previousElementSibling?.previousElementSibling;
            if (!h4) return;
            const label = h4.textContent?.trim();
            if (label === 'Call Us On' && p.phone) el.textContent = p.phone;
            if (label === 'Office' && p.location) el.textContent = p.location;
            if (label === 'Gmail' && p.email) el.textContent = p.email;
            if (label === 'Website' && p.website) el.textContent = p.website;
        });

    } catch (err) {
        // Fallback ke konten hardcode
        console.warn('Profile API tidak tersedia, menggunakan konten default.');
    }
}

/*--Dynamic Skills Loader--*/
async function loadSkills() {
    const skillsContainer = document.querySelector('.skills .row');
    if (!skillsContainer) return;

    try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        if (!res.ok || !data.success || !data.data || data.data.length === 0) return;

        skillsContainer.innerHTML = data.data.map(function (s) {
            const level = Math.min(100, Math.max(0, Number(s.level) || 0));
            return '<div class="skill-item padd-15">'
                + '<h5>' + (s.name || '') + '</h5>'
                + '<div class="progress">'
                + '<div class="progress-in" style="width:' + level + '%;"></div>'
                + '<div class="skill-percent">' + level + '%</div>'
                + '</div></div>';
        }).join('');
    } catch (err) {
        console.warn('Skills API tidak tersedia, menggunakan konten default.');
    }
}

/*--Init dynamic loaders--*/
document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
    loadServices();
    loadSkills();
});
