/**
 * Public Frontend — Portfolio Website
 * Struktur HTML dipertahankan dari D:\REACTPORT\index.html.
 * Data portfolio dan contact di-fetch melalui API routes.
 * Desain visual TIDAK diubah — pixel art / animasi akan dikerjakan di tahap berikutnya.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import TypingText from '../components/admin/TypingText';

const pixelFrames = [
  '/images/pixel gerakan 1.png',
  '/images/pixel gerakan 2.png',
  '/images/pixel gerakan 3.png',
  '/images/pixel gerakan 4.png',
  '/images/pixel gerakan 5.png',
];

export default function Home() {
  const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
    const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % pixelFrames.length);
    }, 450); // 450ms agar animasi lebih santai dan tidak terlalu cepat

    return () => clearInterval(interval);
    }, []);

  return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Jayden Noch — Portfolio</title>

                {/* CSS existing — tidak diubah */}
                <link rel="stylesheet" href="/css/style.css" />
                <link rel="stylesheet" href="/css/skins/color-1.css" />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
                    referrerPolicy="no-referrer"
                />

                {/* Style Switcher skins — disabled attribute via cast karena TypeScript tidak kenal di HTMLLinkElement */}
                <link rel="stylesheet" href="/css/skins/color-1.css" className="alternate-style" title="color-1" {...{ disabled: true } as object} />
                <link rel="stylesheet" href="/css/skins/color-2.css" className="alternate-style" title="color-2" {...{ disabled: true } as object} />
                <link rel="stylesheet" href="/css/skins/color-3.css" className="alternate-style" title="color-3" {...{ disabled: true } as object} />
                <link rel="stylesheet" href="/css/skins/color-4.css" className="alternate-style" title="color-4" {...{ disabled: true } as object} />
                <link rel="stylesheet" href="/css/skins/color-5.css" className="alternate-style" title="color-5" {...{ disabled: true } as object} />
                <link rel="stylesheet" href="/css/style-switcher.css" />
            </Head>

            {/* ── Main Container ───────────────────────────────────────────────────── */}
            <div className="main-container">

                {/* ── Aside / Sidebar ─────────────────────────────────────────────── */}
                <div className="aside">
                    <div className="logo">
                        <a 
                            href="#home" 
                            onClick={(e) => {
                                const homeNavLink = document.querySelector('.nav a[href="#home"]') as HTMLElement;
                                if (homeNavLink) homeNavLink.click();
                            }}
                        >
                            <img src="/images/img1.png" alt="Logo" />
                        </a>
                    </div>
                    <div className="nav-toggler"><span></span></div>
                    <ul className="nav">
                        <li><a href="#home" className="active"><i className="fa fa-home"></i> Home</a></li>
                        <li><a href="#about"><i className="fa fa-user"></i> About</a></li>
                        <li><a href="#service"><i className="fa fa-list"></i> Services</a></li>
                        <li><a href="#portfolio"><i className="fa fa-briefcase"></i> Portfolio</a></li>
                        <li><a href="#contact"><i className="fa fa-comments"></i> Contact</a></li>
                    </ul>
                </div>

                {/* ── Main Content ─────────────────────────────────────────────────── */}
                <div className="main-content">

                    {/* ── HOME ──────────────────────────────────────────────────────── */}
                    <section className="home active section" id="home">
                        <div className="container">
                            <div className="row">
                                <div className="home-info padd-15">
                                    <h3 className="hello">Hello, my name is <span>Jayden Noch</span></h3>
                                    <h3 className="my-profession">
                                        I'm a <TypingText />
                                    </h3>
                                    <p style={{ textAlign: 'justify' }}>
                                        I am a passionate fresh graduate and beginner programmer who is eager to 
                                        grow by working on real projects. I may be at the start of my journey, but 
                                        I bring strong dedication, quick learning skills, and a fresh perspective 
                                        to every task. I am committed to delivering quality work while continuously 
                                        improving myself, and I would be excited to collaborate with clients who value 
                                        enthusiasm, reliability, and growth potential.
                                    </p>
                                    <a href="#" className="btn">Download CV</a>
                                </div>
                                <div className="home-img padd-15">
                                    <div 
                                        style={{
                                            width: '360px',        /* Diperbesar dari 260px */
                                            height: '310px',       /* Diperbesar dari 220px */
                                            overflow: 'hidden',
                                            margin: '0 auto',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <img 
                                            src={pixelFrames[currentFrame]} 
                                            alt="Jayden Noch Pixel Animation" 
                                            style={{
                                                width: '100%',
                                                height: '125%',    /* Menjaga proporsi potongan sampai bahu */
                                                objectFit: 'cover',
                                                objectPosition: 'top center'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── ABOUT ─────────────────────────────────────────────────────── */}
                    <section className="about section" id="about">
                        <div className="container">
                            <div className="row">
                                <div className="section-title padd-15"><h2>About Me</h2></div>
                            </div>
                            <div className="row">
                                <div className="about-content padd-15">
                                    <div className="row">
                                        <div className="about-text padd-15">
                                            <h3>I&apos;m Jayden Noch and <span>Programmer</span></h3>
                                            <p style={{ textAlign: 'justify' }}>
                                                I&apos;m a fresh graduate with a Bachelor&apos;s Degree in Informatics from Universitas
                                                Ahmad Dahlan. I am passionate about programming, web development, and creating
                                                digital solutions that bring real impact. Even though I am just starting my
                                                professional journey, I am eager to learn, adapt, and deliver quality work for
                                                every project I take on. If you are looking for a motivated programmer who is
                                                ready to grow and contribute, I would love to collaborate with you!
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        {/* Personal Info */}
                                        <div className="personal-info padd-15" style={{ paddingLeft: '30px', paddingRight: '20px' }}>
                                            <div className="row">
                                                    {/* Kolom Kiri */}
                                                    <div className="info-item">
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ width: '90px', fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Birthday</td>
                                                                    <td style={{ width: '15px', textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>19 NOV 2005</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Instagram</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>@jayden.noch</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Website</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', wordBreak: 'break-all', color: 'var(--text-black-700)' }}>www.noch.com</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Phone</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>+62 813 751 3615</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Country</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>Indonesia</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Kolom Kanan */}
                                                    <div className="info-item">
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ width: '90px', fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Age</td>
                                                                    <td style={{ width: '15px', textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>20</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Gmail</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', wordBreak: 'break-all', color: 'var(--text-black-700)' }}>zaidanahmad005@gmail.com</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Degree</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>CS</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>City</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>Yogyakarta</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>Freelance</td>
                                                                    <td style={{ textAlign: 'center', padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-900)' }}>:</td>
                                                                    <td style={{ padding: '6px 0', verticalAlign: 'top', color: 'var(--text-black-700)' }}>Available</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            <div className="row">
                                                <div className="buttons padd-15">
                                                    <a href="#contact" data-section-index="1" className="btn hire-me">Hire Me</a>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Skills */}
                                        <div className="skills padd-15">
                                            <div className="row">
                                                <div className="skill-item padd-15">
                                                    <h5>CSS</h5>
                                                    <div className="progress">
                                                        <div className="progress-in" style={{ width: '70%' }}></div>
                                                        <div className="skill-percent">70%</div>
                                                    </div>
                                                </div>
                                                <div className="skill-item padd-15">
                                                    <h5>JS</h5>
                                                    <div className="progress">
                                                        <div className="progress-in" style={{ width: '65%' }}></div>
                                                        <div className="skill-percent">65%</div>
                                                    </div>
                                                </div>
                                                <div className="skill-item padd-15">
                                                    <h5>C++</h5>
                                                    <div className="progress">
                                                        <div className="progress-in" style={{ width: '75%' }}></div>
                                                        <div className="skill-percent">75%</div>
                                                    </div>
                                                </div>
                                                <div className="skill-item padd-15">
                                                    <h5>PY</h5>
                                                    <div className="progress">
                                                        <div className="progress-in" style={{ width: '70%' }}></div>
                                                        <div className="skill-percent">70%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Education & Experience */}
                                    <div className="row">
                                        <div className="education padd-15">
                                            <h3 className="title">Education</h3>
                                            <div className="row">
                                                <div className="timeline-box padd-15">
                                                    <div className="timeline shadow-dark">
                                                        <div className="timeline-item">
                                                            <div className="circle-dot"></div>
                                                            <h3 className="timeline-date"><i className="fa fa-calendar"></i> 2011-2016</h3>
                                                            <h4 className="timeline-title">MI Istiqomah Sambas PBG</h4>
                                                            <p style={{ textAlign: 'justify' }}>I began my educational journey at MI Istiqomah Sambas, where I developed a strong foundation in learning, discipline, and curiosity.</p>
                                                        </div>
                                                        <div className="timeline-item">
                                                            <div className="circle-dot"></div>
                                                            <h3 className="timeline-date"><i className="fa fa-calendar"></i> 2017-2019</h3>
                                                            <h4 className="timeline-title">Istiqomah Sambas PBG Junior High School</h4>
                                                            <p style={{ textAlign: 'justify' }}>I continued my studies at Istiqomah Sambas Junior High School, strengthening academic skills and learning teamwork.</p>
                                                        </div>
                                                        <div className="timeline-item">
                                                            <div className="circle-dot"></div>
                                                            <h3 className="timeline-date"><i className="fa fa-calendar"></i> 2020-2023</h3>
                                                            <h4 className="timeline-title">SMKN 1 PBG</h4>
                                                            <p style={{ textAlign: 'justify' }}>I studied at SMK Negeri 1 Purbalingga, majoring in Computer and Network Engineering (TKJ), gaining hardware and software knowledge.</p>
                                                        </div>
                                                        <div className="timeline-item">
                                                            <div className="circle-dot"></div>
                                                            <h3 className="timeline-date"><i className="fa fa-calendar"></i> 2023-2027</h3>
                                                            <h4 className="timeline-title">Universitas Ahmad Dahlan</h4>
                                                            <p style={{ textAlign: 'justify' }}>Bachelor’s Degree in Informatics. Studying web development, programming, databases, software engineering, and information technology.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="experience padd-15">
                                            <h3 className="title">Experience</h3>
                                            <div className="row">
                                                <div className="timeline-box padd-15">
                                                    <div className="timeline shadow-dark">
                                                        <div className="timeline-item">
                                                            <div className="circle-dot"></div>
                                                            <h3 className="timeline-date"><i className="fa fa-calendar"></i> 2021-2022</h3>
                                                            <h4 className="timeline-title">Internship (PKL) — PT HCP</h4>
                                                            <p style={{ textAlign: 'justify' }}>Worked on fiber optic network installation and maintenance, including ODC/ODP installation, cable installation, and pole construction.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── SERVICES ──────────────────────────────────────────────────── */}
                    <section className="service section" id="service">
                        <div className="container">
                            <div className="row">
                                <div className="section-title padd-15"><h2>Services</h2></div>
                            </div>
                            {/* Services di-render oleh JavaScript dari /api/services-public (atau hardcode sementara) */}
                            <div className="row" id="servicesRow">
                                {/* Placeholder — akan diisi oleh script.js */}
                                <div className="service-item padd-15">
                                    <div className="service-item-inner">
                                        <div className="icon"><i className="fa fa-mobile-alt"></i></div>
                                        <h4>Programmer</h4>
                                        <p>Building web applications with modern technologies and best practices.</p>
                                    </div>
                                </div>
                                <div className="service-item padd-15">
                                    <div className="service-item-inner">
                                        <div className="icon"><i className="fa fa-laptop-code"></i></div>
                                        <h4>Web Development</h4>
                                        <p>Creating responsive and performant websites from design to deployment.</p>
                                    </div>
                                </div>
                                <div className="service-item padd-15">
                                    <div className="service-item-inner">
                                        <div className="icon"><i className="fa fa-palette"></i></div>
                                        <h4>UI Design</h4>
                                        <p>Designing clean and intuitive user interfaces for web applications.</p>
                                    </div>
                                </div>
                                <div className="service-item padd-15">
                                    <div className="service-item-inner">
                                        <div className="icon"><i className="fa fa-code"></i></div>
                                        <h4>Backend Dev</h4>
                                        <p>Building robust server-side applications and REST APIs.</p>
                                    </div>
                                </div>
                                <div className="service-item padd-15">
                                    <div className="service-item-inner">
                                        <div className="icon"><i className="fa fa-search"></i></div>
                                        <h4>SEO</h4>
                                        <p>Optimizing websites for search engines to improve visibility.</p>
                                    </div>
                                </div>
                                <div className="service-item padd-15">
                                    <div className="service-item-inner">
                                        <div className="icon"><i className="fa fa-bullhorn"></i></div>
                                        <h4>Consulting</h4>
                                        <p>Technical consulting for software architecture and development.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── PORTFOLIO ─────────────────────────────────────────────────── */}
                    <section className="portfolio section" id="portfolio">
                        <div className="container">
                            <div className="row">
                                <div className="section-title padd-15"><h2>Portfolio</h2></div>
                            </div>
                            <div className="row">
                                <div className="portfolio-heading padd-15"><h2>My Last Projects :</h2></div>
                            </div>
                            {/* Portfolio items di-render JavaScript dari /api/portfolio */}
                            <div className="row" id="portfolioRow">
                                <div className="portfolio-item padd-15" style={{
                                    flex: '0 0 100%', maxWidth: '100%',
                                    textAlign: 'center', padding: '40px 0',
                                    color: 'var(--text-black-700)'
                                }}>
                                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '28px' }}></i>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── CONTACT ───────────────────────────────────────────────────── */}
                    <section className="contact section" id="contact">
                        <div className="container">
                            <div className="row">
                                <div className="section-title padd-15"><h2>Contact Me</h2></div>
                            </div>
                            <h3 className="contact-title padd-15">Have You Any Questions ?</h3>
                            <h4 className="contact-sub-title padd-15">I&apos;M AT YOUR SERVICE</h4>
                            <div className="row">
                                <div className="contact-info-item padd-15">
                                    <div className="icon"><i className="fa fa-phone"></i></div>
                                    <h4>Call Us On</h4>
                                    <p>+62 82137513615</p>
                                </div>
                                <div className="contact-info-item padd-15">
                                    <div className="icon"><i className="fa fa-map-marker-alt"></i></div>
                                    <h4>Office</h4>
                                    <p>Yogyakarta</p>
                                </div>
                                <div className="contact-info-item padd-15">
                                    <div className="icon"><i className="fa fa-envelope"></i></div>
                                    <h4>Gmail</h4>
                                    <p>jydnahm@gmail.com</p>
                                </div>
                                <div className="contact-info-item padd-15">
                                    <div className="icon"><i className="fa fa-globe-asia"></i></div>
                                    <h4>Website</h4>
                                    <p>portojay.vercel.app</p>
                                </div>
                            </div>
                            <h3 className="contact-title padd-15">SEND ME AN EMAIL ?</h3>
                            <h4 className="contact-sub-title padd-15">I&apos;M VERY RESPONSIVE TO MESSAGES</h4>
                            <div className="row">
                                <div className="contact-form padd-15">
                                    <form id="contactForm">
                                        <div className="row">
                                            <div className="form-item col-6 padd-15">
                                                <div className="form-group">
                                                    <input type="text" name="name" id="cf-name" className="form-control" placeholder="Name" required />
                                                </div>
                                            </div>
                                            <div className="form-item col-6 padd-15">
                                                <div className="form-group">
                                                    <input type="email" name="email" id="cf-email" className="form-control" placeholder="Gmail" required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="form-item col-12 padd-15">
                                                <div className="form-group">
                                                    <input type="text" name="subject" id="cf-subject" className="form-control" placeholder="Subject" required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="form-item col-12 padd-15">
                                                <div className="form-group">
                                                    <textarea name="message" id="cf-message" className="form-control" placeholder="Message" required></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="form-item col-12 padd-15">
                                                <button type="submit" id="cf-submit" className="btn">Send Message</button>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="padd-15" style={{ flex: '0 0 100%', maxWidth: '100%' }}>
                                                <p id="cf-status" style={{ display: 'none', marginTop: '10px', textAlign: 'center', fontWeight: 600 }}></p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
                {/* ── End Main Content ─────────────────────────────────────────────── */}
            </div>

            {/* ── Portfolio Detail Modal ──────────────────────────────────────────── */}
            <div id="portfolioDetailOverlay" style={{
                display: 'none', position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.85)', zIndex: 999,
                overflowY: 'auto', padding: '20px'
            }}>
                <div id="portfolioDetailCard" style={{
                    maxWidth: '860px', margin: '40px auto',
                    background: 'var(--bg-black-100)', borderRadius: '12px',
                    overflow: 'hidden', position: 'relative'
                }}>
                    <button id="closeDetailBtn" style={{
                        position: 'absolute', top: '14px', right: '16px',
                        background: 'none', border: 'none', fontSize: '22px',
                        cursor: 'pointer', color: 'var(--text-black-900)', zIndex: 10, lineHeight: 1
                    }}>&#x2715;</button>
                    <div id="pdThumbnail" style={{ width: '100%', maxHeight: '400px', overflow: 'hidden', background: 'var(--bg-black-50)' }}>
                        <img id="pdThumbImg" src="" alt="" style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ padding: '24px 28px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <h2 id="pdTitle" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-black-900)', flex: 1 }}></h2>
                        </div>
                        <p id="pdDeskripsi" style={{ fontSize: '15px', color: 'var(--text-black-700)', lineHeight: 1.7, marginBottom: '16px' }}></p>
                        <div id="pdTeknologi" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}></div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <a id="pdGithub" href="#" target="_blank" rel="noopener" style={{
                                display: 'none', background: '#333', color: '#fff',
                                padding: '10px 24px', borderRadius: '40px', fontSize: '14px', fontWeight: 500
                            }}>
                                <i className="fa fa-brands fa-github"></i> GitHub
                            </a>
                            <a id="pdLink" href="#" target="_blank" rel="noopener" style={{
                                display: 'none', background: 'var(--skin-color)', color: '#fff',
                                padding: '10px 28px', borderRadius: '40px', fontSize: '14px', fontWeight: 500
                            }}>
                                <i className="fa fa-external-link-alt"></i> Lihat Project
                            </a>
                        </div>
                    </div>
                    <div id="pdGallerySection" style={{ display: 'none', padding: '0 28px 28px' }}>
                        <h4 style={{
                            fontSize: '16px', fontWeight: 700, color: 'var(--text-black-900)',
                            marginBottom: '14px', paddingTop: '20px',
                            borderTop: '1px solid var(--bg-black-50)'
                        }}>
                            <i className="fa fa-images" style={{ color: 'var(--skin-color)', marginRight: '8px' }}></i>Dokumentasi
                        </h4>
                        <div id="pdGalleryGrid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '12px'
                        }}></div>
                    </div>
                </div>
            </div>

            {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
            <div id="lightboxOverlay" style={{
                display: 'none', position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.95)', zIndex: 1000,
                alignItems: 'center', justifyContent: 'center'
            }}>
                <button id="closeLightboxBtn" style={{
                    position: 'absolute', top: '16px', right: '20px',
                    background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', lineHeight: 1
                }}>&#x2715;</button>
                <button id="lightboxPrevBtn" style={{
                    position: 'absolute', left: '16px',
                    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                    fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px'
                }}>&#8592;</button>
                <img id="lightboxImg" src="" alt="" style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '6px' }} />
                <button id="lightboxNextBtn" style={{
                    position: 'absolute', right: '16px',
                    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                    fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px'
                }}>&#8594;</button>
                <div id="lightboxCounter" style={{
                    position: 'absolute', bottom: '16px', left: '50%',
                    transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)',
                    fontSize: '13px', fontFamily: 'Poppins, sans-serif'
                }}></div>
            </div>

            {/* ── Style Switcher ───────────────────────────────────────────────────── */}
            <div className="style-switcher">
                <div className="style-switcher-toggler s-icon">
                    <i className="fas fa-cog fa-spin"></i>
                </div>
                <div className="day-night s-icon">
                    <i className="fas fa-sun"></i>
                </div>
                <h4>Theme Colors</h4>
                <div className="colors">
                    <span className="color-1" id="sc-1"></span>
                    <span className="color-2" id="sc-2"></span>
                    <span className="color-3" id="sc-3"></span>
                    <span className="color-4" id="sc-4"></span>
                    <span className="color-5" id="sc-5"></span>
                </div>
            </div>

            {/* ── Scripts ──────────────────────────────────────────────────────────── */}
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.1.0/typed.umd.js"
                strategy="beforeInteractive"
                referrerPolicy="no-referrer"
            />
            <Script src="/js/script.js" strategy="afterInteractive" />
            <Script src="/js/style-switcher.js" strategy="afterInteractive" />
            <Script id="portfolio-contact-handler" strategy="afterInteractive">{`
        // ── Portfolio Loader ────────────────────────────────────────────────
        async function loadPortfolio() {
          const row = document.getElementById('portfolioRow');
          try {
            const res = await fetch('/api/portfolio');
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat');
            const items = data.data || [];
            if (items.length === 0) {
              row.innerHTML = '<div class="portfolio-item padd-15" style="flex:0 0 100%;max-width:100%;text-align:center;padding:40px 0;color:var(--text-black-700);">Belum ada portfolio.</div>';
              return;
            }
            row.innerHTML = items.map(item => {
              const tech = item.technologies ? '<p style="font-size:11px;color:var(--text-black-700);margin:4px 10px 8px;line-height:1.4;">' + item.technologies + '</p>' : '';
              const dataAttr = encodeURIComponent(JSON.stringify(item));
              return '<div class="portfolio-item padd-15"><div class="portfolio-item-inner shadow-dark" style="cursor:pointer;" onclick="openPortfolioDetail(\\'' + dataAttr + '\\')"><div class="portfolio-img"><img src="' + item.thumbnail + '" alt="' + item.title + '" onerror="this.src=\\'/images/port.jpg\\'" style="transition:transform 0.3s ease;"></div>' + (item.title ? '<h4 style="padding:10px 10px 4px;font-size:14px;color:var(--text-black-900);font-weight:600;">' + item.title + '</h4>' : '') + tech + '</div></div>';
            }).join('');
          } catch(err) {
            row.innerHTML = '<div class="portfolio-item padd-15" style="flex:0 0 100%;max-width:100%;text-align:center;padding:40px 0;color:var(--text-black-700);">Gagal memuat portfolio.</div>';
          }
        }
        loadPortfolio();

        // ── Portfolio Detail Modal ──────────────────────────────────────────
        function openPortfolioDetail(encoded) {
          const item = JSON.parse(decodeURIComponent(encoded));
          document.getElementById('pdThumbImg').src = item.thumbnail || '/images/port.jpg';
          document.getElementById('pdTitle').textContent = item.title || '';
          document.getElementById('pdDeskripsi').textContent = item.description || '';
          const techEl = document.getElementById('pdTeknologi');
          techEl.innerHTML = item.technologies
            ? item.technologies.split(',').map(t => '<span style="background:var(--bg-black-50);color:var(--text-black-700);font-size:12px;padding:3px 12px;border-radius:20px;">' + t.trim() + '</span>').join('')
            : '';
          const githubEl = document.getElementById('pdGithub');
          if (item.github_url) { githubEl.href = item.github_url; githubEl.style.display = 'inline-block'; }
          else { githubEl.style.display = 'none'; }
          const linkEl = document.getElementById('pdLink');
          if (item.demo_url) { linkEl.href = item.demo_url; linkEl.style.display = 'inline-block'; }
          else { linkEl.style.display = 'none'; }

          // Fetch detail images
          const gallerySection = document.getElementById('pdGallerySection');
          const galleryGrid = document.getElementById('pdGalleryGrid');
          gallerySection.style.display = 'none';
          galleryGrid.innerHTML = '';
          fetch('/api/portfolio/' + item.slug)
            .then(r => r.json())
            .then(d => {
              if (d.success && d.data.images && d.data.images.length > 0) {
                window._lightboxImgs = d.data.images.map(i => i.url);
                galleryGrid.innerHTML = d.data.images.map((img, i) =>
                  '<div style="aspect-ratio:16/10;overflow:hidden;border-radius:8px;cursor:pointer;background:var(--bg-black-50);" onclick="openLightbox(' + i + ')"><img src="' + img.url + '" alt="' + (img.caption || 'Detail ' + (i+1)) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease;" onmouseover="this.style.transform=\\'scale(1.05)\\'" onmouseout="this.style.transform=\\'scale(1)\\'" onerror="this.parentElement.style.display=\\'none\\'"></div>'
                ).join('');
                gallerySection.style.display = 'block';
              }
            }).catch(() => {});

          document.getElementById('portfolioDetailOverlay').style.display = 'block';
          document.body.style.overflow = 'hidden';
        }

        function closePortfolioDetail() {
          document.getElementById('portfolioDetailOverlay').style.display = 'none';
          document.body.style.overflow = '';
        }
        document.getElementById('closeDetailBtn').addEventListener('click', closePortfolioDetail);
        document.getElementById('portfolioDetailOverlay').addEventListener('click', function(e) {
          if (e.target === this) closePortfolioDetail();
        });

        // ── Lightbox ────────────────────────────────────────────────────────
        let _lbIndex = 0;
        function openLightbox(index) {
          _lbIndex = index; updateLightbox();
          document.getElementById('lightboxOverlay').style.display = 'flex';
        }
        function closeLightbox() { document.getElementById('lightboxOverlay').style.display = 'none'; }
        function lightboxPrev() { _lbIndex = (_lbIndex - 1 + (window._lightboxImgs||[]).length) % (window._lightboxImgs||[1]).length; updateLightbox(); }
        function lightboxNext() { _lbIndex = (_lbIndex + 1) % (window._lightboxImgs||[1]).length; updateLightbox(); }
        function updateLightbox() {
          const imgs = window._lightboxImgs || [];
          document.getElementById('lightboxImg').src = imgs[_lbIndex] || '';
          document.getElementById('lightboxCounter').textContent = (_lbIndex+1) + ' / ' + imgs.length;
        }
        document.getElementById('closeLightboxBtn').addEventListener('click', closeLightbox);
        document.getElementById('lightboxPrevBtn').addEventListener('click', lightboxPrev);
        document.getElementById('lightboxNextBtn').addEventListener('click', lightboxNext);
        document.addEventListener('keydown', function(e) {
          if (document.getElementById('lightboxOverlay').style.display === 'flex') {
            if (e.key === 'ArrowLeft') lightboxPrev();
            if (e.key === 'ArrowRight') lightboxNext();
            if (e.key === 'Escape') closeLightbox();
          } else if (document.getElementById('portfolioDetailOverlay').style.display === 'block') {
            if (e.key === 'Escape') closePortfolioDetail();
          }
        });

        // ── Style switcher color onclick ─────────────────────────────────────
        document.getElementById('sc-1').onclick = () => setActiveStyle('color-1');
        document.getElementById('sc-2').onclick = () => setActiveStyle('color-2');
        document.getElementById('sc-3').onclick = () => setActiveStyle('color-3');
        document.getElementById('sc-4').onclick = () => setActiveStyle('color-4');
        document.getElementById('sc-5').onclick = () => setActiveStyle('color-5');

        // ── Contact Form ─────────────────────────────────────────────────────
        document.getElementById('contactForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const submitBtn = document.getElementById('cf-submit');
          const statusEl = document.getElementById('cf-status');
          const name = document.getElementById('cf-name').value.trim();
          const email = document.getElementById('cf-email').value.trim();
          const subject = document.getElementById('cf-subject').value.trim();
          const message = document.getElementById('cf-message').value.trim();
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
          statusEl.style.display = 'none';
          try {
            const res = await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, subject, message }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              statusEl.textContent = '✅ Pesan berhasil dikirim!';
              statusEl.style.color = 'var(--skin-color)';
              statusEl.style.display = 'block';
              document.getElementById('contactForm').reset();
            } else {
              statusEl.textContent = '❌ ' + (data.error || 'Gagal mengirim pesan. Coba lagi.');
              statusEl.style.color = '#e74c3c';
              statusEl.style.display = 'block';
            }
          } catch(err) {
            statusEl.textContent = '❌ Terjadi kesalahan. Periksa koneksi internet Anda.';
            statusEl.style.color = '#e74c3c';
            statusEl.style.display = 'block';
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        });
      `}</Script>
        </>
    );
}
