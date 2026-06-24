import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const HERO_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDVkIich8b4C3FMpq_Ud40JaKcCjp0NVYY5WX9UlxdC-2QzKgDzLTTFygg5kWXgVvDJJ9flUgAjo4cMQO7cGSnMP1yMNi6jFo5XEvPvjHiewudm66tJvXQ84JjU1vKatfoEGx5f5IuIRx9jS2C7OOEQ3D-5pkdjDo9TmYmflPSTxz3Qqk0X2Mq0OyNj-dmo5V2HNgbqms_nXogEAzfYsICX7bfBUt_ESFHXWspXLeyLVNfiVQ6Kk55uA7R3B3or5cQhWEic2hxeP38K';

const disciplines = [
  {
    icon: 'photo_camera',
    title: 'Photography',
    desc: 'High-resolution stills capturing decisive moments. From architectural grandeur to intimate portraits, we freeze time with uncompromising clarity.',
  },
  {
    icon: 'movie_filter',
    title: 'Cinematic Video',
    desc: 'Narrative-driven visual sequences. We utilize industry-standard gear to produce atmospheric, emotionally resonant motion pictures.',
  },
  {
    icon: 'podcasts',
    title: 'Live Coverage',
    desc: 'Real-time event documentation. Dynamic, agile, and unobtrusive coverage ensuring no critical institutional moment is lost.',
  },
];

