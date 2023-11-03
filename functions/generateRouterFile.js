import path from "path";
import { writeFileSync } from "fs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateRouterFile(apiFolderPath) {
  const routerContent = `
    import express from "express";
    import { PrismaClient } from "@prisma/client"; // Import PrismaClient
    
    const router = express.Router();
    const prisma = new PrismaClient(); // Create a PrismaClient instance
    
    // GET route to list companies
    router.get("/companies", async (req, res) => {
      try {
        const companies = await prisma.company.findMany();
        res.status(200).json(companies);
      } catch (error) {
        res.status(500).json({ error: "Error listing companies" });
      }
    });
    
    // POST route to create a new company
    router.post("/companies", async (req, res) => {
      try {
        const { name } = req.body;
        const company = await prisma.company.create({
          data: {
            name,
          },
        });
        res.status(201).json(company);
      } catch (error) {
        res.status(500).json({ error: "Error creating company" });
      }
    });
    
    // PUT route to update a company
    router.put("/companies/:id", async (req, res) => {
      const { id } = req.params;
      const { name } = req.body;
      try {
        const company = await prisma.company.update({
          where: { id: parseInt(id) },
          data: {
            name,
          },
        });
        res.status(200).json(company);
      } catch (error) {
        res.status(500).json({ error: "Error updating company" });
      }
    });
    
    // DELETE route to delete a company
    router.delete("/companies/:id", async (req, res) => {
      const { id } = req.params;
      try {
        await prisma.company.delete({
          where: { id: parseInt(id) },
        });
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Error deleting company" });
      }
    });
    
    // GET route to list professionals
    router.get("/professionals", async (req, res) => {
      try {
        const professionals = await prisma.professional.findMany();
        res.status(200).json(professionals);
      } catch (error) {
        res.status(500).json({ error: "Error listing professionals" });
      }
    });
    
    // POST route to create a new professional
    router.post("/professionals", async (req, res) => {
      try {
        const { name, companyId } = req.body;
        const professional = await prisma.professional.create({
          data: {
            name,
            companyId,
          },
        });
        res.status(201).json(professional);
      } catch (error) {
        res.status(500).json({ error: "Error creating professional" });
      }
    });
    
    // PUT route to update a professional
    router.put("/professionals/:id", async (req, res) => {
      const { id } = req.params;
      const { name, companyId } = req.body;
      try {
        const professional = await prisma.professional.update({
          where: { id: parseInt(id) },
          data: {
            name,
            companyId,
          },
        });
        res.status(200).json(professional);
      } catch (error) {
        res.status(500).json({ error: "Error updating professional" });
      }
    });
    
    // DELETE route to delete a professional
    router.delete("/professionals/:id", async (req, res) => {
      const { id } = req.params;
      try {
        await prisma.professional.delete({
          where: { id: parseInt(id) },
        });
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Error deleting professional" });
      }
    });
    
    // GET route to list products
    router.get("/products", async (req, res) => {
      try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ error: "Error listing products" });
      }
    });
    
    // POST route to create a new product
    router.post("/products", async (req, res) => {
      try {
        const { name, professionalId } = req.body;
        const product = await prisma.product.create({
          data: {
            name,
            professionalId,
          },
        });
        res.status(201).json(product);
      } catch (error) {
        res.status(500).json({ error: "Error creating product" });
      }
    });
    
    // PUT route to update a product
    router.put("/products/:id", async (req, res) => {
      const { id } = req.params;
      const { name, professionalId } = req.body;
      try {
        const product = await prisma.product.update({
          where: { id: parseInt(id) },
          data: {
            name,
            professionalId,
          },
        });
        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ error: "Error updating product" });
      }
    });
    
    // DELETE route to delete a product
    router.delete("/products/:id", async (req, res) => {
      const { id } = req.params;
      try {
        await prisma.product.delete({
          where: { id: parseInt(id) },
        });
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Error deleting product" });
      }
    });
    
    // Hello World route
    router.get("/", (req, res) => {
      res.send("Hello, World!");
    });
    
    export default router;
  `;

  const routerFilePath = path.join(apiFolderPath, "router.ts");
  writeFileSync(routerFilePath, routerContent);
  console.log(`${GREEN}Generated router.ts file.${RESET}`);
}
