const DICT: Record<string, Record<string, string>> = {
  de: {
    'nav.home': 'Home',
    'nav.details': 'Details',
    'nav.gallery': 'Galerie',
    'hero.pre': 'Gemeinsam mit Familie und Freunden',
    'gate.hint': 'Diese Einladung ist privat. Gib den Code von deiner Einladung ein, um fortzufahren.',
    'gate.input': 'Einladungscode',
    'gate.cta': 'Einladung öffnen',
    'gate.error': 'Dieser Code ist ungültig oder abgelaufen. Bitte scanne deine Einladung noch einmal.'
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.details': 'Détails',
    'nav.gallery': 'Galerie',
    'hero.pre': 'Avec notre famille et nos amis',
    'gate.hint': 'Cette invitation est privée. Saisissez le code figurant sur votre invitation pour continuer.',
    'gate.input': "Code d'invitation",
    'gate.cta': 'Ouvrir mon invitation',
    'gate.error': 'Ce code est invalide ou a expiré. Veuillez scanner à nouveau votre invitation.'
  },
  en: {
    'nav.home': 'Home',
    'nav.details': 'Details',
    'nav.gallery': 'Gallery',
    'hero.pre': 'Together with family and friends',
    'gate.hint': 'This invite is private. Enter the code from your invitation to continue.',
    'gate.input': 'Invitation code',
    'gate.cta': 'Open my invitation',
    'gate.error': 'This code is invalid or has expired. Please scan your invitation again.'
  }
};

const LANG_LOCALES: Record<string, string> = { de: 'de-DE', fr: 'fr-FR', en: 'en-GB' };

