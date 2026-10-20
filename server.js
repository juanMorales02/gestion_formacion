import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import dbConnection from "./database.js";
import { validateJWT } from "./middlewares/validateJWT.js";
import { routerUsuario } from "./routes/usuarios.routes.js";
import { routerCurso } from "./routes/cursos.routes.js";
import { routerAprendiz } from "./routes/aprendices.routes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Representa el servidor de la aplicacion.
 * @class
 */
class Server {
  /**
   * @constructor
   */
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4500;
    this.middlewares();
    this.routes();
    this.conexionBd();
  }

  /**
   * Middlewares globales (se ejecutan en TODAS las peticiones).
   */
  middlewares() {
    this.app.use(express.json()); // permite leer req.body en formato JSON
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors()); // permite que el frontend (otro puerto) consuma la API
    this.app.use(morgan("dev")); // muestra en consola cada peticion que llega

  }

  /**
   * Registra las rutas de la aplicacion.
   * Cada modelo tiene su propio router montado bajo /api/<recurso>
   *
   * Aqui se ve de un vistazo QUE ESTA PROTEGIDO: el middleware validateJWT se
   * pone entre la URL y el router. Todo lo que pase por ahi necesita mandar la
   * cabecera x-token; si no, corta con un 401 y el controlador ni se entera.
   */
  routes() {
    // Publico: es por donde se consigue el token.
    this.app.use("/api/usuarios", routerUsuario);

    // Privado: requieren token.
    this.app.use("/api/cursos", validateJWT, routerCurso);
    this.app.use("/api/aprendices", validateJWT, routerAprendiz);

    // Frontend compilado (carpeta public/ = el dist de Vite). Va DESPUES de las
    // rutas /api para que nunca las tape; el router del front usa hash (#/login),
    // asi que no hace falta una ruta comodin que devuelva index.html.
    this.app.use(express.static(path.join(__dirname, "public")));

    // Ruta de cortesia para comprobar rapido que el servidor responde.
    // El nombre "/life" es un identificador y no se traduce; el mensaje si.
    this.app.use("/life", (req, res) => {
      res.send("El servidor esta funcionando");
    });

    // Una ruta de API (/api/...) que no coincide con las de arriba cae aqui y
    // responde 404 en JSON. Este msg lo muestra el frontend tal cual en un
    // Notify, por eso va en español igual que los demas mensajes del backend.
    this.app.use("/api/*", (req, res) => {
      res.status(404).json({ msg: "La ruta solicitada no existe" });
    });

    // Cualquier otra ruta tampoco existe: no coincide ni con la API ni con un
    // archivo de public/.
    this.app.use((req, res) => {
      res.status(404).json({ msg: "La ruta solicitada no existe" });
    });
  }

  /**
   * Conecta a la base de datos.
   */
  async conexionBd() {
    await dbConnection();
  }

  /**
   * Inicia el servidor.
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor en http://localhost:${this.port}`);
    });
  }
}

export default Server;
