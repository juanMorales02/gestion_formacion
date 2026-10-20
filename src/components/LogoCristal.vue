<script setup>
// El símbolo de SENA como un bloque de cristal verde: grosor por capas, brillo que lo barre
// de vez en cuando y una leve inclinación que sigue al mouse.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import logo from '@/assets/sena.png'

const raiz = ref(null)
const mover = (e) => {
  const s = raiz.value.style
  s.setProperty('--ry', `${((e.clientX / innerWidth - 0.5) * 14).toFixed(2)}deg`)
  s.setProperty('--rx', `${(-(e.clientY / innerHeight - 0.5) * 10).toFixed(2)}deg`)
}
onMounted(() => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) window.addEventListener('mousemove', mover) })
onBeforeUnmount(() => window.removeEventListener('mousemove', mover))
</script>

<template>
  <div ref="raiz" class="logo-cristal lienzo-panel" :style="{ '--logo': `url(${logo})` }" role="img" aria-label="Símbolo de SENA en cristal verde">
    <svg class="orbitas" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="48" class="o-fino" />
      <circle cx="50" cy="50" r="37" class="o-gris" />
      <g class="gira g1"><circle cx="50" cy="50" r="48" class="o-puntos" /><circle cx="98" cy="50" r="1.7" class="p-sol" /><circle cx="14.5" cy="17.5" r="1.3" class="p-cian" /></g>
      <g class="gira g2"><circle cx="50" cy="50" r="37" class="o-nada" /><circle cx="26" cy="83" r="1.2" class="p-verde" /></g>
    </svg>
    <div class="escenario">
      <div class="piso" />
      <div class="flota">
        <div class="bloque">
          <i v-for="n in 10" :key="n" class="capa" :style="{ '--n': 11 - n }" />
          <i class="cara" /><i class="brillo" /><i class="destello" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.logo-cristal{--rx:0deg;--ry:0deg}
.logo-cristal .orbitas{position:absolute;left:50%;top:47%;width:min(86%,80vh,780px);aspect-ratio:1;transform:translate(-50%,-50%);overflow:visible}
.logo-cristal .o-fino{fill:none;stroke:#fff;stroke-width:2;vector-effect:non-scaling-stroke}
.logo-cristal .o-gris{fill:none;stroke:#cfd6db;stroke-width:2;vector-effect:non-scaling-stroke}
.logo-cristal .o-puntos{fill:none;stroke:#50e5f9;stroke-width:3;stroke-dasharray:.1 3;stroke-linecap:round;vector-effect:non-scaling-stroke}
.logo-cristal .o-nada{fill:none}
.logo-cristal .gira{transform-box:view-box;transform-origin:50px 50px;animation:gira-orbita 80s linear infinite}
.logo-cristal .g2{animation-duration:55s;animation-direction:reverse}
.logo-cristal .p-sol{fill:#fdc300;stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke}
.logo-cristal .p-cian{fill:#50e5f9;stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke}
.logo-cristal .p-verde{fill:#39a900;stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke}
.logo-cristal .escenario{position:absolute;left:50%;top:47%;width:min(46%,42vh,400px);aspect-ratio:600/588;transform:translate(-50%,-50%)}
.logo-cristal .piso{position:absolute;left:4%;right:4%;bottom:-16%;height:9%;border-radius:50%;background:radial-gradient(closest-side,rgba(44,74,42,.38),transparent);filter:blur(5px);animation:piso 7s ease-in-out infinite alternate}
.logo-cristal .flota{position:absolute;inset:0;animation:flotar 7s ease-in-out infinite alternate}
.logo-cristal .bloque{position:absolute;inset:0;transform:perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.logo-cristal .bloque i{position:absolute;inset:0;-webkit-mask:var(--logo) center/contain no-repeat;mask:var(--logo) center/contain no-repeat}
.logo-cristal .capa{background:#1b6a00;background:color-mix(in srgb,#2f9500 calc(100% - var(--n)*8%),#0b3300);transform:translate(calc(var(--n)*1.3px),calc(var(--n)*1.9px))}
.logo-cristal .cara{background:linear-gradient(160deg,#c9f27a 0%,#7fd13c 35%,#39a900 65%,#1f7f5e 100%)}
.logo-cristal .brillo{background:linear-gradient(115deg,rgba(255,255,255,.7) 0%,rgba(255,255,255,0) 38%)}
.logo-cristal .destello{background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.85) 50%,transparent 60%);background-size:300% 100%;background-position:130% 0;animation:barrido 7s ease-in-out 1.2s infinite}
@keyframes barrido{0%{background-position:130% 0}45%,100%{background-position:-30% 0}}
@keyframes gira-orbita{to{transform:rotate(360deg)}}
@keyframes piso{to{transform:scaleX(.9);opacity:.75}}
</style>
