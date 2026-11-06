/* Núcleo del sitio: no necesitas editar este archivo. */
(function () {
  var D = window.Dreamers = window.Dreamers || {};
  D.contenido = D.contenido || {};
  D.talentos = [];
  D.secciones = {};
  D.listaTalentos = D.listaTalentos || [];
  // Raíz del sitio (URL completa), calculada desde la ubicación de este archivo (assets/js/nucleo.js).
  // Así todos los enlaces funcionan igual en "/", "/talentos/kimera", o si el sitio está en una subcarpeta.
  var _s = document.currentScript;
  D.raiz = _s && _s.src ? new URL('../../', _s.src).href : location.origin + '/';
  D.base = D.raiz;

  D.registrar = function (id, fn) { D.secciones[id] = fn; };

  // Cada talentos/<carpeta>/datos.js llama a Dreamers.talento({...})
  D.talento = function (datos) { datos.carpeta = D._actual; D.talentos.push(datos); };

  // Categorías de un creador de contenido: una lista de textos independientes (t.categorias).
  // Si el archivo es antiguo y trae un solo texto "Gaming/Cosplay" en t.categoria, se separa aquí.
  D.categoriasDe = function (t) {
    var fuente = t && Array.isArray(t.categorias) ? t.categorias : String((t && t.categoria) || '').split(/[\/,]/);
    var vistos = {}, salida = [];
    fuente.forEach(function (x) {
      x = String(x == null ? '' : x).trim();
      var k = x.toLowerCase();
      if (x && !vistos[k]) { vistos[k] = 1; salida.push(x); }
    });
    return salida;
  };

  D.esc = function (t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  var ABREV = { Twitch: 'TW', YouTube: 'YT', TikTok: 'TT', Instagram: 'IG', Facebook: 'FB', X: 'X', Twitter: 'X', Kick: 'KI', Discord: 'DC' };
  D.abrev = function (p) { return ABREV[p] || String(p || '?').slice(0, 2).toUpperCase(); };


  // ---- Redes: enlace, seguidores por red y total automático
  var BASES = { instagram: 'https://www.instagram.com/', tiktok: 'https://www.tiktok.com/@', twitch: 'https://www.twitch.tv/', youtube: 'https://www.youtube.com/@',
                facebook: 'https://www.facebook.com/', x: 'https://x.com/', twitter: 'https://x.com/', kick: 'https://kick.com/' };
  // Enlace de una red. Si el talento solo tiene "usuario" (formato anterior), se arma el enlace con la plataforma.
  D.enlaceRed = function (r) {
    var e = String((r && r.enlace) || '').trim();
    if (e) return /^https?:\/\//i.test(e) ? e : 'https://' + e;
    var u = String((r && r.usuario) || '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    var base = BASES[String((r && r.plataforma) || '').trim().toLowerCase()];
    return base ? base + u.replace(/^@/, '') : '';
  };
  // "3.4K" -> 3400, "1.2M" -> 1200000, "12,500" -> 12500, "36 mil" -> 36000. Devuelve null si no es un número.
  D.numSeguidores = function (txt) {
    var s = String(txt == null ? '' : txt).trim().toLowerCase().replace(/\s+/g, '');
    var m = s.match(/^([\d.,]+)(k|m|mil|millon|millones)?\+?$/);
    if (!m) return null;
    var num = m[1], suf = m[2], v;
    if (suf) v = parseFloat(num.replace(',', '.'));
    else if (/^\d{1,3}([.,]\d{3})+$/.test(num)) v = parseFloat(num.replace(/[.,]/g, ''));
    else v = parseFloat(num.replace(',', '.'));
    if (isNaN(v)) return null;
    if (suf === 'k' || suf === 'mil') v *= 1e3;
    else if (suf) v *= 1e6;
    return Math.round(v);
  };
  D.formatoSeguidores = function (n) {
    function corto(x, s) { return String(Math.round(x * 10) / 10).replace(/\.0$/, '') + s; }
    if (n >= 1e6) return corto(n / 1e6, 'M');
    if (n >= 1e3) return corto(n / 1e3, 'K');
    return String(n);
  };
  // Total del talento: suma los seguidores de sus redes. Si ninguna red tiene número, usa el campo "seguidores" escrito a mano.
  D.totalSeguidores = function (t) {
    var suma = 0, hay = false;
    ((t && t.redes) || []).forEach(function (r) { var n = D.numSeguidores(r.seguidores); if (n !== null) { suma += n; hay = true; } });
    return hay ? D.formatoSeguidores(suma) : String((t && t.seguidores) || '');
  };

  D.iconoRed = function (plataforma) {
    var nombre = String(plataforma || '').trim().toLowerCase();
    var iconos = {
      facebook: '<path d="M13.5 22v-8h3l.5-3.5h-3.5V7.3c0-1 .4-1.7 1.9-1.7H17V2.6c-.3 0-1.4-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.8V10.5H7V14h2.5v8h4z"/>',
      instagram: '<path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5zm0 2A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10A2.5 2.5 0 0 0 19.5 17V7A2.5 2.5 0 0 0 17 4.5H7zm5 2.2a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zm5.5-2.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>',
      youtube: '<path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.7 4.8 12 4.8 12 4.8s-5.7 0-7.6.4a2.8 2.8 0 0 0-2 2A29.4 29.4 0 0 0 2 12a29.4 29.4 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.9.4 7.6.4 7.6.4s5.7 0 7.6-.4a2.8 2.8 0 0 0 2-2A29.4 29.4 0 0 0 22 12a29.4 29.4 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"/>',
      tiktok: '<path d="M14.7 2.5c.6 1.6 1.8 2.8 3.4 3.2v2.1c-1.5-.1-2.9-.7-4.1-1.8v8.1a4.9 4.9 0 1 1-4.9-4.9c.2 0 .4 0 .6.1v2.4a2.6 2.6 0 0 0-.7-.1 2.7 2.7 0 1 0 2.7 2.7V2.5h2.9z"/>',
      twitch: '<path d="M3 4.5h17.5v9.2L15.8 17l-2.8.8-2.6.7V17l-4.9-3.3V4.5zm3 2.3v6.3h2.3v1.6l1.7-1.6h4.2l2.2-2V6.8H6zm3.2 2.1h1.7v4.1H9.2v-4.1zm4.8 0h1.7v4.1h-1.7v-4.1z"/>',
      x: '<path d="M18.9 2h3.4l-7.4 8.5L22.9 22h-6.8l-5.3-7.4L4.9 22H1.4l7.9-9L1 2h6.9l4.8 6.8L18.9 2zm-1.2 18h1.9L7.2 3.9H5.2l12.5 16.1z"/>',
      twitter: '<path d="M18.9 2h3.4l-7.4 8.5L22.9 22h-6.8l-5.3-7.4L4.9 22H1.4l7.9-9L1 2h6.9l4.8 6.8L18.9 2zm-1.2 18h1.9L7.2 3.9H5.2l12.5 16.1z"/>',
      kick: '<path d="M4 5h6v2H4V5zm0 4h8v2H4v-2zm0 4h8v2H4v-2zm10 0h6v2h-6v-2zm-3 4h6v2H11v-2zm10-12h2v12h-2V5z"/>',
      discord: '<path d="M19.5 5.5A15.2 15.2 0 0 0 15.1 4l-.4.8c1.2.3 2.2.8 3.1 1.4-.9-.5-1.8-.9-2.8-1.2-.6-.2-1.3-.4-2-.5-.8-.1-1.6-.1-2.5 0-.7.1-1.4.3-2 .5-1 .3-1.9.7-2.8 1.2.9-.6 2-1.1 3.1-1.4L8.9 4a15.2 15.2 0 0 0-4.4 1.5C3.3 7.8 2.5 11 2.5 14.8c0 0 1.8 3.2 6.6 3.2.8 0 1.7-.3 2.6-.8l.5-.4c-.8-.5-1.5-1.1-2.1-1.8.4.2.9.4 1.4.6.5.2 1 .3 1.5.5.5-.2 1-.3 1.5-.5.5-.2.9-.4 1.4-.6-.6.7-1.3 1.3-2.1 1.8l.5.4c.9.5 1.8.8 2.6.8 4.8 0 6.6-3.2 6.6-3.2 0-3.8-.8-7-2.1-9.3zM9.9 14.3c-.8 0-1.5-.7-1.5-1.6s.7-1.6 1.5-1.6 1.5.7 1.5 1.6-.7 1.6-1.5 1.6zm4.2 0c-.8 0-1.5-.7-1.5-1.6s.7-1.6 1.5-1.6 1.5.7 1.5 1.6-.7 1.6-1.5 1.6z"/>',
      spotify: '<path d="M12 2.5A9.5 9.5 0 1 0 21.5 12 9.5 9.5 0 0 0 12 2.5zm4.9 13.7a.9.9 0 0 1-1.2.3c-3.3-2-7.4-2.4-12.2-1.3a.9.9 0 0 1-.4-1.7c5.3-1.1 10.1-.7 14.1 1.4a.9.9 0 0 1 .3 1.3zm1.6-3.2a1.1 1.1 0 0 1-1.5.4c-3.8-2.4-9.4-3.1-13.8-1.7a1.1 1.1 0 1 1-.5-2.1c5.1-1.7 11.5-1 15.7 1.6a1.1 1.1 0 0 1 .4 1.8zm.2-3.3c-4.3-2.5-11.4-2.8-15.6-1.5a1.2 1.2 0 1 1-.6-2.2c4.9-1.6 13.1-1.3 18.2 1.7a1.2 1.2 0 0 1-1.9 1.5z"/>'
    };
    return '<svg class="red-icon" viewBox="0 0 24 24" aria-label="' + D.esc(plataforma) + '" title="' + D.esc(plataforma) + '"><g fill="currentColor">' + (iconos[nombre] || '<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="8" font-family="Arial, sans-serif">' + D.esc(D.abrev(plataforma)) + '</text>') + '</g></svg>';
  };

  D.sinFoto = D.raiz + 'assets/img/sin-foto.svg';
  D.rutaFoto = function (t) {
    var foto = t.foto || 'foto.svg';
    if (/^(data:|https?:)/.test(foto)) return foto;
    return D.raiz + 'talentos/' + t.carpeta + '/' + foto;
  };
  D.img = function (src, alt, talento) {
    if (src && !/^([a-z][a-z0-9+.-]*:|\/)/i.test(src)) src = D.raiz + src;
    var posicion = talento && talento.posicionFoto ? D.esc(talento.posicionFoto) : '50% 50%';
    var zoom = talento && talento.fotoZoom ? Number(talento.fotoZoom) : 1;
    var origen = posicion.replace(/%/g, '').trim().split(/\s+/);
    var x = origen[0] || 50, y = origen[1] || 50;
    var estilo = '--zoom:' + zoom + ';--pos-x:' + x + '%;--pos-y:' + y + '%;' +
                 'object-position:' + posicion + ';transform:scale(' + zoom + ');transform-origin:' + posicion;
    return '<img src="' + D.esc(src) + '" alt="' + D.esc(alt || '') + '" style="' + estilo + '" data-origin-x="' + x + '" data-origin-y="' + y + '" >';
  };
  // Si una foto no existe, se muestra la imagen "sin foto".
  document.addEventListener('error', function (e) {
    var im = e.target;
    if (im && im.tagName === 'IMG' && im.getAttribute('src') !== D.sinFoto) { im.src = D.sinFoto; }
  }, true);

  var PAGINAS = ['talentos', 'nosotros', 'contacto'];

  // Devuelve la URL limpia de una página: sin .html, sin index y sin #.
  //   ''  | '/' | '#inicio' | 'index.html'  ->  /
  //   'nosotros/' | 'nosotros.html'          ->  /nosotros
  //   '#talentos'                            ->  /talentos
  D.irA = function (destino) {
    var d = String(destino == null ? '' : destino).trim();
    if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(d)) return d;      // enlace externo
    if (d.charAt(0) === '#') {                                   // antiguos anclas: se convierten en páginas
      d = d.slice(1);
      d = PAGINAS.indexOf(d) >= 0 ? d : '';
    }
    d = d.split('#')[0].split('?')[0].replace(/^\/+/, '')
         .replace(/(^|\/)index\.html$/i, '').replace(/\.html$/i, '').replace(/\/+$/, '');
    return D.raiz + d;
  };
  D.rutaTalento = function (carpeta) {
    return D.raiz + 'talentos/' + encodeURIComponent(carpeta);
  };
  // Carpeta del talento según la URL actual (/talentos/kimera -> "kimera"), o '' si no es una página de talento.
  D.talentoActual = function () {
    var base = new URL(D.raiz).pathname;
    var rel = location.pathname.indexOf(base) === 0 ? location.pathname.slice(base.length) : location.pathname.replace(/^\//, '');
    var partes = rel.replace(/(^|\/)index\.html$/i, '').split('/').filter(Boolean);
    if (partes[0] !== 'talentos' || !partes[1]) return '';
    try { return decodeURIComponent(partes[1]); } catch (_) { return partes[1]; }
  };

  // Quita la "/" final de la barra de direcciones: /talentos/kimera/ -> /talentos/kimera
  // (se llama al terminar de cargar, cuando ya no quedan archivos con ruta relativa por pedir).
  D.limpiarBarra = function () {
    if (/^https?:$/.test(location.protocol) && location.pathname.length > 1 && /\/$/.test(location.pathname)) {
      try { history.replaceState(null, '', location.pathname.replace(/\/+$/, '') + location.search); } catch (_) {}
    }
  };

  // ---------------------------------------------------------------------------
  // MEDIOS: pega cualquier enlace (video, foto, audio, publicación, directo...) y el sitio
  // reconoce de dónde es, lo etiqueta y arma el iframe (o imagen / video / audio) que encaja.
  // También acepta el código <iframe ...> completo pegado tal cual.
  // ---------------------------------------------------------------------------
  D.detectarMedio = function (entrada) {
    var raw = String(entrada == null ? '' : entrada).trim();
    if (!raw) return null;
    var f = raw.match(/<iframe[^>]*?\ssrc\s*=\s*["']([^"']+)["']/i);
    if (f) raw = f[1].replace(/&amp;/g, '&');
    if (/^\/\//.test(raw)) raw = 'https:' + raw;
    if (!/^https?:\/\//i.test(raw)) {
      if (/^[\w-]+(\.[\w-]+)+(\/|$|\?)/.test(raw)) raw = 'https://' + raw; else return null;
    }
    var u; try { u = new URL(raw); } catch (_) { return null; }
    var h = u.hostname.toLowerCase(), p = u.pathname, q = u.searchParams, m;
    var padre = encodeURIComponent(location.hostname || 'localhost');
    function es(re) { return re.test(h); }
    function iframe(plataforma, tipo, src, o) {
      o = o || {};
      return { plataforma: plataforma, tipo: tipo, src: src, aspect: o.aspect || '16/9', alto: o.alto || 0, vertical: !!o.vertical, sinScroll: !o.scroll, url: raw };
    }
    function enlace(plataforma, tipo) { return { plataforma: plataforma, tipo: tipo || 'Enlace', enlace: raw, url: raw }; }

    // Archivos sueltos (foto, video, audio)
    if (/\.(jpe?g|png|gif|webp|avif|svg|bmp)$/i.test(p)) return { plataforma: 'Imagen', tipo: 'Foto', imagen: raw, url: raw };
    if (/\.(mp4|webm|ogv|mov|m4v)$/i.test(p)) return { plataforma: 'Video', tipo: 'Archivo', video: raw, url: raw };
    if (/\.(mp3|wav|ogg|m4a|aac)$/i.test(p)) return { plataforma: 'Audio', tipo: 'Archivo', audio: raw, url: raw };

    // YouTube
    if (es(/(^|\.)youtube(-nocookie)?\.com$/) || h === 'youtu.be') {
      var id = null, lista = q.get('list'), corto = /^\/shorts\//.test(p);
      if (h === 'youtu.be') id = p.split('/')[1];
      else if ((m = p.match(/^\/(?:shorts|embed|live|v)\/([\w-]{6,})/))) id = m[1];
      else id = q.get('v');
      if (id) return iframe('YouTube', corto ? 'Short' : (/^\/live\//.test(p) ? 'Directo' : 'Video'),
        'https://www.youtube.com/embed/' + encodeURIComponent(id) + (lista && !corto ? '?list=' + encodeURIComponent(lista) : ''),
        corto ? { aspect: '9/16', vertical: true } : {});
      if (lista) return iframe('YouTube', 'Lista', 'https://www.youtube.com/embed/videoseries?list=' + encodeURIComponent(lista));
      return enlace('YouTube', 'Canal');
    }
    // Twitch
    if (es(/(^|\.)twitch\.tv$/)) {
      if (h === 'player.twitch.tv') return iframe('Twitch', 'Directo', raw + (/[?&]parent=/.test(raw) ? '' : (raw.indexOf('?') < 0 ? '?' : '&') + 'parent=' + padre));
      if (h === 'clips.twitch.tv' && (m = p.match(/^\/([\w-]+)/))) return iframe('Twitch', 'Clip', 'https://clips.twitch.tv/embed?clip=' + m[1] + '&parent=' + padre + '&autoplay=false');
      if ((m = p.match(/\/clip\/([\w-]+)/))) return iframe('Twitch', 'Clip', 'https://clips.twitch.tv/embed?clip=' + m[1] + '&parent=' + padre + '&autoplay=false');
      if ((m = p.match(/^\/videos\/(\d+)/))) return iframe('Twitch', 'Video', 'https://player.twitch.tv/?video=' + m[1] + '&parent=' + padre + '&autoplay=false');
      if ((m = p.match(/^\/([\w]+)\/?$/)) && !/^(directory|videos|downloads|settings)$/i.test(m[1])) return iframe('Twitch', 'Directo', 'https://player.twitch.tv/?channel=' + m[1] + '&parent=' + padre + '&autoplay=false');
      return enlace('Twitch');
    }
    // Kick
    if (es(/(^|\.)kick\.com$/)) {
      if ((m = p.match(/^\/video\/([\w-]+)/))) return iframe('Kick', 'Video', 'https://player.kick.com/video/' + m[1]);
      if (h === 'player.kick.com') return iframe('Kick', 'Directo', raw);
      if ((m = p.match(/^\/([\w-]+)\/?$/)) && !/^(categories|video|browse)$/i.test(m[1])) return iframe('Kick', 'Directo', 'https://player.kick.com/' + m[1]);
      return enlace('Kick');
    }
    // TikTok
    if (es(/(^|\.)tiktok\.com$/)) {
      if ((m = p.match(/\/(?:video|embed\/v2|player\/v1)\/(\d+)/))) return iframe('TikTok', 'Video', 'https://www.tiktok.com/embed/v2/' + m[1], { aspect: '325/738', vertical: true });
      return enlace('TikTok', /^\/@[\w.]+\/?$/.test(p) ? 'Perfil' : 'Enlace');
    }
    // Instagram
    if (es(/(^|\.)instagram\.com$/)) {
      if ((m = p.match(/^\/(?:[\w.]+\/)?(p|reels?|tv)\/([\w-]+)/))) {
        var reel = m[1] !== 'p';
        return iframe('Instagram', reel ? 'Reel' : 'Publicación', 'https://www.instagram.com/' + (m[1] === 'reels' ? 'reel' : m[1]) + '/' + m[2] + '/embed/',
          reel ? { aspect: '9/19.5', vertical: true } : { aspect: '4/5' });
      }
      return enlace('Instagram', 'Perfil');
    }
    // Facebook
    if (es(/(^|\.)(facebook|fb)\.com$/) || h === 'fb.watch') {
      var enc = encodeURIComponent(raw);
      if (h === 'fb.watch' || /\/(videos?|watch)\b/.test(p) || /^\/reel\//.test(p)) {
        var rl = /^\/reel\//.test(p);
        return iframe('Facebook', rl ? 'Reel' : 'Video', 'https://www.facebook.com/plugins/video.php?href=' + enc + '&show_text=false&autoplay=false', rl ? { aspect: '9/16', vertical: true } : {});
      }
      if (p.split('/').filter(Boolean).length >= 2) return iframe('Facebook', 'Publicación', 'https://www.facebook.com/plugins/post.php?href=' + enc + '&show_text=false&width=500', { aspect: '4/5' });
      return enlace('Facebook', 'Página');
    }
    // X / Twitter
    if (es(/(^|\.)(twitter|x)\.com$/)) {
      if ((m = p.match(/\/status(?:es)?\/(\d+)/))) return iframe('X', 'Publicación', 'https://platform.twitter.com/embed/Tweet.html?id=' + m[1] + '&dnt=true', { aspect: '1/1.1' });
      return enlace('X', 'Perfil');
    }
    // Spotify
    if (es(/(^|\.)spotify\.com$/)) {
      if ((m = p.match(/\/(track|album|playlist|episode|show|artist)\/([\w]+)/))) {
        var pequeno = m[1] === 'track' || m[1] === 'episode';
        return iframe('Spotify', { track: 'Canción', album: 'Álbum', playlist: 'Lista', episode: 'Episodio', show: 'Podcast', artist: 'Artista' }[m[1]],
          'https://open.spotify.com/embed/' + m[1] + '/' + m[2], { alto: pequeno ? 152 : 352, scroll: !pequeno });
      }
      return enlace('Spotify');
    }
    // SoundCloud
    if (es(/(^|\.)soundcloud\.com$/)) return iframe('SoundCloud', 'Audio', 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(raw) + '&visual=true', { alto: 300, scroll: true });
    // Vimeo
    if (es(/(^|\.)vimeo\.com$/) && (m = p.match(/\/(?:video\/)?(\d+)/))) return iframe('Vimeo', 'Video', 'https://player.vimeo.com/video/' + m[1]);
    // Dailymotion
    if (es(/(^|\.)dailymotion\.com$/) && (m = p.match(/\/video\/([\w]+)/))) return iframe('Dailymotion', 'Video', 'https://www.dailymotion.com/embed/video/' + m[1]);
    // Google Drive (videos, fotos, PDF)
    if (h === 'drive.google.com' && (m = p.match(/\/file\/d\/([\w-]+)/))) return iframe('Google Drive', 'Archivo', 'https://drive.google.com/file/d/' + m[1] + '/preview', { scroll: true });
    // Cualquier otro sitio: tarjeta con botón (muchos sitios no permiten mostrarse dentro de otra página)
    return enlace(h.replace(/^www\./, ''));
  };


  // Instagram y X avisan a la página cuánto mide su contenido: así el recuadro se ajusta solo y no aparecen barras de desplazamiento.
  if (!D._ajusteMedios) {
    D._ajusteMedios = true;
    window.addEventListener('message', function (e) {
      var alto = 0, d = e.data;
      try {
        if (e.origin === 'https://www.instagram.com') {
          var j = typeof d === 'string' ? JSON.parse(d) : d;
          if (j && j.type === 'MEASURE' && j.details) alto = +j.details.height;
        } else if (e.origin === 'https://platform.twitter.com') {
          var t = typeof d === 'string' ? JSON.parse(d) : d, r = t && t['twttr.embed'];
          if (r && /resize/.test(r.method) && r.params && r.params[0]) alto = +r.params[0].height;
        }
      } catch (_) { return; }
      if (!(alto > 40 && alto < 4000)) return;
      var marcos = document.querySelectorAll('.media-box[data-ajuste="1"] iframe');
      for (var i = 0; i < marcos.length; i++) {
        if (marcos[i].contentWindow === e.source) { var caja = marcos[i].parentNode; caja.style.aspectRatio = 'auto'; caja.style.height = Math.ceil(alto) + 'px'; }
      }
    });
  }

  // HTML del bloque (etiqueta con el origen + el contenido encajado).
  D.htmlMedio = function (entrada) {
    var m = D.detectarMedio(entrada);
    if (!m) return '';
    var etiqueta = '<div class="media-tag">' + D.iconoRed(m.plataforma) + '<span>' + D.esc(m.plataforma) + (m.tipo ? ' · ' + D.esc(m.tipo) : '') + '</span></div>';
    var cuerpo;
    if (m.src) {
      var medida = m.alto ? 'height:' + m.alto + 'px' : 'aspect-ratio:' + m.aspect;
      cuerpo = '<div class="media-box" data-ajuste="' + (/instagram|^x$/i.test(m.plataforma) ? '1' : '') + '" style="' + medida + '"><iframe src="' + D.esc(m.src) + '" title="' + D.esc(m.plataforma + ' ' + (m.tipo || '')) +
        '"' + (m.sinScroll ? ' scrolling="no"' : '') + ' loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen></iframe></div>';
    } else if (m.imagen) {
      cuerpo = '<a class="media-img" href="' + D.esc(m.imagen) + '" target="_blank" rel="noopener"><img src="' + D.esc(m.imagen) + '" alt="" loading="lazy"></a>';
    } else if (m.video) {
      cuerpo = '<div class="media-box" style="aspect-ratio:16/9"><video src="' + D.esc(m.video) + '" controls playsinline preload="metadata"></video></div>';
    } else if (m.audio) {
      cuerpo = '<div class="media-box media-audio"><audio src="' + D.esc(m.audio) + '" controls preload="none"></audio></div>';
    } else {
      cuerpo = '<div class="media-link"><a class="btn dark sm" href="' + D.esc(m.enlace) + '" target="_blank" rel="noopener">Abrir en ' + D.esc(m.plataforma) + '</a></div>';
    }
    return '<article class="media-item' + (m.vertical ? ' v' : '') + '">' + etiqueta + cuerpo + '</article>';
  };

  // Los cambios locales del editor reemplazan los archivos originales de talentos.
  D.cargarTalentos = function () {
    D.talentos = [];
    return D.listaTalentos.reduce(function (p, carpeta) {
      return p.then(function () {
        return new Promise(function (ok) {
          D._actual = carpeta;
          var s = document.createElement('script');
          s.src = D.raiz + 'talentos/' + encodeURIComponent(carpeta) + '/datos.js?v=' + Date.now();
          s.onload = ok;
          s.onerror = function () { console.warn('No se encontró talentos/' + carpeta + '/datos.js'); ok(); };
          document.head.appendChild(s);
        });
      });
    }, Promise.resolve());
  };
})();
