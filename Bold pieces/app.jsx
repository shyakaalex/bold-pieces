// app.jsx — Bold Pieces main app
// Wires together all sections + state (cart, filter, quick view, tweaks).

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette":  "emerald",
  "hero":     "split",
  "typeface": "cormorant",
  "showBadge": true
}/*EDITMODE-END*/;

const PALETTES = {
  emerald: {
    '--bg':'#0E2A2A', '--bg-2':'#0A1F1F', '--bg-3':'#143131',
    '--gold':'#C8A66B', '--gold-2':'#E6CC8E',
    '--cream':'#F4EDE1', '--cream-2':'#E6DCC8',
    '--line':'rgba(200,166,107,.22)', '--line-2':'rgba(244,237,225,.10)'
  },
  obsidian: {
    '--bg':'#0E0F12', '--bg-2':'#08090B', '--bg-3':'#141519',
    '--gold':'#C8A66B', '--gold-2':'#E6CC8E',
    '--cream':'#F4EDE1', '--cream-2':'#E6DCC8',
    '--line':'rgba(200,166,107,.22)', '--line-2':'rgba(244,237,225,.10)'
  },
  oxblood: {
    '--bg':'#2A1414', '--bg-2':'#1F0E0E', '--bg-3':'#341818',
    '--gold':'#C8A66B', '--gold-2':'#E8CE8C',
    '--cream':'#F4EDE1', '--cream-2':'#E6DCC8',
    '--line':'rgba(200,166,107,.22)', '--line-2':'rgba(244,237,225,.10)'
  },
  midnight: {
    '--bg':'#0B1C2C', '--bg-2':'#071423', '--bg-3':'#102640',
    '--gold':'#C8A66B', '--gold-2':'#E6CC8E',
    '--cream':'#F4EDE1', '--cream-2':'#E6DCC8',
    '--line':'rgba(200,166,107,.22)', '--line-2':'rgba(244,237,225,.10)'
  },
};

const TYPEFACES = {
  cormorant: '"Cormorant Garamond", Georgia, serif',
  playfair:  '"Playfair Display", Georgia, serif',
  italiana:  '"Italiana", "Cormorant Garamond", serif',
};

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // commerce state
  const [filter, setFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [qv, setQv] = useState(null);
  const [toast, setToast] = useState('');

  // scroll progress
  const railRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      const max = (d.scrollHeight - d.clientHeight) || 1;
      const pct = Math.max(0, Math.min(100, (d.scrollTop / max) * 100));
      if (railRef.current) railRef.current.style.width = pct + '%';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // theme variables from tweaks
  useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.emerald;
    Object.entries(p).forEach(([k,v]) => document.documentElement.style.setProperty(k, v));
    document.documentElement.style.setProperty('--serif', TYPEFACES[t.typeface] || TYPEFACES.cormorant);
  }, [t.palette, t.typeface]);

  // reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [t.palette, t.hero]);

  // commerce handlers
  const addToCart = (p) => {
    setCart(prev => {
      const found = prev.find(i => i.id === p.id);
      if (found) return prev.map(i => i.id === p.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, {...p, qty: 1}];
    });
    setToast('◆ Added to bag — ' + p.name);
    clearTimeout(window.__toastTO);
    window.__toastTO = setTimeout(() => setToast(''), 2400);
  };
  const setQty = (id, d) => setCart(prev =>
    prev.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + d)} : i)
  );
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s,i) => s + i.qty, 0);

  const pickCategory = (name) => {
    setFilter(name);
    document.getElementById('shop')?.scrollIntoView({behavior:'smooth', block:'start'});
  };

  return (
    <>
      <div className="scroll-rail"><i ref={railRef}/></div>
      <Announce/>
      <Nav cartCount={count} onOpenCart={()=>setCartOpen(true)}/>
      <Hero variant={t.hero}/>
      <Categories onPick={pickCategory}/>
      <Products
        filter={filter}
        onFilter={setFilter}
        onAdd={addToCart}
        onQuickView={setQv}
      />
      <Atelier/>
      <Bespoke/>
      <Testimonials/>
      <Newsletter/>
      <Footer/>

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={()=>setCartOpen(false)}
        onQty={setQty}
        onRm={removeItem}
        total={total}
      />
      <QuickView product={qv} onClose={()=>setQv(null)} onAdd={addToCart}/>

      <div className={'toast ' + (toast ? 'on' : '')}>{toast}</div>

      <TweaksPanel>
        <TweakSection label="Palette"/>
        <TweakRadio
          label="Theme"
          value={t.palette}
          options={['emerald','obsidian','oxblood','midnight']}
          onChange={v=>setTweak('palette', v)}
        />
        <TweakSection label="Hero"/>
        <TweakRadio
          label="Variant"
          value={t.hero}
          options={['split','centered','overlay']}
          onChange={v=>setTweak('hero', v)}
        />
        <TweakSection label="Typography"/>
        <TweakRadio
          label="Display serif"
          value={t.typeface}
          options={['cormorant','playfair','italiana']}
          onChange={v=>setTweak('typeface', v)}
        />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>);
