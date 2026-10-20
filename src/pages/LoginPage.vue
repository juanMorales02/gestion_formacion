<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fail, info, validar, emailOk } from '@/helpers/alerts'
import GloboLogo from '@/components/GloboLogo.vue'
import logo from '@/assets/sena.png'

const auth = useAuthStore()
const router = useRouter()
const f = ref({ email: '', password: '' })
const ver = ref(false)
const cargando = ref(false)

const entrar = async () => {
  if (!validar([[!f.value.email.trim(), 'Escribe tu correo'], [f.value.email.trim() && !emailOk(f.value.email), 'El correo no tiene un formato válido'], [!f.value.password, 'Escribe tu contraseña']])) return
  cargando.value = true
  try {
    await auth.login(f.value.email, f.value.password)
    router.push('/')
  } catch (e) { fail(e) } finally { cargando.value = false }
}
const pedirCuenta = () => info('Pide tu cuenta', 'El administrador de tu centro de formación crea las cuentas desde la sección Cuentas.')
</script>

<template>
  <main class="acceso">
    <section class="entrada">
      <form class="formulario" novalidate @submit.prevent="entrar">
        <div class="marca-acceso">
          <img :src="logo" alt="SENA" />
          <span>Servicio Nacional<br />de Aprendizaje</span>
        </div>
        <div class="franja" aria-hidden="true"><i /><i /><i /></div>
        <h1>Bienvenido a SENA</h1>
        <p class="intro">Gestiona los cursos y aprendices de tu centro de formación.</p>

        <label class="entrada-campo">
          <span>Correo</span>
          <span class="caja">
            <q-icon name="mail_outline" size="20px" />
            <input v-model="f.email" type="email" placeholder="instructor@sena.edu.co" name="correo-sena" autocomplete="off" readonly @focus="$event.target.removeAttribute('readonly')" />
          </span>
        </label>

        <label class="entrada-campo">
          <span>Contraseña</span>
          <span class="caja">
            <q-icon name="lock_outline" size="20px" />
            <input v-model="f.password" :type="ver ? 'text' : 'password'" placeholder="••••••••" name="clave-sena" autocomplete="new-password" readonly @focus="$event.target.removeAttribute('readonly')" />
            <button type="button" class="ojo" :aria-label="ver ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="ver = !ver">
              <q-icon :name="ver ? 'visibility_off' : 'visibility'" size="20px" />
            </button>
          </span>
        </label>

        <q-btn type="submit" unelevated no-caps label="Iniciar sesión" class="boton grande" :loading="cargando" />

        <p class="sin-cuenta">¿No tienes cuenta? <a href="#" class="enlace-verde" @click.prevent="pedirCuenta">Pídela al administrador de tu centro.</a></p>

        <div class="ayuda">
          <strong><q-icon name="help" size="20px" /> ¿Problemas para ingresar?</strong>
          <p>Comunícate con el administrador de tu centro de formación para recuperar tu acceso.</p>
        </div>
      </form>
    </section>

    <section class="escena">
      <GloboLogo />
      <p class="lema">SENA — Aprendizaje para la vida</p>
    </section>
  </main>
</template>