export function landing(origin: string, error: boolean): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Raquel &amp; Jean-Paul — 11. Dezember 2026 · Berlin</title>
<meta property="og:type" content="website">
<meta property="og:title" content="Raquel &amp; Jean-Paul — We're Getting Married">
<meta property="og:description" content="An invitation from Raquel and Jean-Paul.">
<meta property="og:image" content="${origin}/hero.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&family=Pinyon+Script&display=swap" rel="stylesheet">
<style>
  html, body { height: 100%; margin: 0; overflow: hidden; }
  body {
    font-family: "Jost", "Helvetica Neue", Arial, sans-serif;
    font-weight: 300; font-size: 1.02rem; line-height: 1.75;
    color: #1E2A3A; background: #151E2A; -webkit-font-smoothing: antialiased;
  }
  * { box-sizing: border-box; }
  a { color: #fff; text-decoration: none; }
  :focus-visible { outline: 2px solid #C5A55A; outline-offset: 3px; }

  .site-header { position: fixed; inset: 0 0 auto 0; z-index: 1000; padding: .55rem 0; }
  .nav-wrap { max-width: 1180px; margin: 0 auto; padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .brand { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; font-size: 1.5rem; letter-spacing: .04em; color: #fff; line-height: 1; display: inline-flex; align-items: baseline; gap: .3rem; }
  .brand em { font-family: "Pinyon Script", cursive; font-style: normal; color: #D4B96E; font-size: 1.6rem; }
  .nav-menu { display: flex; align-items: center; gap: 1.7rem; list-style: none; margin: 0; padding: 0; }
  .nav-menu a { font-size: .74rem; letter-spacing: .17em; text-transform: uppercase; color: rgba(255,255,255,.92); padding: .2rem 0; position: relative; }
  .nav-actions { display: flex; align-items: center; gap: 1rem; }
  .lang-switch { display: flex; border: 1px solid rgba(255,255,255,.35); border-radius: 50px; overflow: hidden; }
  .lang-switch button { background: transparent; border: 0; color: rgba(255,255,255,.85); font-size: .68rem; letter-spacing: .14em; padding: .35rem .7rem; cursor: pointer; }
  .lang-switch button.active { background: #fff; color: #1E2A3A; }

  .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; color: #fff; padding: 8rem 1rem 3rem; overflow: hidden; }
  .hero__bg { position: absolute; inset: 0; background-image: url("${origin}/hero.jpg"); background-size: cover; background-position: center 20%; }
  .hero__bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(21,30,42,.55) 0%, rgba(21,30,42,.45) 45%, rgba(21,30,42,.82) 100%); }
  .hero__inner { position: relative; z-index: 2; max-width: 820px; }
  .hero__pre { font-weight: 400; font-size: .78rem; letter-spacing: .34em; text-transform: uppercase; color: rgba(255,255,255,.85); margin-bottom: 1.2rem; }
  .hero__names { font-family: "Pinyon Script", cursive; font-size: clamp(3.8rem, 13vw, 8.5rem); font-weight: 400; line-height: .95; color: #fff; margin: 0; text-shadow: 0 8px 40px rgba(0,0,0,.35); }
  .hero__names .amp { display: block; font-size: .42em; color: #D4B96E; margin: .1em 0; }
  .hero__meta { font-family: "Cormorant Garamond", Georgia, serif; font-size: clamp(1.15rem, 2.6vw, 1.6rem); letter-spacing: .04em; color: #fff; margin: 1.4rem 0 .2rem; }
  .hero__meta span { color: #D4B96E; margin: 0 .5rem; }

  .gate-box { max-width: 460px; margin: 2.6rem auto 0; padding: 1.4rem 1.5rem 1.6rem; background: rgba(21,30,42,.55); border: 1px solid rgba(255,255,255,.24); border-radius: 3px; backdrop-filter: blur(6px); }
  .gate-hint { color: rgba(255,255,255,.9); font-size: .9rem; margin: 0 0 1.1rem; }
  .gate-form { display: flex; flex-direction: column; gap: .8rem; }
  .gate-input { width: 100%; padding: .8rem 1rem; border: 1px solid rgba(255,255,255,.4); border-radius: 50px; background: rgba(255,255,255,.12); color: #fff; font-family: "Jost", Arial, sans-serif; font-size: .9rem; letter-spacing: .06em; text-align: center; }
  .gate-input::placeholder { color: rgba(255,255,255,.6); }
  .gate-input:focus { outline: 2px solid #D4B96E; border-color: transparent; }
  .gate-error { color: #D4B96E; font-size: .82rem; margin: .9rem 0 0; }
  .btn-ec { display: inline-flex; align-items: center; justify-content: center; gap: .55rem; font: 500 .78rem "Jost", Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; padding: .95rem 2.1rem; border: 1px solid #fff; border-radius: 50px; background: #fff; color: #151E2A; cursor: pointer; transition: background .22s ease, color .22s ease, transform .22s ease; }
  .btn-ec:hover { background: transparent; color: #fff; transform: translateY(-2px); }
  @media (max-width: 767px) { .nav-menu { display: none; } .nav-wrap { padding: 0 1rem; } .hero { padding-top: 6rem; } }
</style>
</head>
<body>
<header class="site-header">
  <div class="nav-wrap">
    <a class="brand" href="#home">Raquel <em>&amp;</em> Jean-Paul</a>
    <nav aria-label="Sections">
      <ul class="nav-menu">
        <li><a href="#home" data-i18n="nav.home">Home</a></li>
        <li><a href="#gate" data-i18n="nav.details">Details</a></li>
        <li><a href="#gate" data-i18n="nav.gallery">Gallery</a></li>
      </ul>
    </nav>
    <div class="nav-actions">
      <div class="lang-switch" role="group" aria-label="Language">
        <button type="button" data-lang="de">DE</button>
        <button type="button" data-lang="fr">FR</button>
        <button type="button" data-lang="en">EN</button>
      </div>
    </div>
  </div>
</header>

<main>
  <section class="hero" id="home">
    <div class="hero__bg" role="img" aria-label="Raquel and Jean-Paul"></div>
    <div class="hero__inner">
      <p class="hero__pre" data-i18n="hero.pre">Gemeinsam mit Familie und Freunden</p>
      <h1 class="hero__names">Raquel<span class="amp">&amp;</span>Jean-Paul</h1>
      <p class="hero__meta" id="gateDate"></p>

      <div class="gate-box" id="gate">
        <p class="gate-hint" data-i18n="gate.hint">Diese Einladung ist privat. Gib den Code von deiner Einladung ein, um fortzufahren.</p>
        <form class="gate-form" id="gateForm">
          <input id="gateInput" class="gate-input" type="text" data-i18n-placeholder="gate.input" placeholder="Einladungscode" autocomplete="off" spellcheck="false" aria-label="Einladungscode">
          <button class="btn-ec" type="submit" data-i18n="gate.cta">Einladung öffnen</button>
        </form>
        <p class="gate-error" id="gateError" data-i18n="gate.error" ${error ? '' : 'hidden'}>Dieser Code ist ungültig oder abgelaufen.</p>
      </div>
    </div>
  </section>
</main>

<script>
  var DICT = ${JSON.stringify(DICT)};
  var LANG_LOCALES = ${JSON.stringify(LANG_LOCALES)};
  var LANGS = ['de', 'fr', 'en'];

  function pickLang() {
    var params = new URLSearchParams(window.location.search);
    if (LANGS.indexOf(params.get('lang')) !== -1) return params.get('lang');
    try {
      var stored = window.localStorage.getItem('wedding.locale');
      if (LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    var nav = (navigator.language || 'de').slice(0, 2);
    return LANGS.indexOf(nav) !== -1 ? nav : 'de';
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    var dict = DICT[lang] || {};
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i += 1) {
      var key = els[i].getAttribute('data-i18n');
      if (dict[key]) els[i].textContent = dict[key];
    }
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j += 1) {
      var pk = placeholders[j].getAttribute('data-i18n-placeholder');
      if (dict[pk]) placeholders[j].setAttribute('placeholder', dict[pk]);
    }
    var buttons = document.querySelectorAll('[data-lang]');
    for (var k = 0; k < buttons.length; k += 1) {
      buttons[k].className = buttons[k].getAttribute('data-lang') === lang ? 'active' : '';
    }
    var date = new Date(2026, 11, 11, 10, 45);
    var locale = LANG_LOCALES[lang] || 'de-DE';
    var dateEl = document.getElementById('gateDate');
    if (dateEl) {
      var weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
      var year = new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date);
      dateEl.innerHTML = weekday + ' <span>&bull;</span> ' + year;
    }
  }

  var lang = pickLang();
  applyLang(lang);

  var langButtons = document.querySelectorAll('[data-lang]');
  for (var b = 0; b < langButtons.length; b += 1) {
    langButtons[b].addEventListener('click', function () {
      var next = this.getAttribute('data-lang');
      applyLang(next);
      try { window.localStorage.setItem('wedding.locale', next); } catch (e) {}
    });
  }

  document.getElementById('gateForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var value = document.getElementById('gateInput').value.trim();
    if (!value) return;
    window.location.href = window.location.pathname + '?t=' + encodeURIComponent(value);
  });
</script>
</body>
</html>`;
}