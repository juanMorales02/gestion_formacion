<script setup>
import { ref, computed, onMounted } from 'vue'
import { aprendicesService as svc, cursosService } from '@/services'
import { ok, fail, confirmar, validar, emailOk } from '@/helpers/alerts'

const items = ref([])
const cursos = ref([])
const q = ref('')
const filtro = ref(-1)
const dlg = ref(false)
const editId = ref(null)
const cargando = ref(false)
const vacio = () => ({ documento: '', nombre: '', email: '', curso: '' })
const form = ref(vacio())

const cargar = async () => {
  cargando.value = true
  try {
    items.value = (await svc.listar()).data
    cursos.value = (await cursosService.listar({ status: 0 })).data // el backend solo acepta cursos activos
  } catch (e) { fail(e) } finally { cargando.value = false }
}
const lista = computed(() => items.value.filter((a) => (filtro.value < 0 || a.status === filtro.value) && `${a.documento} ${a.nombre} ${a.email} ${a.curso?.nombre || ''}`.toLowerCase().includes(q.value.toLowerCase())))
const activos = computed(() => items.value.filter((a) => a.status === 0).length)

const abrir = (a) => {
  editId.value = a?._id || null
  form.value = a ? { documento: a.documento, nombre: a.nombre, email: a.email, curso: a.curso?._id || '' } : vacio()
  dlg.value = true
}
const guardar = async () => {
  const f = form.value
  if (!validar([[!`${f.documento}`.trim(), 'El documento es obligatorio'], [!f.nombre.trim(), 'El nombre es obligatorio'], [!emailOk(f.email), 'Escribe un correo válido'], [!f.curso, 'Elige un curso']])) return
  try {
    const { data } = editId.value ? await svc.actualizar(editId.value, f) : await svc.crear(f)
    dlg.value = false
    ok(data.msg)
    cargar()
  } catch (e) { fail(e) }
}
const alternar = async (a) => {
  const apagar = a.status === 0
  if (!(await confirmar(`¿${apagar ? 'Desactivar' : 'Activar'} al aprendiz?`, a.nombre))) return
  try {
    const { data } = await (apagar ? svc.desactivar(a._id) : svc.activar(a._id))
    ok(data.msg)
    cargar()
  } catch (e) { fail(e) }
}
onMounted(cargar)
</script>

<template>
  <q-page class="pagina">
    <aside class="control">
      <h1>Aprendices</h1>
      <div class="cifras"><div><b>{{ activos }}</b><span>activos</span></div><div class="x"><b>{{ items.length - activos }}</b><span>inactivos</span></div><div class="t"><b>{{ items.length }}</b><span>en total</span></div></div>
      <q-input v-model="q" outlined dense label="Buscar nombre, documento o curso" class="campo"><template #prepend><q-icon name="search" /></template></q-input>
      <q-btn-toggle v-model="filtro" unelevated no-caps spread class="segmento" :options="[{ label: 'Todos', value: -1 }, { label: 'Activos', value: 0 }, { label: 'Inactivos', value: 1 }]" />
      <q-btn unelevated no-caps icon="person_add" label="Nuevo aprendiz" class="boton" @click="abrir()" />
    </aside>

    <section class="lista">
      <q-inner-loading :showing="cargando" />
      <div v-if="lista.length" class="fila cabecera apr"><span /><span>Aprendiz</span><span>Documento</span><span>Correo</span><span>Curso</span><span>Estado</span><span /></div>
      <p v-if="!cargando && !lista.length" class="vacio">No hay aprendices con ese filtro. Registra uno nuevo o limpia la búsqueda.</p>
      <article v-for="a in lista" :key="a._id" class="fila apr" :class="a.status === 0 ? 'on' : 'off'">
        <span class="ava">{{ (a.nombre || '?')[0] }}</span>
        <strong class="nom">{{ a.nombre }}</strong>
        <span class="dato">{{ a.documento }}</span>
        <span class="dato">{{ a.email }}</span>
        <span class="dato curso">{{ a.curso?.nombre || 'Sin curso' }}</span>
        <span class="estado">{{ a.status === 0 ? 'Activo' : 'Inactivo' }}</span>
        <span class="acc">
          <q-btn flat round dense icon="edit" @click="abrir(a)"><q-tooltip>Editar</q-tooltip></q-btn>
          <q-btn flat round dense :icon="a.status === 0 ? 'toggle_on' : 'toggle_off'" @click="alternar(a)"><q-tooltip>{{ a.status === 0 ? 'Desactivar' : 'Activar' }}</q-tooltip></q-btn>
        </span>
      </article>
    </section>

    <q-dialog v-model="dlg">
      <q-card class="modal">
        <h2>{{ editId ? 'Editar aprendiz' : 'Nuevo aprendiz' }}</h2>
        <q-input v-model="form.documento" outlined label="Documento" class="campo" />
        <q-input v-model="form.nombre" outlined label="Nombre completo" class="campo" />
        <q-input v-model="form.email" outlined type="email" label="Correo" class="campo" />
        <q-select v-model="form.curso" outlined emit-value map-options :options="cursos" option-value="_id" option-label="nombre" label="Curso" class="campo" />
        <div class="acciones"><q-btn flat no-caps label="Cancelar" v-close-popup /><q-btn unelevated no-caps label="Guardar aprendiz" class="boton" @click="guardar" /></div>
      </q-card>
    </q-dialog>
  </q-page>
</template>
