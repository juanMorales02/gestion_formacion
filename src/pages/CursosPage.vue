<script setup>
import { ref, computed, onMounted } from 'vue'
import { cursosService as svc } from '@/services'
import { ok, fail, confirmar, validar } from '@/helpers/alerts'

const items = ref([])
const q = ref('')
const filtro = ref(-1)
const dlg = ref(false)
const editId = ref(null)
const cargando = ref(false)
const vacio = () => ({ codigo: '', nombre: '', duracion: '' })
const form = ref(vacio())

const cargar = async () => {
  cargando.value = true
  try { items.value = (await svc.listar()).data } catch (e) { fail(e) } finally { cargando.value = false }
}
const lista = computed(() => items.value.filter((c) => (filtro.value < 0 || c.status === filtro.value) && `${c.codigo} ${c.nombre}`.toLowerCase().includes(q.value.toLowerCase())))
const activos = computed(() => items.value.filter((c) => c.status === 0).length)

const abrir = (c) => {
  editId.value = c?._id || null
  form.value = c ? { codigo: c.codigo, nombre: c.nombre, duracion: c.duracion } : vacio()
  dlg.value = true
}
const guardar = async () => {
  const f = form.value
  if (!validar([[!`${f.codigo}`.trim(), 'El código es obligatorio'], [!`${f.nombre}`.trim(), 'El nombre es obligatorio'], [!(Number.isInteger(Number(f.duracion)) && Number(f.duracion) >= 1), 'La duración debe ser un número entero de horas mayor a 0']])) return
  try {
    const { data } = editId.value ? await svc.actualizar(editId.value, f) : await svc.crear(f)
    dlg.value = false
    ok(data.msg)
    cargar()
  } catch (e) { fail(e) }
}
const alternar = async (c) => {
  const apagar = c.status === 0
  if (!(await confirmar(`¿${apagar ? 'Desactivar' : 'Activar'} el curso?`, c.nombre))) return
  try {
    const { data } = await (apagar ? svc.desactivar(c._id) : svc.activar(c._id))
    ok(data.msg)
    cargar()
  } catch (e) { fail(e) }
}
onMounted(cargar)
</script>

<template>
  <q-page class="pagina">
    <aside class="control">
      <h1>Cursos</h1>
      <div class="cifras"><div><b>{{ activos }}</b><span>activos</span></div><div class="x"><b>{{ items.length - activos }}</b><span>inactivos</span></div><div class="t"><b>{{ items.length }}</b><span>en total</span></div></div>
      <q-input v-model="q" outlined dense label="Buscar por código o nombre" class="campo"><template #prepend><q-icon name="search" /></template></q-input>
      <q-btn-toggle v-model="filtro" unelevated no-caps spread class="segmento" :options="[{ label: 'Todos', value: -1 }, { label: 'Activos', value: 0 }, { label: 'Inactivos', value: 1 }]" />
      <q-btn unelevated no-caps icon="add" label="Nuevo curso" class="boton" @click="abrir()" />
    </aside>

    <section class="lista">
      <q-inner-loading :showing="cargando" />
      <div v-if="lista.length" class="fila cabecera cur"><span /><span>Curso</span><span>Código</span><span>Duración</span><span>Estado</span><span /></div>
      <p v-if="!cargando && !lista.length" class="vacio">No hay cursos con ese filtro. Crea uno nuevo o limpia la búsqueda.</p>
      <article v-for="c in lista" :key="c._id" class="fila cur" :class="c.status === 0 ? 'on' : 'off'">
        <span class="ava"><q-icon name="auto_stories" size="24px" /></span>
        <strong class="nom">{{ c.nombre }}</strong>
        <span class="dato">{{ c.codigo }}</span>
        <span class="dato">{{ c.duracion }} horas</span>
        <span class="estado">{{ c.status === 0 ? 'Activo' : 'Inactivo' }}</span>
        <span class="acc">
          <q-btn flat round dense icon="edit" @click="abrir(c)"><q-tooltip>Editar</q-tooltip></q-btn>
          <q-btn flat round dense :icon="c.status === 0 ? 'toggle_on' : 'toggle_off'" @click="alternar(c)"><q-tooltip>{{ c.status === 0 ? 'Desactivar' : 'Activar' }}</q-tooltip></q-btn>
        </span>
      </article>
    </section>

    <q-dialog v-model="dlg">
      <q-card class="modal">
        <h2>{{ editId ? 'Editar curso' : 'Nuevo curso' }}</h2>
        <q-input v-model="form.codigo" outlined label="Código" class="campo" />
        <q-input v-model="form.nombre" outlined label="Nombre" class="campo" />
        <q-input v-model="form.duracion" outlined type="number" min="1" label="Duración en horas" class="campo" />
        <div class="acciones"><q-btn flat no-caps label="Cancelar" v-close-popup /><q-btn unelevated no-caps label="Guardar curso" class="boton" @click="guardar" /></div>
      </q-card>
    </q-dialog>
  </q-page>
</template>
