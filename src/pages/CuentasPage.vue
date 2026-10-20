<script setup>
import { ref, computed, onMounted } from 'vue'
import { usuariosService as svc } from '@/services'
import { ok, fail, validar, emailOk } from '@/helpers/alerts'

const items = ref([])
const q = ref('')
const dlg = ref(false)
const cargando = ref(false)
const guardando = ref(false)
const vacio = () => ({ nombre: '', email: '', password: '' })
const f = ref(vacio())

const cargar = async () => {
  cargando.value = true
  try { items.value = (await svc.listar()).data } catch (e) { fail(e) } finally { cargando.value = false }
}
const lista = computed(() => items.value.filter((u) => `${u.nombre} ${u.email}`.toLowerCase().includes(q.value.toLowerCase())))
const activos = computed(() => items.value.filter((u) => u.status === 0).length)
const fecha = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const abrir = () => { f.value = vacio(); dlg.value = true }
const crear = async () => {
  if (!validar([[!f.value.nombre.trim(), 'El nombre es obligatorio'], [!emailOk(f.value.email), 'Escribe un correo válido'], [f.value.password.length < 6, 'La contraseña debe tener al menos 6 caracteres']])) return
  guardando.value = true
  try {
    const { data } = await svc.crear(f.value)
    dlg.value = false
    ok(data.msg)
    cargar()
  } catch (e) { fail(e) } finally { guardando.value = false }
}
onMounted(cargar)
</script>

<template>
  <q-page class="pagina">
    <aside class="control">
      <h1>Cuentas</h1>
      <div class="cifras">
        <div><b>{{ activos }}</b><span>activas</span></div>
        <div class="x"><b>{{ items.length - activos }}</b><span>inactivas</span></div>
        <div class="t"><b>{{ items.length }}</b><span>en total</span></div>
      </div>
      <q-input v-model="q" outlined dense label="Buscar nombre o correo" class="campo"><template #prepend><q-icon name="search" /></template></q-input>
      <q-btn unelevated no-caps icon="person_add" label="Nueva cuenta" class="boton" @click="abrir" />
      <p class="nota">Cada persona que administre la plataforma necesita su propia cuenta.</p>
    </aside>

    <section class="lista">
      <q-inner-loading :showing="cargando" />
      <div v-if="lista.length" class="fila cabecera cue"><span /><span>Nombre</span><span>Correo</span><span>Rol</span><span>Estado</span><span>Creada</span></div>
      <p v-if="!cargando && !lista.length" class="vacio">No hay cuentas con esa búsqueda.</p>
      <article v-for="u in lista" :key="u._id" class="fila cue" :class="u.status === 0 ? 'on' : 'off'">
        <span class="ava">{{ (u.nombre || '?')[0] }}</span>
        <strong class="nom">{{ u.nombre }}</strong>
        <span class="dato">{{ u.email }}</span>
        <span class="dato curso">{{ u.rol }}</span>
        <span class="estado">{{ u.status === 0 ? 'Activa' : 'Inactiva' }}</span>
        <span class="dato">{{ fecha(u.createdAt) }}</span>
      </article>
    </section>

    <q-dialog v-model="dlg">
      <q-card class="modal">
        <h2>Nueva cuenta</h2>
        <q-input v-model="f.nombre" outlined label="Nombre" class="campo" />
        <q-input v-model="f.email" outlined type="email" label="Correo de acceso" class="campo" />
        <q-input v-model="f.password" outlined type="password" label="Contraseña (mínimo 6 caracteres)" class="campo" />
        <div class="acciones"><q-btn flat no-caps label="Cancelar" v-close-popup /><q-btn unelevated no-caps label="Crear cuenta" class="boton" :loading="guardando" @click="crear" /></div>
      </q-card>
    </q-dialog>
  </q-page>
</template>
