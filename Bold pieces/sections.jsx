// sections.jsx — Bold Pieces landing page sections

const { useState, useEffect, useRef, useMemo } = React;

/* ───────────────── PRODUCT DATA ───────────────── */
const PRODUCTS = [
  { id: 'p1', name: 'Solène Solitaire',  category: 'Rings',     price: 2480, sub: '18k yellow gold · 0.7ct',  badge: 'New',       Art: StoneRing },
  { id: 'p2', name: 'Aria Drape',         category: 'Necklaces', price: 1180, sub: 'Snake chain · 18in',       badge: null,        Art: ChainNecklace },
  { id: 'p3', name: 'Petal Studs',        category: 'Earrings',  price:  720, sub: 'Pavé · 14k gold',          badge: null,        Art: Studs },
  { id: 'p4', name: 'Lumen Tennis',       category: 'Bracelets', price: 3650, sub: '4.5ct total weight',       badge: 'Limited',   Art: TennisBracelet },
  { id: 'p5', name: 'Halo Pendant',       category: 'Pendants',  price: 1490, sub: '0.5ct · 16in chain',       badge: null,        Art: Pendant },
  { id: 'p6', name: 'Maris Signet',       category: 'Rings',     price:  980, sub: 'Hand-engraved · 18k',      badge: null,        Art: SignetRing },
  { id: 'p7', name: 'Orbit Bangle',       category: 'Bracelets', price: 1280, sub: '18k · single stone',       badge: 'New',       Art: Bangle },
  { id: 'p8', name: 'Mira Hoops',         category: 'Earrings',  price:  640, sub: 'Polished · 14k',           badge: null,        Art: Hoops },
];

/* ───────────────── ANNOUNCEMENT MARQUEE ───────────────── */
function Announce(){
  const items = [
    'Complimentary engraving on every order',
    'Hand-forged in our Antwerp atelier',
    'Free shipping over $250',
    'Lifetime guarantee on every piece',
    'Conflict-free, traceable stones',
  ];
  const row = (
    <>
      {items.map((t,i)=>(
        <React.Fragment key={i}>
          <span className="dot">◆</span>
          <span>{t}</span>
        </React.Fragment>
      ))}
    </>
  );
  return (
    <div className="announce">
      <div className="track">{row}{row}</div>
    </div>
  );
}

