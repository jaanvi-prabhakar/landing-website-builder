import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroParticles from './components/HeroParticles';
import HeroPlate from './components/HeroPlate';
import DishDisc3D from './components/DishDisc';
import './App.css';

/* ─── Animation Variants ─── */
const ease = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, delay: i * 0.1, ease },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: i * 0.08, ease },
  }),
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const VP = { once: true, margin: '-80px' };

/* ─── Data ─── */
const menuItems = [
  {
    name: 'Saffron Lamb Chops',
    description: 'Tender lamb chops marinated in saffron, yogurt, and Kashmiri spices. Chargrilled and served with mint chutney.',
    price: '£18',
    tag: 'Signature',
  },
  {
    name: 'Truffle Pani Puri',
    description: 'Crisp semolina shells filled with spiced potato, tamarind water, and a whisper of black truffle oil.',
    price: '£12',
    tag: 'Chef\'s Pick',
  },
  {
    name: 'Butter Chicken Bao',
    description: 'Fluffy steamed bao stuffed with slow-cooked butter chicken, pickled onion, and coriander.',
    price: '£14',
    tag: null,
  },
  {
    name: 'Charred Paneer Tikka',
    description: 'Smoky paneer cubes with bell pepper, onion, and our house-blend tandoori marinade. Served on a sizzling plate.',
    price: '£13',
    tag: 'Vegetarian',
  },
  {
    name: 'Masala Prawn Ceviche',
    description: 'Tiger prawns cured in raw mango and green chilli, with crispy lotus root and coconut foam.',
    price: '£16',
    tag: 'New',
  },
  {
    name: 'Cardamom Crème Brûlée',
    description: 'Classic French technique infused with green cardamom and topped with caramelized jaggery.',
    price: '£10',
    tag: 'Dessert',
  },
];

/* ─── Navbar ─── */
function Navbar() {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease }}
    >
      <div className="nav-inner">
        <a href="#hero" className="nav-logo">
          <span className="nav-logo-the">The</span>
          <span className="nav-logo-main">Indian Tapas</span>
        </a>
        <div className="nav-links">
          <a href="#story">Our Story</a>
          <a href="#menu">Menu</a>
          <a href="#ambience">Experience</a>
          <a href="#reservation" className="nav-reserve">Reserve a Table</a>
        </div>
      </div>
    </motion.nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const taglineY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const buttonsY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section className="hero" id="hero" ref={ref}>
      <HeroParticles />
      <div className="hero-overlay" />
      <div className="hero-split">
        <div className="hero-content">
          <motion.span
            className="hero-tagline"
            style={{ y: taglineY, opacity: textOpacity }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
          >
            A Modern Indian Dining Experience
          </motion.span>
          <motion.h1
            className="hero-title"
            style={{ y: textY, opacity: textOpacity }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease }}
          >
            Where Tradition<br />
            Meets <em>Artistry</em>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            style={{ y: textY, opacity: textOpacity }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease }}
          >
            Small plates. Bold flavors. Centuries of spice mastery reimagined
            for the modern palate.
          </motion.p>
          <motion.div
            className="hero-actions"
            style={{ y: buttonsY, opacity: textOpacity }}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease }}
          >
            <a href="#menu" className="btn btn-primary">Explore the Menu</a>
            <a href="#reservation" className="btn btn-ghost">Reserve a Table</a>
          </motion.div>
        </div>
        <motion.div
          className="hero-plate-wrapper"
          style={{ opacity: textOpacity }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease }}
        >
          <HeroPlate />
        </motion.div>
      </div>
      <motion.div
        className="hero-scroll-hint"
        style={{ opacity: scrollHintOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
      >
        <span className="scroll-line" />
        <span className="scroll-text">Scroll to discover</span>
      </motion.div>
    </section>
  );
}

