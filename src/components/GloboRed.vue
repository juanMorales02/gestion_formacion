<script setup>
// Globo de puntos con la red de centros de formación: arcos amarillos y celestes que parten de Bogotá.
// Canvas 2D, sin librerías. El globo se balancea para que Colombia siempre quede a la vista.
import { ref, onMounted, onBeforeUnmount } from 'vue'

const lienzo = ref(null)
const N = 1500
const PUNTOS = Array.from({ length: N }, (_, i) => {
  const th = Math.acos(1 - (2 * (i + 0.5)) / N), ph = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
  return [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]
})
const vec = (lat, lon) => {
  const f = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180
  return [Math.cos(f) * Math.sin(l), Math.sin(f), Math.cos(f) * Math.cos(l)]
}
// 0 Bogotá (centro), 1 Medellín, 2 Cali, 3 Barranquilla, 4 Bucaramanga, 5 Pasto, 6 Lima, 7 Miami, 8 Ciudad de México, 9 Madrid, 10 Buenos Aires
const NODOS = [[4.7, -74.1], [6.2, -75.6], [3.4, -76.5], [11, -74.8], [7.1, -73.1], [1.2, -77.3], [-12, -77], [25.8, -80.2], [19.4, -99.1], [40.4, -3.7], [-34.6, -58.4]].map(([a, b]) => vec(a, b))
const ARCOS = [[0, 1], [0, 2], [0, 3], [0, 4], [2, 5], [1, 3], [0, 6], [0, 7], [7, 8], [0, 10], [0, 9]]
const AMARILLO = '253,195,0', CELESTE = '80,229,249'

let raf = 0, ro, w = 0, h = 0, dpr = 1