const fallbackGallery = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCsblhyNy0qJkpJr_KiQLFm3YD8xw9ZGEZIT76Wmr2kQPd5g71ZSO_t8EcrfCWZmWtKQk9_LRpp2kK587lIl4IPdp_7X9UUMfkKgj0p0hQXeeUrNeEjvCUY2N2CqDJodseMACxXtclsCQCp-CSjwpEVQcx2gTO4WHprKzRRYS32fzUdAL5rEILYo8Pdsuy19vnAL8er8k8v_wgbEAzrQjVhNsZqvJdc8w1MHGLtxiEOpd-fKTcpgXfw-vGripCTn0QHzFGCGe6jnQrL',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4F02SQkFVhPGe3-WqLbvxTMuxRwMSYRJlZX_VpcOeif1QFOiPYEhQV2_JdTklRhNdoYZuAJ8-J7hNdDqNtShAYGe0jf-BtBTer365bfcVbX3DBBAv5L5ueluvr0oJAV7WKsJEx8wS3xEOMLPHVAhwKmeGQzbQiQpeJm5qkFJVFkdyibI1RQGhBloMopL47-e4hblXu2c8rWtBi4YbeEvrw158dxJrxTFNJR_e0ctbaBYEUZqyUhPgftRiCTUQDqizCoEvut6snAbX',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWWWNWTAeh2GzTYnvUjskfg5NOWInuZVRbg9YmAUVKOZIqKd2BjU8fqU1nOIcvezL0J-UUTQeofQbPE-KviuQH7zAl-xZdUgweEMioHbiAxuUSPGy22j1NgkFhIPt5416Be98a9FKoTaHGqFWGflFGUoHzkIn2q9PG1bZXyWevpgn2NeFd_T7PBpku_8VniDVRN6STuUOye6Eg_qINYbHtJO0ZPjP1nHd7UzKTyXiJzL_J3rASzOttH100Hrm5k7id3r2zKfVZyorT',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1Zk8qjRg0nq3ZlkU9WphcEPcpv7nP7FAAIR6ZChysvm-Q8VGxh5tzh4H8O5PpP26g2i30MEg0e4OUBFKJYMpWO5B0zq5J9y1tmCvpraWecuNDtd8tFfReViQ_rAp9uNL5UElAGOMCEtpWr9y0UmqRigG6b9xAlPtDQ6N50rrzNUC31tv2Hsr61_zC3fWWbSlMgCX25dPeVA6L5JnbhJ-HK4HZLfG11lXndUZH7JtPG5QqX9Dz0TZ_NvDkNAY3tq-ZwtiPZpVj2uNT',
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', brief: '' });
  const [submitted, setSubmitted] = useState(false);

  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [eventsRes, teamsRes] = await Promise.all([
          axios.get(`${API}/api/events`),
          axios.get(`${API}/api/teams`),
        ]);
        setEvents(eventsRes.data || []);
        setTeams(teamsRes.data || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };
    fetchData();
  }, []);

  const galleryImages = events.filter((e) => e.imageUrl).slice(0, 4);
  const displayGallery = galleryImages.length >= 4
    ? galleryImages
    : fallbackGallery.map((url, i) => ({ id: i, imageUrl: url, eventName: 'Archive' }));

  const latestTeam = teams[0];
  const crewLeads = latestTeam?.leads?.slice(0, 4) || [];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setContactForm({ name: '', email: '', brief: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <header className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="glow-blob glow-red -top-20 -left-20" />
        <div className="glow-blob glow-red -bottom-20 -right-20 opacity-10" />
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.55) 40%, rgba(10,10,10,0.85) 100%), url(${HERO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20 fade-in-section is-visible">
          <div className="inline-block mb-8 px-4 py-1.5 border border-white/10 backdrop-blur-xl bg-white/5">
            <span className="font-label text-label-caps text-accent-red flex items-center gap-2 uppercase">
              <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
              TCAP Media
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-display-lg text-primary mb-8 uppercase tracking-tight">
            Capturing the Legacy
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">
            The Official Media Coverage Team of TCET. We frame the moments that define an institution with uncompromising cinematic precision.
          </p>
          <Link
            to="/gallery"
            className="cta-glow inline-block bg-primary text-background px-10 py-5 font-label text-label-caps tracking-[0.2em] uppercase transition-all duration-500 hover:bg-accent-red hover:text-white border border-transparent"
          >
            Explore Archives
          </Link>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <span className="material-symbols-outlined text-outline">expand_more</span>
        </div>
      </header>

      <main className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg relative">
        <div className="glow-blob glow-red top-[15%] right-[-10%] opacity-10" />

        {/* Origin */}
        <section className="py-stack-lg fade-in-section border-t border-white/5 mt-stack-md" id="about">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-4">
              <h2 className="font-display text-headline-lg text-accent-red uppercase tracking-widest">01 // Origin</h2>
            </div>
            <div className="md:col-span-8">
              <p className="font-display text-2xl md:text-display-sm text-primary leading-tight mb-8">
                Born from a passion for visual storytelling, TCAP exists to document the pulse of collegiate life.
              </p>
              <p className="font-body text-body-lg text-on-surface-variant max-w-3xl">
                We are an authoritative collective of photographers, cinematographers, and editors dedicated to producing high-impact, institutional-grade media. Our philosophy is rooted in cinematic minimalism — allowing the subject to command total attention while the interface recedes into the void. TCAP is equipped for outhouse events and external collaborations when the moment demands it.
              </p>
            </div>
          </div>
        </section>

        {/* Disciplines */}
        <section className="py-stack-lg fade-in-section" id="expertise">
          <div className="mb-stack-md">
            <h2 className="font-display text-headline-lg text-primary uppercase tracking-widest inline-flex flex-col">
              02 // Disciplines
              <span className="h-[2px] w-full bg-gradient-to-r from-accent-red to-accent-red/40 mt-2" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {disciplines.map((d) => (
              <div key={d.title} className="glass-card group p-10">
                <span className="material-symbols-outlined text-4xl text-accent-red mb-8 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {d.icon}
                </span>
                <h3 className="font-display text-headline-lg text-primary mb-5">{d.title}</h3>
                <p className="font-body text-body-md text-on-surface-variant">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery preview */}
        <section className="py-stack-lg fade-in-section" id="gallery-preview">
          <div className="flex justify-between items-end mb-stack-md">
            <h2 className="font-display text-headline-lg text-accent-red uppercase tracking-widest">03 // Archives</h2>
            <Link to="/gallery" className="font-label text-label-caps text-accent-red border border-accent-red px-4 py-1.5 hidden md:inline-block backdrop-blur-sm hover:bg-accent-red hover:text-white transition-all">
              View Portfolio
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[280px] md:auto-rows-[350px]">
            {displayGallery.slice(0, 4).map((item, idx) => {
              const spans = ['md:col-span-8', 'md:col-span-4', 'md:col-span-4', 'md:col-span-8'];
              return (
                <div key={item.id || idx} className={`${spans[idx]} relative overflow-hidden bg-surface gallery-item cursor-crosshair border border-white/5`}>
                  <img src={item.imageUrl} alt={item.eventName || 'Archive'} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                </div>
              );
            })}
          </div>
          <div className="text-center mt-stack-md">
            <Link to="/gallery" className="inline-flex items-center gap-3 font-label text-label-caps text-on-surface-variant hover:text-accent-red transition-all">
              View Full Archive <span className="material-symbols-outlined text-sm">trending_flat</span>
            </Link>
          </div>
        </section>

        {/* Crew preview */}
        <section className="py-stack-lg fade-in-section border-t border-white/5" id="team-preview">
          <h2 className="font-display text-headline-lg text-primary uppercase tracking-widest mb-stack-md">04 // The Crew</h2>
          {crewLeads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {crewLeads.map((member, idx) => (
                <div key={idx} className="group team-portrait-card">
                  <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface border border-white/5 transition-all duration-500">
                    <img
                      src={member.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-body text-body-lg text-primary uppercase font-bold tracking-tight">{member.name}</h4>
                  <p className="font-mono text-mono-technical text-accent-red mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-on-surface-variant">Team roster loading — visit the full team page.</p>
          )}
          <div className="text-center mt-stack-md">
            <Link to="/team" className="inline-flex items-center gap-3 font-label text-label-caps text-on-surface-variant hover:text-accent-red transition-all">
              View Full Team <span className="material-symbols-outlined text-sm">trending_flat</span>
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section className="py-stack-lg fade-in-section relative" id="contact">
          <div className="glow-blob glow-red bottom-[-10%] left-[-10%] opacity-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md liquid-glass p-8 md:p-20 border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent-red/20 to-transparent" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-display-sm text-primary mb-6 leading-none">
                Initialize
                <br />
                Production.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant mb-12 max-w-md">
                Submit your brief. We review all inquiries within 24 hours to determine alignment with our production capabilities.
              </p>
              <div className="space-y-6 font-mono text-mono-technical text-on-surface">
                <p className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent-red">alternate_email</span>
                  TCAP@TCET.EDU
                </p>
                <p className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent-red">location_on</span>
                  TCET Campus, Stage 4
                </p>
              </div>
            </div>
            <div className="relative z-10">
              <form className="space-y-8" onSubmit={handleContactSubmit}>
                <input
                  className="ghost-input"
                  placeholder="NAME / ORGANIZATION"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
                <input
                  className="ghost-input"
                  type="email"
                  placeholder="EMAIL / PHONE NUMBER"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
                <textarea
                  className="ghost-input resize-none"
                  placeholder="PROJECT BRIEF / SCOPE"
                  rows={4}
                  value={contactForm.brief}
                  onChange={(e) => setContactForm({ ...contactForm, brief: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary text-background px-10 py-5 font-label text-label-caps tracking-widest uppercase hover:bg-accent-red hover:text-white transition-all duration-300 mt-6"
                >
                  {submitted ? 'Transmitted' : 'Transmit'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
