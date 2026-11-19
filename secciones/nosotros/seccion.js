(function () {
  var D = window.Dreamers;

  // ---- Utilidades compartidas con el editor de la página (admin/editor-pagina.js)
  var ICONOS_EXTRA = {
    correo: '<path d="M3 5.5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zm1.6 2 7.4 5.4 7.4-5.4H4.6zM20 9.3l-8 5.8-8-5.8v7.2h16V9.3z"/>',
    web: '<path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm6.9 8.5h-3.3a15 15 0 0 0-1.2-5 7.6 7.6 0 0 1 4.5 5zM12 4.5c.8.9 1.6 2.9 1.9 6.5h-3.8c.3-3.6 1.1-5.6 1.9-6.5zM4.6 13h3.3c.1 1.9.5 3.6 1.2 5a7.6 7.6 0 0 1-4.5-5zm3.3-2H4.6a7.6 7.6 0 0 1 4.5-5c-.7 1.4-1.1 3.1-1.2 5zm4.1 8.5c-.8-.9-1.6-2.9-1.9-6.5h3.8c-.3 3.6-1.1 5.6-1.9 6.5zm2.9-1.5c.7-1.4 1.1-3.1 1.2-5h3.3a7.6 7.6 0 0 1-4.5 5z"/>'
  };
  var PLATAFORMAS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'Twitch', 'Kick', 'Discord', 'Spotify', 'Correo', 'Web'];
  function iconoMiembro(plataforma) {
    var k = String(plataforma || '').trim().toLowerCase();
    if (k === 'web' || k === 'sitio web' || k === 'sitio') k = 'web';
    if (ICONOS_EXTRA[k]) return '<svg class="red-icon" viewBox="0 0 24 24" aria-label="' + D.esc(plataforma) + '"><g fill="currentColor">' + ICONOS_EXTRA[k] + '</g></svg>';
    return D.iconoRed(plataforma);
  }
  // Enlace de una red: acepta una dirección completa, un correo o solo el usuario (@usuario).
  function enlaceMiembro(r) {
    var e = String((r && r.enlace) || '').trim(), pl = String((r && r.plataforma) || '').trim().toLowerCase();
    if (!e) return '';
    if (/^(mailto:|tel:)/i.test(e)) return e;
    if (/^\S+@\S+\.\S+$/.test(e) && !/^https?:/i.test(e)) return 'mailto:' + e;
    if (/^https?:\/\//i.test(e) || /\.[a-z]{2,}(\/|$)/i.test(e)) return D.enlaceRed({ enlace: e });
    return D.enlaceRed({ plataforma: pl, usuario: e });
  }
  function conSaltos(t) { return D.esc(t).replace(/\n/g, '<br>'); }
  function inicial(n) { return String(n || '?').trim().charAt(0).toUpperCase() || '?'; }
  function visible(e) { return !(e && (e.visible === false || e.visible === 'false')); }

  D.nosotrosUtil = { PLATAFORMAS: PLATAFORMAS, iconoMiembro: iconoMiembro, enlaceMiembro: enlaceMiembro, visible: visible };

  // ---- HTML de la página. Con ed=true cada texto es editable y aparecen los controles del editor.
  function campo(ed, ruta, tag, cls, valor, ph, multi) {
    var v = String(valor == null ? '' : valor);
    if (!ed) return v.trim() ? '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + conSaltos(v) + '</' + tag + '>' : '';
    return '<' + tag + (cls ? ' class="' + cls + '"' : '') + ' data-r="' + ruta + '"' + (multi ? ' data-multi="1"' : '') + ' data-ph="' + D.esc(ph) + '" contenteditable="true" spellcheck="true">' + D.esc(v) + '</' + tag + '>';
  }
  function imagenProp(src, ed, ruta, alt, extra) {
    var im = src ? D.img(/^data:/.test(src) ? src : 'secciones/nosotros/' + src, alt) : '<div class="eq-vacia" aria-hidden="true"></div>';
    if (!ed) return im;
    return im + '<button type="button" class="ed-foto" data-foto="' + ruta + '">' + (extra || 'Cambiar imagen') + '</button>';
  }

  function tarjeta(m, i, n, ed) {
    var redes = (m.redes || []).map(function (r) {
      var href = enlaceMiembro(r);
      return href ? '<a class="red-badge" href="' + D.esc(href) + '" target="_blank" rel="noopener noreferrer" title="' + D.esc(r.plataforma) + '">' + iconoMiembro(r.plataforma) + '</a>'
                  : '<span class="red-badge" title="' + D.esc(r.plataforma) + '">' + iconoMiembro(r.plataforma) + '</span>';
    }).join('');
    var ph = m.foto
      ? imagenProp(m.foto, ed, 'equipo.miembros.' + i + '.foto', m.nombre, 'Cambiar foto')
      : '<div class="eq-inicial" aria-hidden="true">' + D.esc(inicial(m.nombre)) + '</div>' + (ed ? '<button type="button" class="ed-foto" data-foto="equipo.miembros.' + i + '.foto">Subir foto</button>' : '');
    var r = 'equipo.miembros.' + i + '.';
    return '<article class="eq-card">' +
      (ed ? '<div class="ed-ctl ed-card-bar"><button type="button" data-acc="mover" data-i="' + i + '" data-d="-1" title="Mover antes"' + (i === 0 ? ' disabled' : '') + '>←</button>' +
        '<button type="button" data-acc="mover" data-i="' + i + '" data-d="1" title="Mover después"' + (i === n - 1 ? ' disabled' : '') + '>→</button>' +
        '<button type="button" data-acc="duplicar" data-i="' + i + '" title="Duplicar">⧉</button>' +
        '<button type="button" data-acc="borrar" data-i="' + i + '" class="peligro" title="Eliminar">×</button></div>' : '') +
      '<div class="eq-ph">' + ph + '</div><div class="eq-body">' +
      campo(ed, r + 'nombre', 'h3', 'eq-nombre', m.nombre, 'Nombre') +
      campo(ed, r + 'cargo', 'p', 'eq-cargo', m.cargo, 'Cargo') +
      campo(ed, r + 'descripcion', 'p', 'eq-desc', m.descripcion, 'Descripción breve', true) +
      ((redes || ed) ? '<div class="soc eq-soc">' + redes + (ed ? '<button type="button" class="ed-ctl ed-redes" data-acc="redes" data-i="' + i + '">' + (redes ? '✎ Redes' : '＋ Redes') + '</button>' : '') + '</div>' : '') +
      '</div></article>';
  }

  function html(c, ed) {
    var puntos = (c.puntos || []).map(function (p, i) {
      return '<li' + (ed ? ' class="ed-li"' : '') + '>' + campo(ed, 'puntos.' + i, 'span', 'pt', p, 'Escribe un punto…', true) +
        (ed ? '<span class="ed-ctl ed-li-bar"><button type="button" data-acc="punto-mover" data-i="' + i + '" data-d="-1" title="Subir">↑</button><button type="button" data-acc="punto-mover" data-i="' + i + '" data-d="1" title="Bajar">↓</button><button type="button" data-acc="punto-borrar" data-i="' + i + '" class="peligro" title="Eliminar">×</button></span>' : '') + '</li>';
    }).join('');
    var lado = c.imagenLado === 'derecha' ? ' inv' : '';
    var acerca = '<div class="sec white">' +
      (ed ? '<div class="ed-ctl ed-ajustes in"><b>Sección «Sobre nosotros»</b><label>Imagen a la <select data-s="imagenLado"><option value="izquierda"' + (lado ? '' : ' selected') + '>izquierda</option><option value="derecha"' + (lado ? ' selected' : '') + '>derecha</option></select></label></div>' : '') +
      '<div class="in"><div class="about' + lado + '"><div class="about-img">' + imagenProp(c.imagen, ed, 'imagen', '') + '</div>' +
      '<div>' + campo(ed, 'titulo', 'h2', '', c.titulo, 'Título') + campo(ed, 'texto', 'p', '', c.texto, 'Cuéntanos quiénes son…', true) +
      '<ul>' + puntos + '</ul>' + (ed ? '<button type="button" class="ed-ctl ed-add" data-acc="punto-nuevo">＋ Agregar punto</button>' : '') + '</div></div></div></div>';

    var e = c.equipo || {}, miembros = Array.isArray(e.miembros) ? e.miembros : [];
    var ver = visible(e);
    if (!ed && (!ver || !miembros.length)) return acerca;
    var fondo = { blanco: 'white', gris: 'grey', oscuro: 'dark' }[e.fondo] || 'grey';
    var cols = Math.min(5, Math.max(1, parseInt(e.columnas, 10) || 4));
    function op(v, t, a) { return '<option value="' + v + '"' + (String(a) === String(v) ? ' selected' : '') + '>' + t + '</option>'; }
    var equipo = '<div class="sec eq-sec ' + fondo + (ed && !ver ? ' ed-oculta' : '') + '" id="equipo">' +
      (ed ? '<div class="ed-ctl ed-ajustes in"><b>Sección «Equipo»</b>' +
        '<label><input type="checkbox" data-s="equipo.visible"' + (ver ? ' checked' : '') + '> Mostrar en el sitio</label>' +
        '<label>Fondo <select data-s="equipo.fondo">' + op('blanco', 'Claro', e.fondo || 'gris') + op('gris', 'Gris', e.fondo || 'gris') + op('oscuro', 'Oscuro', e.fondo || 'gris') + '</select></label>' +
        '<label>Tarjetas por fila <select data-s="equipo.columnas" data-num="1">' + [2, 3, 4, 5].map(function (n) { return op(n, n, cols); }).join('') + '</select></label>' +
        (!ver ? '<span class="ed-aviso">Oculta: los visitantes no la ven</span>' : '') + '</div>' : '') +
      '<div class="in">' + (ed || (e.titulo || '').trim() ? '<h2 class="t"' + (ed ? ' data-r="equipo.titulo" data-ph="Título del equipo" contenteditable="true" spellcheck="true"' : '') + '>' + D.esc(e.titulo || '') + '</h2>' : '') +
      campo(ed, 'equipo.texto', 'p', 'eq-intro', e.texto, 'Texto de introducción (opcional)', true) +
      '<div class="eq-grid" style="--cols:' + cols + '">' + miembros.map(function (m, i) { return tarjeta(m, i, miembros.length, ed); }).join('') +
      (ed ? '<button type="button" class="ed-ctl eq-nuevo" data-acc="nuevo"><span>＋</span>Agregar miembro</button>' : '') + '</div></div></div>';
    return acerca + equipo;
  }
  D.nosotrosHTML = html;

  D.registrar('nosotros', function (el) {
    el.innerHTML = html(D.contenido.nosotros, false);
    // Edición en vivo: solo existe en el servidor local (servidor_editor.py). En el sitio publicado esta petición da 404 y no pasa nada.
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !el.hasAttribute('data-editando')) {
      fetch(D.raiz + 'api/nosotros', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (j && j.editable) D.cargarScript('admin/editor-pagina.js');
      }).catch(function () {});
    }
  });
})();
