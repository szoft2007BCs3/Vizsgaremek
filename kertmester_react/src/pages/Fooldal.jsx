import { useEffect, useState } from 'react';
import ProductIcon from '../components/ProductIcon.jsx';
import { CATEGORIES, PRODUCTS } from '../lib/adatok.js';
import { formatArea, formatPrice } from '../lib/format.js';
import { clamp, getGarden, getPlacedItems, getQuantities, getZones, increaseQuantity, setGarden } from '../lib/store.js';
import { usePlan } from '../lib/usePlan.js';
import { navigate } from '../lib/useRoute.js';

const SEASON_TIPS = [
  { month: 'Január', tip: 'Itt a tervezés ideje: rajzold meg a kertet, amíg odakint pihen a föld.', category: 4 },
  { month: 'Február', tip: 'Metszd vissza a gyümölcsfákat és rendezd a szerszámaidat a tavaszi szezonra.', category: 4 },
  { month: 'Március', tip: 'Kezdődik a szezon: vess palántákat, ültess rózsát és javítsd a gyepet.', category: 12 },
  { month: 'Április', tip: 'Ültesd ki a fákat, cserjéket, és vesd el a fűmagot.', category: 2 },
  { month: 'Május', tip: 'Fagyosszentek után jöhetnek a virágok, a paradicsom és a paprika.', category: 1 },
  { month: 'Június', tip: 'Öntözz hajnalban, és állítsd be az automata öntözést.', category: 5 },
  { month: 'Július', tip: 'Árnyékoló, pihenőbútor és napelemes lámpák: élvezd a kertet.', category: 6 },
  { month: 'Augusztus', tip: 'Itt az öntözés és a tápoldatozás csúcsideje, a gyep is hálás érte.', category: 8 },
  { month: 'Szeptember', tip: 'Az ősz a legjobb gyepvetési és fatelepítési idő.', category: 3 },
  { month: 'Október', tip: 'Ültess virághagymát, és rakd rendbe az ösvényeket és burkolatokat.', category: 11 },
  { month: 'November', tip: 'Védd a növényeket a faggyal, és tedd télire a szerszámokat.', category: 10 },
  { month: 'December', tip: 'Világítsd ki a kertet, és tervezd meg a tavaszi átalakítást.', category: 7 }
];

const FEATURED_CATEGORIES = [2, 1, 11, 6, 12];
const CHIP_LABELS = { 1: 'Virágok', 2: 'Fák és cserjék', 6: 'Bútorok', 11: 'Utak és burkolatok', 12: 'Veteményes' };
const FEATURED_COUNT = 4;

function StartCard() {
  usePlan();
  const [length, setLength] = useState(getGarden().length);
  const [width, setWidth] = useState(getGarden().width);
  const itemCount = getPlacedItems().length;
  const zoneCount = getZones().length;

  function start(e) {
    e.preventDefault();
    setGarden(clamp(Number(length) || 15, 1, 500), clamp(Number(width) || 10, 1, 500));
    navigate('tervezo');
  }

  return (
    <form className="start-card" onSubmit={start}>
      <h2>Indítsd el a tervet</h2>
      <div className="start-fields">
        <label>Hosszúság (m)<input type="number" min="1" max="500" step="0.5" value={length} onChange={(e) => setLength(e.target.value)} required /></label>
        <label>Szélesség (m)<input type="number" min="1" max="500" step="0.5" value={width} onChange={(e) => setWidth(e.target.value)} required /></label>
      </div>
      <p className="start-area">Telek: <strong>{formatArea((Number(length) || 0) * (Number(width) || 0))}</strong></p>
      <button className="btn-hero" type="submit">Tervezés indítása</button>
      {(itemCount > 0 || zoneCount > 0) && (
        <a className="start-continue" href="#/tervezo">Folytatom a tervem ({itemCount} elem, {zoneCount} terület) →</a>
      )}
    </form>
  );
}

function FeaturedCard({ product }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return undefined;
    const timer = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(timer);
  }, [added]);

  function add() {
    increaseQuantity(product.ID);
    setAdded(true);
  }

  return (
    <li className="featured-card">
      <div className="featured-head-row">
        <ProductIcon product={product} />
        <strong>{product.Nev}</strong>
      </div>
      <span className="featured-size">{product.Meret_Adatok}</span>
      <span className="featured-price">{formatPrice(product.Ar)}</span>
      <button type="button" className="btn-add" onClick={add}>{added ? 'Hozzáadva ✓' : 'Kosárba'}</button>
    </li>
  );
}

