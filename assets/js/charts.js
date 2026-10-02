/* =========================================================
   PROJECT PULSE PROTOTYPE — tiny SVG chart helpers
   (no external libraries, so the demo works offline)
   ========================================================= */
(function () {
  "use strict";

  function fmt(v) { return (Math.round(v * 10) / 10).toLocaleString(); }

  // Line / area chart. opts: { labels, series:[{values,color,name}], min, max, height, yTicks, area }
  function line(opts) {
    var W = 640, H = opts.height || 240, P = { l: 36, r: 14, t: 16, b: 30 };
    var all = [];
    opts.series.forEach(function (s) { all = all.concat(s.values); });
    var min = opts.min != null ? opts.min : Math.min.apply(null, all);
    var max = opts.max != null ? opts.max : Math.max.apply(null, all);
    if (max === min) max = min + 1;
    var n = opts.labels.length;
    var x = function (i) { return P.l + (n === 1 ? 0 : i * (W - P.l - P.r) / (n - 1)); };
    var y = function (v) { return P.t + (H - P.t - P.b) * (1 - (v - min) / (max - min)); };
    var ticks = opts.yTicks || 4, out = [];
    out.push('<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.label || "Line chart") + '">');
    for (var t = 0; t <= ticks; t++) {
      var v = min + (max - min) * t / ticks, yy = y(v);
      out.push('<line class="grid-line" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '"/>');
      out.push('<text x="' + (P.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + fmt(v) + '</text>');
    }
    opts.labels.forEach(function (l, i) {
      out.push('<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + l + '</text>');
    });
    opts.series.forEach(function (s) {
      var pts = s.values.map(function (v, i) { return x(i) + "," + y(v); });
      if (opts.area !== false) {
        var id = "g" + Math.random().toString(36).slice(2, 8);
        out.push('<defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + s.color + '" stop-opacity=".22"/><stop offset="1" stop-color="' + s.color + '" stop-opacity="0"/></linearGradient></defs>');
        out.push('<path d="M' + x(0) + ',' + y(min) + ' L' + pts.join(" L") + ' L' + x(n - 1) + ',' + y(min) + ' Z" fill="url(#' + id + ')"/>');
      }
      out.push('<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>');
      s.values.forEach(function (v, i) {
        out.push('<circle cx="' + x(i) + '" cy="' + y(v) + '" r="4" fill="#fff" stroke="' + s.color + '" stroke-width="2"><title>' + opts.labels[i] + ': ' + fmt(v) + '</title></circle>');
      });
    });
    out.push('</svg>');
    return out.join("");
  }

  // Vertical bar chart. opts: { labels, values, color | colors, height, showValues }
  function bars(opts) {
    var W = 640, H = opts.height || 240, P = { l: 36, r: 10, t: 20, b: 30 };
    var max = opts.max || Math.max.apply(null, opts.values) * 1.15 || 1;
    var n = opts.values.length, slot = (W - P.l - P.r) / n, bw = Math.min(48, slot * 0.6), out = [];
    out.push('<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.label || "Bar chart") + '">');
    for (var t = 0; t <= 4; t++) {
      var v = max * t / 4, yy = P.t + (H - P.t - P.b) * (1 - t / 4);
      out.push('<line class="grid-line" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '"/>');
      out.push('<text x="' + (P.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + fmt(opts.decimals ? v : Math.round(v)) + '</text>');
    }
    opts.values.forEach(function (v, i) {
      var h = (H - P.t - P.b) * (v / max), xx = P.l + slot * i + (slot - bw) / 2, yy = H - P.b - h;
      var c = opts.colors ? opts.colors[i % opts.colors.length] : (opts.color || "#D3111C");
      out.push('<rect x="' + xx + '" y="' + yy + '" width="' + bw + '" height="' + Math.max(0, h) + '" rx="6" fill="' + c + '"><title>' + opts.labels[i] + ': ' + fmt(v) + '</title></rect>');
      if (opts.showValues !== false) out.push('<text class="val" x="' + (xx + bw / 2) + '" y="' + (yy - 6) + '" text-anchor="middle">' + fmt(v) + '</text>');
      out.push('<text x="' + (xx + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + opts.labels[i] + '</text>');
    });
    out.push('</svg>');
    return out.join("");
  }

  // Horizontal bars (HTML). items: [{label, value, color}], suffix
  function hbars(items, suffix, max) {
    max = max || Math.max.apply(null, items.map(function (i) { return i.value; }));
    return '<div class="hbars">' + items.map(function (it) {
      return '<div class="hbar"><span>' + it.label + '</span><div class="hbar__track"><div class="hbar__fill" style="width:' + (it.value / max * 100) + '%;--c:' + (it.color || "#D3111C") + '"></div></div><b>' + fmt(it.value) + (suffix || "") + '</b></div>';
    }).join("") + '</div>';
  }

  // Donut / gauge. value 0-100
  function gauge(value, color, label) {
    var r = 52, c = 2 * Math.PI * r, off = c * (1 - value / 100);
    return '<div class="gauge"><svg viewBox="0 0 140 140" width="160" height="160" role="img" aria-label="' + value + '%">' +
      '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="#EEF1F6" stroke-width="14"/>' +
      '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 70 70)"/>' +
      '</svg><div class="gauge__label"><b>' + value + '%</b><span>' + (label || "") + '</span></div></div>';
  }

  // Donut with segments. items: [{value,color}]
  function donut(items, centerTop, centerBottom) {
    var total = items.reduce(function (a, i) { return a + i.value; }, 0), r = 52, c = 2 * Math.PI * r, acc = 0, out = [];
    out.push('<div class="gauge"><svg viewBox="0 0 140 140" width="170" height="170">');
    out.push('<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="#EEF1F6" stroke-width="16"/>');
    items.forEach(function (it) {
      var len = c * it.value / total;
      out.push('<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="' + it.color + '" stroke-width="16" stroke-dasharray="' + len + ' ' + (c - len) + '" stroke-dashoffset="' + (-acc) + '" transform="rotate(-90 70 70)"><title>' + (it.label || "") + ': ' + it.value + '</title></circle>');
      acc += len;
    });
    out.push('</svg><div class="gauge__label"><b>' + centerTop + '</b><span>' + (centerBottom || "") + '</span></div></div>');
    return out.join("");
  }

  // Sparkline for tables. values on a 1-5 scale
  function spark(values, color) {
    var W = 90, H = 26, n = values.length;
    var pts = values.map(function (v, i) { return (i * (W - 4) / (n - 1) + 2) + "," + (H - 3 - (v - 1) / 4 * (H - 6)); });
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><polyline points="' + pts.join(" ") + '" fill="none" stroke="' + (color || "#0B4EA2") + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  window.PulseCharts = { line: line, bars: bars, hbars: hbars, gauge: gauge, donut: donut, spark: spark };
})();