/* ───────────────── NAV ───────────────── */
function Nav({ cartCount, onOpenCart }){
  return (
    <header className="nav">
      <div className="nav-inner">
        <nav className="nav-links">
          <a className="nav-link" href="#collections">Collections</a>
          <a className="nav-link" href="#bespoke">Bespoke</a>
          <a className="nav-link" href="#atelier">Atelier</a>
          <a className="nav-link" href="#journal">Journal</a>
          <a className="nav-link" href="#contact">Contact</a>
        </nav>
        <div className="logo" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="logo-mark">B</div>
          <div className="logo-word">BOLD PIECES</div>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search"><Icon.Search /></button>
          <button className="icon-btn" aria-label="Account"><Icon.User /></button>
          <button className="icon-btn cart-btn" aria-label="Cart" onClick={onOpenCart}>
            <Icon.Bag />
            {cartCount > 0 && <span className="cart-pill">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ───────────────── HERO ───────────────── */
function Hero({ variant }){
  if (variant === 'centered') return <HeroCentered/>;
  if (variant === 'overlay')  return <HeroOverlay/>;
  return <HeroSplit/>;
}

function HeroSplit(){
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="hero-eyebrow">
            <span className="bar"/>
            <span className="eyebrow">Bold Pieces · Maison Atelier · Est. 2018</span>
          </div>
          <h1 className="serif">
            Quietly worn.<br/>
            <em>Boldly</em> made.
          </h1>
          <p className="lede">
            Heirloom-grade fine jewelry, hand-forged in our Antwerp atelier from ethically sourced gold and stones — designed to outlast the day you bought it.
          </p>
          <div className="hero-ctas">
            <button className="btn solid">Shop the new heirlooms <span className="arr"><Icon.ArrowRight/></span></button>
            <button className="btn">Book a private viewing</button>
          </div>
          <div className="hero-meta">
            <div className="m"><div className="num">07</div><div className="lbl">Years crafting</div></div>
            <div className="m"><div className="num">1.4k</div><div className="lbl">Pieces in collection</div></div>
            <div className="m"><div className="num">100%</div><div className="lbl">Conflict-free</div></div>
          </div>
        </div>
        <div className="hero-stage">
          <div className="stage-photo">
            <svg className="ring" viewBox="0 0 280 280" fill="none" stroke="var(--gold)" strokeWidth="1.4">
              <ellipse cx="140" cy="180" rx="76" ry="66"/>
              <ellipse cx="140" cy="180" rx="58" ry="50" opacity=".4"/>
              <ellipse cx="140" cy="180" rx="42" ry="36" opacity=".25"/>
              <path d="M112 110l28-46 28 46-28 22-28-22Z" fill="var(--gold)" fillOpacity=".35"/>
              <path d="M112 110l28-46 28 46-28 22-28-22Z"/>
              <path d="M140 64v68M112 110l56 22M168 110l-56 22"/>
              <path d="M140 64l-28 46h56L140 64Z" stroke="var(--gold-2)"/>
            </svg>
            <div className="placeholder">◇ Hero product · drop photograph here ◇</div>
          </div>
          <div className="stage-badge">
            <div className="inner">
              <span>The New</span>
              <span className="big">Heirlooms</span>
              <span>Collection · 26</span>
            </div>
          </div>
          <div className="stage-cap">
            <div className="t">Solène Solitaire</div>
            <div className="s">18K · 0.7CT · NEW</div>
            <div className="price">$2,480</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCentered(){
  return (
    <section className="hero" style={{padding:'70px 0 100px', textAlign:'center'}}>
      <div className="wrap">
        <div style={{display:'flex',gap:14,alignItems:'center',justifyContent:'center',marginBottom:34}}>
          <span style={{width:42,height:1,background:'var(--gold)'}}/>
          <span className="eyebrow">Spring · 26 New Heirlooms</span>
          <span style={{width:42,height:1,background:'var(--gold)'}}/>
        </div>
        <h1 className="serif" style={{margin:'0 auto',maxWidth:1100}}>
          Quietly worn.<br/><em>Boldly</em> made.
        </h1>
        <p className="lede" style={{margin:'30px auto 36px',textAlign:'center'}}>
          Heirloom-grade fine jewelry, hand-forged in our Antwerp atelier from ethically sourced gold and stones.
        </p>
        <div className="hero-ctas" style={{justifyContent:'center'}}>
          <button className="btn solid">Shop the new heirlooms <span className="arr"><Icon.ArrowRight/></span></button>
          <button className="btn">Book a private viewing</button>
        </div>
        <div style={{marginTop:60, position:'relative', maxWidth:880, marginInline:'auto', aspectRatio:'16/8'}}>
          <div className="stage-photo" style={{position:'absolute',inset:0}}>
            <svg className="ring" viewBox="0 0 280 280" fill="none" stroke="var(--gold)" strokeWidth="1.4" style={{width:'30%'}}>
              <ellipse cx="140" cy="180" rx="76" ry="66"/>
              <ellipse cx="140" cy="180" rx="58" ry="50" opacity=".4"/>
              <path d="M112 110l28-46 28 46-28 22-28-22Z" fill="var(--gold)" fillOpacity=".35"/>
              <path d="M112 110l28-46 28 46-28 22-28-22Z"/>
              <path d="M140 64v68M112 110l56 22M168 110l-56 22"/>
            </svg>
            <div className="placeholder">◇ Wide editorial · landscape photograph ◇</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroOverlay(){
  return (
    <section className="hero" style={{padding:0, minHeight:'calc(100vh - 118px)', display:'grid'}}>
      <div className="stage-photo" style={{position:'relative',gridColumn:1,gridRow:1,minHeight:600}}>
        <svg className="ring" viewBox="0 0 280 280" fill="none" stroke="var(--gold)" strokeWidth="1.4" style={{width:'34%',opacity:.92}}>
          <ellipse cx="140" cy="180" rx="76" ry="66"/>
          <ellipse cx="140" cy="180" rx="58" ry="50" opacity=".4"/>
          <path d="M112 110l28-46 28 46-28 22-28-22Z" fill="var(--gold)" fillOpacity=".35"/>
          <path d="M112 110l28-46 28 46-28 22-28-22Z"/>
          <path d="M140 64v68M112 110l56 22M168 110l-56 22"/>
        </svg>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, transparent 30%, rgba(8,29,29,.7) 100%)'}}/>
      </div>
      <div className="wrap" style={{gridColumn:1,gridRow:1,alignSelf:'end',paddingBottom:90,position:'relative',zIndex:2}}>
        <div className="hero-eyebrow"><span className="bar"/><span className="eyebrow">Bold Pieces · Est. 2018</span></div>
        <h1 className="serif" style={{maxWidth:900}}>Quietly worn.<br/><em>Boldly</em> made.</h1>
        <div className="hero-ctas" style={{marginTop:30}}>
          <button className="btn solid">Shop the collection <span className="arr"><Icon.ArrowRight/></span></button>
          <button className="btn">Book a viewing</button>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── CATEGORIES ───────────────── */
function Categories({ onPick }){
  const cats = [
    { name:'Rings',     count:'42 pieces', Art: RingIcon },
    { name:'Necklaces', count:'28 pieces', Art: NecklaceIcon },
    { name:'Earrings',  count:'36 pieces', Art: EarringIcon },
    { name:'Bracelets', count:'19 pieces', Art: BraceletIcon },
    { name:'Pendants',  count:'24 pieces', Art: PendantIcon },
  ];
  return (
    <section className="section" id="collections">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{marginBottom:14}}>Section 01 · Categories</div>
            <h2 className="serif">Find your <em>signature</em>.</h2>
          </div>
          <div className="sub">Five families. Each one curated by our master jeweler — choose where to start.</div>
        </div>
        <div className="cat-grid">
          {cats.map((c, i) => (
            <div key={c.name} className="cat" onClick={() => onPick && onPick(c.name)}>
              <div className="num">{String(i+1).padStart(2,'0')}</div>
              <div className="ico"><c.Art size="100%"/></div>
              <div className="label">
                <div className="t">{c.name}</div>
                <div className="c"><span>{c.count}</span><span className="arrow">→</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── PRODUCTS ───────────────── */
function Products({ filter, onFilter, onAdd, onQuickView }){
  const cats = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants'];
  const visible = useMemo(() => {
    return filter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  }, [filter]);

  return (
    <section className="section" style={{paddingTop:60}} id="shop">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{marginBottom:14}}>Section 02 · The new heirlooms</div>
            <h2 className="serif">Pieces to <em>pass down</em>.</h2>
          </div>
          <div className="sub">26 new designs, each numbered and registered. Edition closes when sold.</div>
        </div>
        <div className="filter-row">
          {cats.map(c => (
            <button key={c} className={'chip ' + (filter===c?'on':'')} onClick={() => onFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="prod-grid">
          {visible.map(p => {
            const Art = p.Art;
            return (
              <div key={p.id} className="prod" onClick={() => onQuickView(p)}>
                <div className="img">
                  {p.badge && <div className="tag">{p.badge}</div>}
                  <div className="center"><Art/></div>
                  <button className="add" onClick={(e)=>{e.stopPropagation();onAdd(p);}}>+ Add to bag</button>
                </div>
                <div className="meta">
                  <div className="name serif">{p.name}</div>
                  <div className="price serif">${p.price.toLocaleString()}</div>
                </div>
                <div className="sub">{p.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── ATELIER ───────────────── */
function Atelier(){
  return (
    <section className="section" id="atelier" style={{paddingTop:40}}>
      <div className="wrap atelier">
        <div className="atelier-vis">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="100" cy="100" r="64" opacity=".4"/>
            <circle cx="100" cy="100" r="46"/>
            <path d="M68 100h64M100 68v64" opacity=".4"/>
            <circle cx="100" cy="100" r="6" fill="currentColor" fillOpacity=".4"/>
            <path d="M70 70l60 60M130 70l-60 60" opacity=".3"/>
          </svg>
          <div className="placeholder">◇ Atelier portrait · jeweler at bench ◇</div>
        </div>
        <div>
          <div className="eyebrow">Section 03 · The atelier</div>
          <h2 className="serif">Six pairs of hands.<br/><em>One</em> piece at a time.</h2>
          <p>
            Every Bold Piece begins as a wax model on a workbench in Antwerp, sketched by our master jeweler Claire, and shaped by five other hands before it ever sees its velvet box. We don't outsource. We don't scale. We don't pretend to.
          </p>
          <div className="stats">
            <div><div className="v">07</div><div className="l">Years operating</div></div>
            <div><div className="v">06</div><div className="l">Jewelers in-house</div></div>
            <div><div className="v">GIA</div><div className="l">Certified stones</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── BESPOKE ───────────────── */
function Bespoke(){
  const steps = [
    { n:'01', t:'Consult', d:'45-minute call · in-house or virtual' },
    { n:'02', t:'Sketch & wax', d:'Two iterations · approve before pour' },
    { n:'03', t:'Forge & finish', d:'4–6 weeks · numbered & registered' },
  ];
  return (
    <section className="bespoke" id="bespoke">
      <div className="wrap bespoke-grid">
        <div>
          <div className="eyebrow">Section 04 · Bespoke</div>
          <h2 className="serif">Design what<br/><em>no one else</em> wears.</h2>
          <p>An engagement ring set with your grandmother's stone. A pendant cast from a sketch on a napkin. We build one bespoke piece a week — and we love the difficult ones.</p>
          <button className="btn solid">Start a commission <span className="arr"><Icon.ArrowRight/></span></button>
        </div>
        <div className="steps">
          {steps.map(s => (
            <div className="step" key={s.n}>
              <div className="n serif">{s.n}</div>
              <div>
                <div className="t">{s.t}</div>
                <div className="d">{s.d}</div>
              </div>
              <div className="ar">→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── TESTIMONIALS ───────────────── */
function Testimonials(){
  const items = [
    { body:'The Solène arrived in a velvet box that felt heavier than the ring. Eight months on, the gold still has its mirror finish — and so does the moment.', n:'Amelia R.', r:'Engagement · Solène Solitaire', a:'A' },
    { body:'I sent a sketch on hotel stationery. Six weeks later I held it. Bold Pieces is the only studio that took the brief seriously.', n:'Tomás L.', r:'Bespoke · Pendant', a:'T' },
    { body:'I bought the Aria for my mother and quietly kept the second one for myself. No regrets — except not buying a third.', n:'Naomi K.', r:'Repeat client · Necklaces', a:'N' },
  ];
  return (
    <section className="section" id="journal">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{marginBottom:14}}>Section 05 · Clients</div>
            <h2 className="serif">Worn by people we <em>now know</em>.</h2>
          </div>
          <div className="sub">Verified after-purchase reflections. No incentives, no edits.</div>
        </div>
        <div className="quotes">
          {items.map((q,i)=>(
            <div key={i} className="q">
              <div className="mark">"</div>
              <div className="stars">{Array.from({length:5}).map((_,j)=><Icon.Star key={j}/>)}</div>
              <div className="body">{q.body}</div>
              <div className="by">
                <div className="av">{q.a}</div>
                <div>
                  <div className="n serif">{q.n}</div>
                  <div className="r">{q.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── NEWSLETTER ───────────────── */
function Newsletter(){
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState(false);
  const submit = (e)=>{
    e.preventDefault();
    if(!/.+@.+\..+/.test(email)) return;
    setOk(true); setEmail('');
    setTimeout(()=>setOk(false), 4000);
  };
  return (
    <section className="news" id="contact">
      <div className="wrap">
        <div className="eyebrow" style={{marginBottom:14}}>Section 06 · Letters</div>
        <h2 className="serif">First looks,<br/><em>before</em> the public.</h2>
        <p>One thoughtful note a month. New pieces, atelier letters, occasional pre-release access. No promotional noise.</p>
        <form onSubmit={submit}>
          <input type="email" placeholder="you@somewhere.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          <button type="submit">Subscribe</button>
        </form>
        <div className="ok">{ok ? '◆ Welcome — first letter arrives soon ◆' : ''}</div>
      </div>
    </section>
  );
}

/* ───────────────── FOOTER ───────────────── */
function Footer(){
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="col1">
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
              <div className="logo-mark">B</div>
              <div className="logo-word">BOLD PIECES</div>
            </div>
            <p>Heirloom-grade fine jewelry, hand-forged in Antwerp. Each piece is numbered, registered, and guaranteed for life.</p>
            <div className="socials">
              <a href="#" aria-label="Instagram"><Icon.Instagram/></a>
              <a href="#" aria-label="Pinterest"><Icon.Pinterest/></a>
              <a href="#" aria-label="TikTok"><Icon.TikTok/></a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li>Rings</li><li>Necklaces</li><li>Earrings</li><li>Bracelets</li><li>Pendants</li><li>Bespoke</li>
            </ul>
          </div>
          <div>
            <h4>Maison</h4>
            <ul>
              <li>Our atelier</li><li>Materials</li><li>Sustainability</li><li>Journal</li><li>Press</li>
            </ul>
          </div>
          <div>
            <h4>Care</h4>
            <ul>
              <li>Lifetime guarantee</li><li>Resize & repair</li><li>Engraving</li><li>Shipping & returns</li><li>Contact</li>
            </ul>
          </div>
        </div>
        <div className="foot-mark">BOLD&nbsp;PIECES</div>
        <div className="foot-bot">
          <div>© 2026 Bold Pieces · Antwerp · Atelier no. 17</div>
          <div>Privacy · Terms · Cookies</div>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────── CART DRAWER ───────────────── */
function CartDrawer({ open, items, onClose, onQty, onRm, total }){
  return (
    <React.Fragment>
      <div className={'scrim ' + (open?'on':'')} onClick={onClose}/>
      <aside className={'cart ' + (open?'on':'')}>
        <div className="cart-hd">
          <div className="t serif">Your bag · {items.length}</div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="cart-body">
          {items.length === 0 && (
            <div className="cart-empty">
              <div className="ico"><Icon.Bag/></div>
              <div>Nothing here yet.<br/>Begin with the new heirlooms.</div>
            </div>
          )}
          {items.map(it => {
            const Art = it.Art;
            return (
              <div className="cart-item" key={it.id}>
                <div className="thumb"><Art size={56}/></div>
                <div className="info">
                  <div className="n">{it.name}</div>
                  <div className="p">${it.price.toLocaleString()}</div>
                  <div className="qty">
                    <button onClick={()=>onQty(it.id,-1)}>−</button>
                    <span className="v">{it.qty}</span>
                    <button onClick={()=>onQty(it.id,1)}>+</button>
                  </div>
                </div>
                <button className="rm" onClick={()=>onRm(it.id)}>Remove</button>
              </div>
            );
          })}
        </div>
        {items.length > 0 && (
          <div className="cart-ft">
            <div className="row"><span className="l">Subtotal</span><span className="v">${total.toLocaleString()}</span></div>
            <button className="btn solid">Checkout <span className="arr"><Icon.ArrowRight/></span></button>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}

/* ───────────────── QUICK VIEW ───────────────── */
function QuickView({ product, onClose, onAdd }){
  const [size, setSize] = useState('M');
  if (!product) return null;
  const Art = product.Art;
  const sizes = product.category === 'Rings' ? ['5','6','7','8','9'] :
                product.category === 'Bracelets' ? ['S','M','L'] :
                product.category === 'Necklaces' ? ['16in','18in','20in'] :
                ['One size'];
  return (
    <div className="qv-scrim on" onClick={onClose}>
      <div className="qv" onClick={e=>e.stopPropagation()}>
        <div className="vis">
          <Art/>
          {product.badge && <div className="tag" style={{position:'absolute',top:14,left:14,fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'.2em',color:'var(--gold)',background:'rgba(8,29,29,.7)',padding:'5px 9px',border:'1px solid var(--line)'}}>{product.badge}</div>}
        </div>
        <div className="body">
          <button className="x" onClick={onClose}>×</button>
          <div className="eyebrow">{product.category} · {product.sub}</div>
          <h3 className="serif">{product.name}</h3>
          <div className="price serif">${product.price.toLocaleString()}</div>
          <p className="desc">A quietly bold piece, hand-finished in our Antwerp atelier. Each one is numbered and arrives with a lifetime care card and complimentary engraving.</p>
          <div className="specs">
            <div>Metal<b>18k yellow gold</b></div>
            <div>Stone<b>VS · F-color</b></div>
            <div>Origin<b>Antwerp atelier</b></div>
            <div>Guarantee<b>Lifetime</b></div>
          </div>
          <div className="eyebrow" style={{marginTop:6}}>{product.category==='Rings' ? 'Ring size' : product.category==='Bracelets' ? 'Wrist' : product.category==='Necklaces' ? 'Length' : 'Size'}</div>
          <div className="sizes">
            {sizes.map(s => (
              <button key={s} className={'sz '+(size===s?'on':'')} onClick={()=>setSize(s)}>{s}</button>
            ))}
          </div>
          <div className="actions">
            <button className="btn solid" onClick={()=>{onAdd({...product, size}); onClose();}}>Add to bag</button>
            <button className="btn"><Icon.Heart/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Announce, Nav, Hero, Categories, Products, Atelier, Bespoke,
  Testimonials, Newsletter, Footer, CartDrawer, QuickView, PRODUCTS
});
