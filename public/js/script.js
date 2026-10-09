/* ============================================================
   NOCH PORTFOLIO — script.js
   Navigation, dynamic loaders, interaction enhancements
   ============================================================ */

/*-- Navigation --*/
const nav = document.querySelector('.nav'),
    navList = nav.querySelectorAll('li'),
    totalNavList = navList.length;
    allSection = document.querySelectorAll('.section'),
    totalSection = allSection.length;

for (let i = 0; i < totalNavList; i++) {
    const a = navList[i].querySelector('a');
    a.addEventListener('click', function () {
        removeBackSection();
        for (let j = 0; j < totalNavList; j++) {
            if (navList[j].querySelector('a').classList.contains('active')) {
                addBackSection(j);
            }
            navList[j].querySelector('a').classList.remove('active');
        }
        this.classList.add('active');
        showSection(this);
        if (window.innerWidth < 1200) {
            asideSectionTogglerBtn();
        }
    });
}

function removeBackSection() {
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove('back-section');
    }
}
function addBackSection(num) {
    allSection[num].classList.add('back-section');
}
function showSection(element) {
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.remove('active');
    }
    const target = element.getAttribute('href').split('#')[1];
    document.querySelector('#' + target).classList.add('active');
}
function updateNav(element) {
    for (let i = 0; i < totalNavList; i++) {
        navList[i].querySelector('a').classList.remove('active');
        const target = element.getAttribute('href').split('#')[1];
        if (target === navList[i].querySelector('a').getAttribute('href').split('#')[1]) {
            navList[i].querySelector('a').classList.add('active');
        }
    }
}

document.querySelector('.hire-me').addEventListener('click', function () {
    const sectionIndex = this.getAttribute('data-section-index');
    showSection(this);
    updateNav(this);
    removeBackSection();
    addBackSection(sectionIndex);
});

const navTogglerBtn = document.querySelector('.nav-toggler'),
    aside = document.querySelector('.aside');
navTogglerBtn.addEventListener('click', () => { asideSectionTogglerBtn(); });

function asideSectionTogglerBtn() {
    aside.classList.toggle('open');
    navTogglerBtn.classList.toggle('open');
    for (let i = 0; i < totalSection; i++) {
        allSection[i].classList.toggle('open');
    }
}

/* ── Pixel cursor flash on nav click ───────────────────────── */
navList.forEach(li => {
    li.querySelector('a').addEventListener('click', function() {
        const flash = document.createElement('span');
        flash.style.cssText = 'position:fixed;top:50%;left:50%;width:4px;height:4px;background:var(--skin-color);pointer-events:none;z-index:9999;animation:pixelFlash 0.3s steps(3) forwards;';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 350);
    });
});

/* inject pixelFlash keyframes */
(function() {
    const s = document.createElement('style');
    s.textContent = '@keyframes pixelFlash{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(32);opacity:0}}';
    document.head.appendChild(s);
})();

/*-- Dynamic Services Loader --*/
async function loadServices() {
    const row = document.getElementById('servicesRow');
    if (!row) return;
    try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (!res.ok || !data.success || !data.data || data.data.length === 0) return;
        row.innerHTML = data.data.map(function (s) {
            return '<div class="service-item padd-15">'
                + '<div class="service-item-inner">'
                + '<div class="icon"><i class="fa ' + (s.icon || 'fa-code') + '"></i></div>'
                + '<h4>' + (s.title || '') + '</h4>'
                + '<p>' + (s.description || '') + '</p>'
                + '</div></div>';
        }).join('');
    } catch (err) {
        console.warn('Services API tidak tersedia.');
    }
}

