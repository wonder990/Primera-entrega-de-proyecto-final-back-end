//
const express = require("express");
const { Router } = express;
const Contenedor = require("./Contenedor.js");

//
const routerProductos = Router();
const routerCarrito = Router();
const app = express();
const productosBD = new Contenedor("productos.json");
const carritosBD = new Contenedor("carritos.json");
const isAdmin = true;
app.listen(process.env.PORT || 8080, () => console.log("SERVER ON"));
app.on("error", (error) => console.log(`Error en el servidor ${error}`));

//
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/productos", routerProductos);
app.use("/api/carrito", routerCarrito);

app.all("*", (req, res) => {
  res.json({
    error: -2,
    descripcion: `ruta '${req.url}' método '${req.method}' no implementado`,
  });
});

routerProductos.get("/", async (req, res) => {
  const productos = await productosBD.getAll();
  res.json(productos);
});

routerProductos.get("/:id", async (req, res) => {
  const { id } = req.params;
  const producto = await productosBD.getById(parseInt(id));
  res.json(producto);
});

routerProductos.post(
  "/",
  (req, res, next) => {
    if (!isAdmin) {
      res.send({
        error: -1,
        descripcion: "ruta '/api/productos' método 'post' no autorizado",
      });
    } else {
      next();
    }
  },
  async (req, res) => {
    const { body } = req;
    const { nombre, descripcion, codigo, foto, precio, stock } = body;
    const timestamp = Date.now();
    const productoNuevo = {
      timestamp,
      nombre,
      descripcion,
      codigo,
      foto,
      precio: parseFloat(precio),
      stock: parseInt(stock),
    };
    await productosBD.save(productoNuevo);
    res.json("success");
  }
);

routerProductos.put(
  "/:id",
  (req, res, next) => {
    if (!isAdmin) {
      res.send({
        error: -1,
        descripcion: "ruta '/api/productos' método 'put' no autorizado",
      });
    } else {
      next();
    }
  },
  async (req, res) => {
    const { id } = req.params;
    let { body } = req;
    const { precio, stock } = body;
    const timestamp = Date.now();
    body = {
      timestamp,
      ...body,
      precio: parseFloat(precio),
      stock: parseInt(stock),
    };
    const productoModificado = await productosBD.modifyProduct(
      parseInt(id),
      body
    );
    res.json("success");
  }
);

routerProductos.delete(
  "/:id",
  (req, res, next) => {
    if (!isAdmin) {
      res.send({
        error: -1,
        descripcion: "ruta '/api/productos' método 'delete' no autorizado",
      });
    } else {
      next();
    }
  },
  async (req, res) => {
    const { id } = req.params;
    await productosBD.deleteById(parseInt(id));
    res.json("success");
  }
);

routerCarrito.post("/", async (req, res) => {
  const timestamp = Date.now();
  const productos = [];
  const idAsignado = await carritosBD.save({ timestamp, productos });
  res.json({ idAsignado });
});

routerCarrito.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await carritosBD.deleteById(parseInt(id));
});

routerCarrito.get("/:id/productos", async (req, res) => {
  const { id } = req.params;
  const carrito = await carritosBD.getById(parseInt(id));
  const productosDelCarrito = carrito.productos;
  res.json(productosDelCarrito);
});

routerCarrito.post("/:id/productos", async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const productoAgregar = await productosBD.getById(parseInt(body.id));
  const carrito = await carritosBD.getById(parseInt(id));
  const productosEnCarrito = carrito.productos;
  productosEnCarrito.push(productoAgregar);
  await carritosBD.modifyProduct(parseInt(id), {
    productos: productosEnCarrito,
  });
});

routerCarrito.delete("/:id/productos/:id_prod", async (req, res) => {
  const { id, id_prod } = req.params;
  const carrito = await carritosBD.getById(parseInt(id));
  let productosCarrito = carrito.productos;
  const newArray = productosCarrito.filter((e) => e.id != parseInt(id_prod));
  await carritosBD.modifyProduct(parseInt(id), { productos: newArray });
});