function Featured() {
  const [activeCategory, setActiveCategory] = useState(FEATURED_CATEGORIES[0]);
  const [query, setQuery] = useState('');
  const picks = PRODUCTS.filter((product) => product.Kategoria_ID === activeCategory).slice(0, FEATURED_COUNT);

  function search(e) {
    e.preventDefault();
    navigate(`webshop?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="featured">
      <div className="featured-head">
        <h2>Kiemelt termékek</h2>
        <form className="home-search" role="search" onSubmit={search}>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Keresés a webshopban…" aria-label="Keresés a webshopban" autoComplete="off" />
          <button type="submit">Keresés</button>
        </form>
      </div>
      <div className="chips" role="tablist" aria-label="Kategóriák">
        {FEATURED_CATEGORIES.map((id) => (
          <button key={id} type="button" role="tab" aria-selected={id === activeCategory} className={`chip${id === activeCategory ? ' active' : ''}`} onClick={() => setActiveCategory(id)}>
            {CHIP_LABELS[id]}
          </button>
        ))}
      </div>
      <ul className="featured-list">
        {picks.map((product) => <FeaturedCard key={product.ID} product={product} />)}
      </ul>
    </div>
  );
}

function Season() {
  const season = SEASON_TIPS[new Date().getMonth()];
  return (
    <aside className="season">
      <p className="eyebrow">Most ültess</p>
      <h3>{season.month}</h3>
      <p>{season.tip}</p>
      <a className="season-link" href={`#/webshop?kat=${season.category}`}>Ajánlott termékek →</a>
    </aside>
  );
}

const GALLERY = ['Családi előkert', 'Teraszos pihenőkert', 'Virágos sorházkert'];

export default function Fooldal() {
  usePlan();
  const cartCount = Object.values(getQuantities()).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Kerttervező stúdió · Pósfa</p>
          <h1>Tervezd meg a kertedet, <em>mielőtt</em> elültetnéd az első növényt.</h1>
          <p className="hero-lead">Méretarányos kerttervező valódi növényméretekkel, és egy webshop, amely a tervedből állítja össze a kosarat.</p>
        </div>
        <StartCard />
      </section>

      <section className="stats" aria-label="Számokban">
        <div><strong>{PRODUCTS.length}</strong><span>termék</span></div>
        <div><strong>{CATEGORIES.length}</strong><span>kategória</span></div>
        <div><strong>500 × 500 m</strong><span>max. kert</span></div>
        <div><strong>{cartCount}</strong><span>tétel a kosaradban</span></div>
      </section>

      <section className="shelf" id="webshop">
        <Featured />
        <Season />
      </section>

      <section className="how" id="bemutatkozas">
        <div className="how-intro">
          <h2>Pósfáról, kertészeknek.</h2>
          <p>A jó kert nem a szerencsén múlik, hanem a tervezésen. Nálunk elég egy böngésző: megadod a telked méretét, megrajzolod, és a kosarad magától összeáll.</p>
        </div>
        <ol className="steps">
          <li><span>01</span><strong>Rajzold meg</strong><small>Gyep, tó, út és burkolat, szabadkézzel vagy alakzatokkal.</small></li>
          <li><span>02</span><strong>Lásd kinőni</strong><small>Kifejlett méret, lombárnyék, ültetési távolság.</small></li>
          <li><span>03</span><strong>Rendeld meg</strong><small>Terv alapú kosár, utánvéttel vagy kártyával.</small></li>
        </ol>
      </section>

      <section className="location" id="terkep">
        <div className="location-text">
          <h2>Itt találsz minket</h2>
          <p><strong>Székhelyünk:</strong> Pósfa, Vas vármegye</p>
          <p><a href="mailto:hello@kertmester.hu">hello@kertmester.hu</a><br /><a href="tel:+36301234567">+36 30 123 4567</a></p>
          <a className="map-link" href="https://www.openstreetmap.org/?mlat=47.327&mlon=16.853#map=14/47.327/16.853" target="_blank" rel="noopener noreferrer">Nagyobb térkép →</a>
        </div>
        <div className="map-frame">
          <iframe title="Kertmester székhelye, Pósfa" loading="lazy" referrerPolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=16.80%2C47.30%2C16.91%2C47.355&layer=mapnik&marker=47.327%2C16.853"></iframe>
        </div>
      </section>

      <section className="gallery" id="galeria">
        <h2>Galéria <small>az első három hely szabad</small></h2>
        <div className="gallery-grid">
          {GALLERY.map((title) => (
            <figure className="shot" key={title}>
              <div className="shot-frame"><span>Hamarosan</span></div>
              <figcaption>{title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
