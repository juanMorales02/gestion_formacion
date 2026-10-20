// Toda la retroalimentación y validación del frontend pasa por SweetAlert2.
import Swal from 'sweetalert2'

const base = Swal.mixin({ confirmButtonColor: '#39a900', cancelButtonColor: '#5b6b78' })
const toast = Swal.mixin({ toast: true, position: 'top-end', timer: 2600, showConfirmButton: false, timerProgressBar: true })
const lista = (a) => `<ul class="swal-lista">${a.map((m) => `<li>${m}</li>`).join('')}</ul>`

export const info = (title, texto = '') => base.fire({ icon: 'info', title, text: texto, confirmButtonText: 'Entendido' })

export const ok = (title) => toast.fire({ icon: 'success', title })

// Muestra el msg y la lista errors[] que devuelve el backend, o falla de conexión.
export const fail = (e) => {
  const d = e?.response?.data
  base.fire({ icon: 'error', title: d?.msg || 'No hay conexión con el servidor', html: d?.errors?.length ? lista(d.errors) : undefined })
}

// reglas: [[condicionDeError, 'mensaje'], ...]. Devuelve true si todo está bien.
export const validar = (reglas) => {
  const errs = reglas.filter(([malo]) => malo).map(([, m]) => m)
  if (errs.length) base.fire({ icon: 'warning', title: 'Revisa estos datos', html: lista(errs) })
  return !errs.length
}

export const confirmar = async (title, texto = '') =>
  (await base.fire({ icon: 'question', title, text: texto, showCancelButton: true, confirmButtonText: 'Sí, continuar', cancelButtonText: 'Cancelar' })).isConfirmed

export const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