const dibujar = (t) => {
  const c = lienzo.value, g = c.getContext('2d')
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  g.clearRect(0, 0, w, h)

  const R = Math.min(w * 0.3, h * 0.29)
  const cx = w / 2, cy = h * 0.47, k = R / 250
  const a = ((80 + 24 * Math.sin(t * 0.14)) * Math.PI) / 180
  const tilt = 0.3
  const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(tilt), st = Math.sin(tilt)
  const inclinar = ([x, y, z]) => [x, y * ct - z * st, y * st + z * ct]
  const girar = ([x, y, z]) => inclinar([x * ca + z * sa, y, -x * sa + z * ca])
  const P = ([x, y]) => [cx + R * x, cy - R * y]

  // Sombra en el piso
  g.save()
  g.translate(cx, cy + R * 1.2); g.scale(1, 0.14)
  const sh = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.95)
  sh.addColorStop(0, 'rgba(44,74,42,.34)'); sh.addColorStop(1, 'rgba(44,74,42,0)')
  g.fillStyle = sh; g.beginPath(); g.arc(0, 0, R * 0.95, 0, 6.2832); g.fill()
  g.restore()

  // Anillo del satélite: mitad de atrás, antes del globo
  const anillo = (u) => { const x = 1.34 * Math.cos(u), z = 1.34 * Math.sin(u); return inclinar([x * Math.cos(-0.3), x * Math.sin(-0.3), z]) }
  const trazo = (frontal, alfa) => {
    g.beginPath()
    let abierto = false
    for (let i = 0; i <= 160; i++) {
      const p = anillo((i / 160) * 6.2832)
      if ((p[2] >= 0) === frontal) { const [sx, sy] = P(p); abierto ? g.lineTo(sx, sy) : g.moveTo(sx, sy); abierto = true } else abierto = false
    }
    g.strokeStyle = `rgba(${CELESTE},${alfa})`; g.lineWidth = 1.6; g.lineCap = 'round'; g.stroke()
  }
  const satelite = (frontal) => {
    const p = anillo(t * 0.45)
    if ((p[2] >= 0) !== frontal) return
    const [sx, sy] = P(p)
    g.beginPath(); g.arc(sx, sy, 6 * k + 2, 0, 6.2832); g.fillStyle = `rgb(${CELESTE})`; g.fill()
    g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke()
  }
  trazo(false, 0.35); satelite(false)

  // Cuerpo del globo
  const gr = g.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R)
  gr.addColorStop(0, 'rgba(255,255,255,.96)'); gr.addColorStop(1, 'rgba(227,241,218,.82)')
  g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.fillStyle = gr; g.fill()
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2; g.stroke()

  // Puntos por niveles de profundidad
  const cubos = Array.from({ length: 6 }, () => new Path2D())
  for (const v of PUNTOS) {
    const [x, y, z] = girar(v)
    if (z < -0.05) continue
    const b = Math.min(5, Math.max(0, Math.floor(z * 6)))
    const r = (0.8 + 1.9 * (b / 5)) * k + 0.3
    const [sx, sy] = P([x, y])
    cubos[b].moveTo(sx + r, sy); cubos[b].arc(sx, sy, r, 0, 6.2832)
  }
  cubos.forEach((p, b) => { g.fillStyle = `rgba(57,169,0,${0.25 + 0.75 * (b / 5)})`; g.fill(p) })

  // Arcos entre centros de formación, con un pulso que viaja
  ARCOS.forEach(([i, j], n) => {
    const A = NODOS[i], B = NODOS[j]
    const om = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]))
    const lift = 0.1 + 0.28 * Math.min(1, om / 1.6)
    const pt = (s) => {
      const u = Math.sin((1 - s) * om) / Math.sin(om), v = Math.sin(s * om) / Math.sin(om)
      const e = 1 + lift * Math.sin(Math.PI * s)
      return girar([(A[0] * u + B[0] * v) * e, (A[1] * u + B[1] * v) * e, (A[2] * u + B[2] * v) * e])
    }
    g.beginPath()
    let abierto = false
    for (let s = 0; s <= 1.0001; s += 1 / 32) {
      const p = pt(s)
      if (p[2] > -0.08) { const [sx, sy] = P(p); abierto ? g.lineTo(sx, sy) : g.moveTo(sx, sy); abierto = true } else abierto = false
    }
    g.strokeStyle = `rgba(${AMARILLO},.85)`; g.lineWidth = 1.8; g.lineCap = 'round'; g.stroke()
    const q = pt((t * 0.22 + n * 0.37) % 1)
    if (q[2] > -0.08) {
      const [sx, sy] = P(q)
      g.beginPath(); g.arc(sx, sy, 5 * k + 1.5, 0, 6.2832); g.fillStyle = 'rgba(255,240,170,.35)'; g.fill()
      g.beginPath(); g.arc(sx, sy, 2.4 * k + 1, 0, 6.2832); g.fillStyle = '#fff'; g.fill()
    }
  })

  // Nodos
  NODOS.forEach((v, i) => {
    const p = girar(v)
    if (p[2] < 0.02) return
    const [sx, sy] = P(p)
    const col = i === 0 || i % 2 ? AMARILLO : CELESTE
    const rad = (i === 0 ? 9 : i < 6 ? 4.5 : 6.5) * k + 2
    const pulso = 1 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2 + i))
    g.beginPath(); g.arc(sx, sy, rad * 1.7 * pulso, 0, 6.2832); g.fillStyle = `rgba(${col},.22)`; g.fill()
    g.beginPath(); g.arc(sx, sy, rad, 0, 6.2832); g.fillStyle = `rgb(${col})`; g.fill()
    g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke()
  })

  trazo(true, 0.75); satelite(true)
}

const medir = () => {
  const c = lienzo.value, r = c.parentElement.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = r.width; h = r.height
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  c.style.width = `${w}px`; c.style.height = `${h}px`
}

onMounted(() => {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
  medir()
  ro = new ResizeObserver(() => { medir(); if (quieto) dibujar(3) })
  ro.observe(lienzo.value.parentElement)
  if (quieto) return dibujar(3)
  const t0 = performance.now()
  const bucle = (ahora) => { dibujar(3 + (ahora - t0) / 1000); raf = requestAnimationFrame(bucle) }
  raf = requestAnimationFrame(bucle)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); ro?.disconnect() })
</script>

<template>
  <canvas ref="lienzo" class="lienzo-panel" role="img" aria-label="Globo terráqueo con una red de conexiones entre centros de formación de Colombia" />
</template>
