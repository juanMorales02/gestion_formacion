import api from './api'

// Cada método es un espejo de una fila de la tabla de endpoints del backend.
const crud = (base) => ({
  listar: (params) => api.get(base, { params }),
  crear: (d) => api.post(`${base}/register`, d),
  actualizar: (id, d) => api.put(`${base}/update/${id}`, d),
  activar: (id) => api.put(`${base}/active/${id}`),
  desactivar: (id) => api.put(`${base}/inactive/${id}`),
})

export const cursosService = crud('/cursos')
export const aprendicesService = crud('/aprendices')
export const usuariosService = {
  listar: () => api.get('/usuarios'),
  login: (d) => api.post('/usuarios/login', d),
  crear: (d) => api.post('/usuarios/register', d),
}