/* ─── Story ─── */
function Story() {
  return (
    <section className="story" id="story">
      <div className="story-inner">
        <motion.div
          className="story-left"
          variants={slideFromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
        >
          <motion.span className="section-label" variants={fadeUp}>Our Philosophy</motion.span>
          <motion.h2 className="section-heading" variants={fadeUp} custom={1}>
            Indian Flavors,<br />
            <em>Reimagined</em>
          </motion.h2>
          <motion.div className="story-divider" variants={fadeUp} custom={2} />
          <motion.p className="story-text" variants={fadeUp} custom={3}>
            At The Indian Tapas, we believe the richness of Indian cuisine
            deserves a stage as vibrant as its flavors. Our chefs draw from
            generations of culinary tradition — then break every rule.
          </motion.p>
          <motion.p className="story-text" variants={fadeUp} custom={4}>
            Each small plate is a conversation between heritage and innovation.
            Fragrant spices meet unexpected textures. Familiar flavors arrive
            in unfamiliar forms. Every bite tells a story of where India has been
            — and where it's going.
          </motion.p>
          <motion.div
            className="story-stats"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
          >
            {[
              { value: '12', label: 'Spice Regions' },
              { value: '40+', label: 'Small Plates' },
              { value: '8', label: 'Years of Craft' },
            ].map((s) => (
              <motion.div className="stat" key={s.label} variants={fadeUp}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          className="story-right"
          variants={slideFromRight}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
        >
          <div className="story-image-grid">
            <motion.div className="story-img story-img--tall" variants={scaleIn} custom={0}>
              <div className="story-img-placeholder" style={{ background: 'linear-gradient(145deg, #2a1f12 0%, #1a130b 50%, #d4912a22 100%)' }}>
                <span className="img-label">Spice Selection</span>
              </div>
            </motion.div>
            <motion.div className="story-img story-img--square" variants={scaleIn} custom={1}>
              <div className="story-img-placeholder" style={{ background: 'linear-gradient(145deg, #1a130b 0%, #8b2c1a33 100%)' }}>
                <span className="img-label">Plating Art</span>
              </div>
            </motion.div>
            <motion.div className="story-img story-img--square" variants={scaleIn} custom={2}>
              <div className="story-img-placeholder" style={{ background: 'linear-gradient(145deg, #161009 0%, #c9a84c22 100%)' }}>
                <span className="img-label">Open Kitchen</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Featured 3D Dishes ─── */
const featuredDishes = [
  {
    color: '#b8711a',
    emissive: '#5a3508',
    spotColor: '#d4912a',
    label: 'Saffron Curry',
    subtitle: 'Rich, aromatic, unforgettable',
  },
  {
    color: '#8b2c1a',
    emissive: '#3d1009',
    spotColor: '#c0392b',
    label: 'Tandoori Flame',
    subtitle: 'Charred to smoky perfection',
  },
  {
    color: '#1a6b4a',
    emissive: '#0a3324',
    spotColor: '#27ae60',
    label: 'Herb Garden',
    subtitle: 'Fresh, vibrant, seasonal',
  },
];

function useInView(ref, margin = '-100px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { rootMargin: margin, threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, margin]);
  return inView;
}

/* ─── Menu ─── */
function Menu() {
  const showcaseRef = useRef(null);
  const showcaseInView = useInView(showcaseRef);

  return (
    <section className="menu" id="menu">
      <div className="menu-inner">
        <motion.div
          className="section-header"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
        >
          <motion.span className="section-label" variants={fadeUp}>The Menu</motion.span>
          <motion.h2 className="section-heading" variants={fadeUp}>
            Signature <em>Small Plates</em>
          </motion.h2>
          <motion.p className="section-subtitle" variants={fadeUp}>
            A curated selection from our seasonal tasting menu.
            Each dish is crafted to share, savour, and remember.
          </motion.p>
        </motion.div>

        {/* ── 3D Dish Showcase ── */}
        <div className="dish-showcase" ref={showcaseRef}>
          {featuredDishes.map((dish, i) => (
            <motion.div
              className="dish-showcase-card"
              key={dish.label}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <DishDisc3D
                color={dish.color}
                emissive={dish.emissive}
                spotColor={dish.spotColor}
                label={dish.label}
                subtitle={dish.subtitle}
                isInView={showcaseInView}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="menu-grid"
          variants={staggerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
        >
          {menuItems.map((item, i) => (
            <motion.div
              className="menu-card"
              key={item.name}
              variants={scaleIn}
              custom={i}
              whileHover={{
                y: -8,
                borderColor: 'rgba(201, 168, 76, 0.4)',
                transition: { duration: 0.25 },
              }}
            >
              <div className="menu-card-top">
                <div className="menu-card-visual">
                  <div className="dish-circle" />
                </div>
              </div>
              <div className="menu-card-body">
                <div className="menu-card-header">
                  <h3 className="menu-card-name">{item.name}</h3>
                  <span className="menu-card-price">{item.price}</span>
                </div>
                {item.tag && <span className="menu-card-tag">{item.tag}</span>}
                <p className="menu-card-desc">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="menu-cta"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
        >
          <a href="#reservation" className="btn btn-primary">View Full Menu</a>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Ambience ─── */
function Ambience() {
  return (
    <section className="ambience" id="ambience">
      <div className="ambience-inner">
        <motion.div
          className="ambience-visual"
          variants={slideFromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
        >
          <div className="ambience-placeholder">
            <div className="ambience-glow" />
            <span className="ambience-visual-label">The Dining Room</span>
          </div>
        </motion.div>
        <motion.div
          className="ambience-content"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
        >
          <motion.span className="section-label" variants={fadeUp}>The Experience</motion.span>
          <motion.h2 className="section-heading" variants={fadeUp}>
            An Atmosphere<br />
            <em>Worth Savouring</em>
          </motion.h2>
          <motion.div className="ambience-features" variants={staggerSlow}>
            {[
              {
                title: 'Intimate Setting',
                text: 'Warm lighting, rich textures, and spaces designed for conversation and connection.',
              },
              {
                title: 'Open Tandoor Kitchen',
                text: 'Watch our chefs craft each dish over live flame — the theatre of Indian cooking, up close.',
              },
              {
                title: 'Curated Cocktails',
                text: 'Spice-infused craft cocktails designed to pair perfectly with every plate on the menu.',
              },
            ].map((f) => (
              <motion.div className="ambience-feature" key={f.title} variants={fadeUp}>
                <div className="ambience-icon">✦</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Reservation CTA ─── */
function Reservation() {
  return (
    <section className="reservation" id="reservation">
      <motion.div
        className="reservation-inner"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={VP}
      >
        <motion.div className="reservation-decorative" variants={fadeIn}>
          <div className="deco-line deco-line--left" />
          <span className="deco-diamond">◆</span>
          <div className="deco-line deco-line--right" />
        </motion.div>
        <motion.span className="section-label" variants={fadeUp}>Join Us</motion.span>
        <motion.h2 className="reservation-heading" variants={fadeUp}>
          Your Table <em>Awaits</em>
        </motion.h2>
        <motion.p className="reservation-text" variants={fadeUp}>
          Whether it's a weeknight escape or a celebration worth remembering,
          we'd love to welcome you. Reserve your experience at The Indian Tapas.
        </motion.p>
        <motion.div
          className="reservation-details"
          variants={stagger}
        >
          {[
            { label: 'Location', value: '42 Soho Square, London W1D 3PZ' },
            { label: 'Hours', value: 'Tue — Sun, 5:30 PM — 11:00 PM' },
            { label: 'Contact', value: '+44 20 7946 0123' },
          ].map((d) => (
            <motion.div className="detail" key={d.label} variants={fadeUp}>
              <span className="detail-label">{d.label}</span>
              <span className="detail-value">{d.value}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp}>
          <a href="#reservation" className="btn btn-primary btn-lg">Reserve a Table</a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease }}
    >
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="nav-logo-the">The</span>
            <span className="nav-logo-main">Indian Tapas</span>
            <p className="footer-tagline">
              Where tradition meets artistry. Modern Indian small plates in the heart of London.
            </p>
          </div>
          <div className="footer-columns">
            <div className="footer-col">
              <h4>Visit</h4>
              <p>42 Soho Square</p>
              <p>London W1D 3PZ</p>
              <p>Tue — Sun, 5:30 PM — 11 PM</p>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="#footer">Instagram</a>
              <a href="#footer">Facebook</a>
              <a href="#footer">TripAdvisor</a>
            </div>
            <div className="footer-col">
              <h4>Explore</h4>
              <a href="#menu">Menu</a>
              <a href="#story">Our Story</a>
              <a href="#reservation">Reservations</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 The Indian Tapas. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}

/* ─── App ─── */
function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Story />
      <Menu />
      <Ambience />
      <Reservation />
      <Footer />
    </div>
  );
}

export default App;
