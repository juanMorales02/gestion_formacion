<script setup>
// Panel del login: esfera de cristal con meridianos y paralelos, el símbolo de SENA flotando dentro,
// y una órbita punteada con tres puntos de color que gira despacio.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import logo from '@/assets/sena.png'

const raiz = ref(null)
const mover = (e) => {
  const s = raiz.value.style
  s.setProperty('--dx', `${((e.clientX / innerWidth - 0.5) * 10).toFixed(2)}px`)
  s.setProperty('--dy', `${((e.clientY / innerHeight - 0.5) * 8).toFixed(2)}px`)
}
onMounted(() => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) window.addEventListener('mousemove', mover) })
onBeforeUnmount(() => window.removeEventListener('mousemove', mover))

// Paralelos: [desplazamiento vertical, radio horizontal]
const paralelos = [[-194, 173], [-128, 227], [-69, 255], [0, 262], [60, 255], [128, 227], [192, 173]]
</script>

<template>
  <div ref="raiz" class="globo-logo lienzo-panel" :style="{ '--logo': `url(${logo})` }" role="img" aria-label="Símbolo de SENA dentro de una esfera de cristal">
    <div class="gl-escena">
      <svg class="gl-svg" viewBox="-322 -322 644 644" aria-hidden="true">
        <defs>
          <radialGradient id="gl-cuerpo" cx="38%" cy="32%" r="75%">
            <stop offset="0" stop-color="#fff" stop-opacity=".95" />
            <stop offset="1" stop-color="#e3f1da" stop-opacity=".85" />
          </radialGradient>
          <radialGradient id="gl-piso" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#2c4a2a" stop-opacity=".38" />
            <stop offset="1" stop-color="#2c4a2a" stop-opacity="0" />
          </radialGradient>
        </defs>

        <ellipse class="gl-piso" cx="0" cy="300" rx="235" ry="34" fill="url(#gl-piso)" />

        <g class="gl-gira">
          <circle class="gl-orbita" r="322" />
          <g transform="translate(-192 -206)"><circle r="15" fill="#50e5f9" opacity=".3" /><circle r="7" fill="#50e5f9" stroke="#fff" stroke-width="2.5" /></g>
          <g transform="translate(323 0)"><circle r="15" fill="#fdc300" opacity=".3" /><circle r="7" fill="#fdc300" stroke="#fff" stroke-width="2.5" /></g>
          <g transform="translate(-109 290)"><circle r="15" fill="#39a900" opacity=".3" /><circle r="7" fill="#39a900" stroke="#fff" stroke-width="2.5" /></g>
        </g>

        <circle r="262" fill="url(#gl-cuerpo)" />
        <g class="gl-lineas">
          <ellipse rx="130" ry="262" />
          <ellipse rx="228" ry="262" />
          <ellipse v-for="([y, rx]) in paralelos" :key="y" :cx="0" :cy="y" :rx="rx" :ry="Math.max(rx * 0.095, 1)" />
        </g>
        <circle r="262" fill="none" stroke="#fff" stroke-width="3" />
      </svg>

      <div class="gl-logo">
        <i class="gl-cara" /><i class="gl-brillo" /><i class="gl-destello" />
      </div>
    </div>
  </div>
</template>

<style>
.globo-logo{--dx:0px;--dy:0px}
.globo-logo .gl-escena{position:absolute;left:50%;top:47%;width:min(86%,80vh,780px);aspect-ratio:1;transform:translate(-50%,-50%)}
.globo-logo .gl-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.globo-logo .gl-orbita{fill:none;stroke:#50e5f9;stroke-width:3;stroke-dasharray:.1 9;stroke-linecap:round}
.globo-logo .gl-gira{animation:gl-gira 90s linear infinite}
.globo-logo .gl-lineas{fill:none;stroke:#7cc443;stroke-width:1.6;stroke-opacity:.75}
.globo-logo .gl-piso{animation:gl-piso 7s ease-in-out infinite alternate;transform-origin:0 300px}

.globo-logo .gl-logo{position:absolute;left:24.5%;top:24%;width:51%;aspect-ratio:600/588;filter:drop-shadow(0 16px 14px rgba(24,60,20,.32));animation:gl-flota 7s ease-in-out infinite alternate}
.globo-logo .gl-logo i{position:absolute;inset:0;-webkit-mask:var(--logo) center/contain no-repeat;mask:var(--logo) center/contain no-repeat}
.globo-logo .gl-cara{background:linear-gradient(150deg,#c4f07a 0%,#7fd13c 32%,#39a900 62%,#1f8a4c 100%);transition:transform .5s cubic-bezier(.2,.7,.2,1);transform:translate(calc(var(--dx)*.3),calc(var(--dy)*.3))}
.globo-logo .gl-brillo{background:linear-gradient(120deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 40%);transform:translate(calc(var(--dx)*.3),calc(var(--dy)*.3))}
.globo-logo .gl-destello{background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.8) 50%,transparent 60%);background-size:300% 100%;background-position:130% 0;animation:gl-barrido 7s ease-in-out 1.2s infinite}

@keyframes gl-gira{to{transform:rotate(360deg)}}
@keyframes gl-flota{to{transform:translateY(-8px)}}
@keyframes gl-piso{to{transform:scaleX(.9);opacity:.75}}
@keyframes gl-barrido{0%{background-position:130% 0}45%,100%{background-position:-30% 0}}
</style>