/*-- Dynamic Profile Loader --*/
async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (!res.ok || !data.success || !data.data) return;
        const p = data.data;

        const nameEl = document.querySelector('.hello span');
        if (nameEl && p.name) nameEl.textContent = p.name;

        const homeBio = document.querySelector('.home-info p');
        if (homeBio && p.bio) homeBio.textContent = p.bio;

        const profileImg = document.querySelector('.home-img img');
        if (profileImg && p.profile_image_url) profileImg.src = p.profile_image_url;

        if (p.cv_file_url) {
            const cvBtn = document.querySelector('.home-info .btn');
            if (cvBtn) { cvBtn.href = p.cv_file_url; cvBtn.setAttribute('download', ''); }
        }

        const infoMap = {
            'Birthday': 'birthday', 'Age': 'age', 'Instagram': 'instagram',
            'Gmail': 'email', 'Website': 'website', 'Phone': 'phone',
            'City': 'location', 'Country': 'country', 'Freelance': 'freelance',
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

        const contactItems = document.querySelectorAll('.contact-info-item p');
        contactItems.forEach(function (el) {
            const h4 = el.previousElementSibling?.previousElementSibling;
            if (!h4) return;
            const label = h4.textContent?.trim();
            if (label === 'Call Me On' && p.phone) el.textContent = p.phone;
            if (label === 'Office' && p.location) el.textContent = p.location;
            if (label === 'Gmail' && p.email) el.textContent = p.email;
            if (label === 'Website' && p.website) el.textContent = p.website;
        });
    } catch (err) {
        console.warn('Profile API tidak tersedia.');
    }
}

/*-- Dynamic Skills Loader --*/
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
        console.warn('Skills API tidak tersedia.');
    }
}

/*-- Init --*/
document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
    loadServices();
    loadSkills();
    loadCertificates();
});

/*-- Dynamic Certificates Loader --*/
async function loadCertificates() {
    var row = document.getElementById('certificatesRow');
    if (!row) return;
    try {
        var res = await fetch('/api/certificates');
        var data = await res.json();
        var items = (data && data.success && Array.isArray(data.data)) ? data.data : [];
        if (items.length === 0) {
            row.innerHTML = '<div class="certificate-empty">Belum ada sertifikat.</div>';
            return;
        }
        row.innerHTML = items.map(function (c) {
            var imgHtml = c.image
                ? '<div class="certificate-img"><img src="' + c.image + '" alt="' + (c.title || '') + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>'
                : '<div class="certificate-img certificate-img--placeholder"><i class="fa fa-certificate"></i></div>';
            return '<div class="certificate-item padd-15">'
                + '<div class="certificate-item-inner shadow-dark" onclick="openCertificateDetail(\'' + encodeURIComponent(JSON.stringify(c)) + '\')">'
                + imgHtml
                + '<div class="certificate-info">'
                + '<h4>' + (c.title || '') + '</h4>'
                + (c.issuer ? '<p class="certificate-issuer"><i class="fa fa-building"></i> ' + c.issuer + '</p>' : '')
                + (c.issued_date ? '<p class="certificate-date"><i class="fa fa-calendar"></i> ' + c.issued_date + '</p>' : '')
                + '</div>'
                + '</div></div>';
        }).join('');
    } catch (err) {
        var row2 = document.getElementById('certificatesRow');
        if (row2) row2.innerHTML = '<div class="certificate-empty">Gagal memuat sertifikat.</div>';
        console.warn('Certificates API error:', err);
    }
}

/*-- Certificate Detail Modal --*/
function openCertificateDetail(encoded) {
    var c = JSON.parse(decodeURIComponent(encoded));
    var overlay = document.getElementById('certificateDetailOverlay');
    if (!overlay) return;
    var imgEl = document.getElementById('cdImage');
    if (imgEl) {
        if (c.image) { imgEl.src = c.image; imgEl.style.display = 'block'; }
        else { imgEl.style.display = 'none'; }
    }
    var el = function (id) { return document.getElementById(id); };
    if (el('cdTitle')) el('cdTitle').textContent = c.title || '';
    if (el('cdIssuer')) el('cdIssuer').textContent = c.issuer || '';
    if (el('cdIssuerWrap')) el('cdIssuerWrap').style.display = c.issuer ? 'flex' : 'none';
    if (el('cdDate')) el('cdDate').textContent = c.issued_date || '';
    if (el('cdDateWrap')) el('cdDateWrap').style.display = c.issued_date ? 'flex' : 'none';
    if (el('cdDescription')) el('cdDescription').textContent = c.description || '';
    var verifyEl = el('cdVerifyBtn');
    if (verifyEl) {
        if (c.credential_url) { verifyEl.href = c.credential_url; verifyEl.style.display = 'inline-flex'; }
        else { verifyEl.style.display = 'none'; }
    }
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// closeCertificateDetail defined in inline script (index.tsx) for load-order safety
