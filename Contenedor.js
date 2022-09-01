const fs = require("fs");

class Contenedor {
  constructor(name) {
    this.name = name;
  }

  // Recibe un objeto, lo guarda en el archivo, devuelve el id asignado
  async save(obj) {
    try {
      let productos = await fs.promises.readFile(this.name, "utf-8");
      productos = JSON.parse(productos);
      if (productos.length !== 0) {
        productos.sort((a, b) => {
          return b.id - a.id;
        });
        const idAsignado = productos[0].id + 1;
        productos.push({ id: idAsignado, ...obj });
        productos.sort((a, b) => {
          return a.id - b.id;
        });
        await fs.promises.writeFile(
          this.name,
          JSON.stringify(productos, null, 2)
        );
        return idAsignado;
      } else {
        productos.push({ id: 1, ...obj });
        await fs.promises.writeFile(
          this.name,
          JSON.stringify(productos, null, 2)
        );
        return 1;
      }
    } catch (error) {
      console.log("Algo salió mal!");
    }
  }
  async getById(id) {
    try {
      let productoCapturado;
      let productos = await fs.promises.readFile(this.name, "utf-8");
      productos = JSON.parse(productos);
      productos.forEach((prod) => {
        if (prod.id === id) {
          productoCapturado = prod;
        }
      });
      return productoCapturado || null;
    } catch (error) {
      console.log("Algo salió mal!");
    }
  }
  async getAll() {
    try {
      let productos = await fs.promises.readFile(this.name, "utf-8");
      productos = JSON.parse(productos);
      productos.sort((a, b) => {
        return a.id - b.id;
      });
      return productos;
    } catch (error) {
      console.log("Algo salió mal!");
      console.log(error);
    }
  }
  async deleteById(id) {
    try {
      let newProducts = [];
      let productos = await fs.promises.readFile(this.name, "utf-8");
      productos = JSON.parse(productos);
      productos.forEach((prod) => {
        if (prod.id !== id) {
          newProducts.push(prod);
        }
      });
      await fs.promises.writeFile(
        this.name,
        JSON.stringify(newProducts, null, 2)
      );
    } catch (error) {
      console.log("Algo salió mal!");
    }
  }
  async deleteAll() {
    await fs.promises.writeFile(this.name, "[]");
  }

  async getProductRandom() {
    try {
      let productos = await fs.promises.readFile(this.name, "utf-8");
      productos = JSON.parse(productos);
      const rand = Math.floor(Math.random() * productos.length);
      return productos[rand];
    } catch (error) {
      console.log("Algo salió mal!");
    }
  }

  async modifyProduct(id, reemplazo) {
    try {
      let productos = await fs.promises.readFile(this.name, "utf-8");
      productos = JSON.parse(productos);
      const productoAModificar = await this.getById(id);
      if (productoAModificar !== null) {
        await this.deleteById(id);
        productos = await fs.promises.readFile(this.name, "utf-8");
        productos = JSON.parse(productos);
        const newProduct = { ...productoAModificar, ...reemplazo };
        productos.push(newProduct);
        productos.sort((a, b) => a.id - b.id);
        await fs.promises.writeFile(
          this.name,
          JSON.stringify(productos, null, 2)
        );
        return newProduct;
      }
      return null;
    } catch (error) {
      console.log("Algo salió mal!");
    }
  }
}

module.exports = Contenedor;
