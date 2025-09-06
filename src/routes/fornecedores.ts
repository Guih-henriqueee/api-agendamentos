import { FastifyInstance } from "fastify";
import z, { array, string, ZodNull } from "zod";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import { Fornecedor } from '../schema/interfaces'
import { createDeflate } from "node:zlib";
import { create } from "node:domain";
import { GetAuth, validateToken } from '../auth/functionAuth'
import { appendFile } from "node:fs";

// Banco de dados simulado

const Fornecedores: Fornecedor[] = [];

export async function RouteFornecedores(app: FastifyInstance) {

    

    app.get(
        "/Fornecedores",
        {
            schema: {
                description: "List all Fornecedores",
                tags: ["Fornecedores"],
                response: {
                    200: z.array(
                        z.object({
                            id: z.string(),
                            name: z.string(),
                            cnpj: z.string(),
                            contact: z.string(),

                        }),
                    )
                }

            },
        },

        (request, reply) => Fornecedores

    );


    app.post(
        "/Fornecedores",
        {
            schema: {
                description: "Create a new Fornecedor",
                tags: ["Fornecedores"],
                body: z.object({
                    name: z.string().describe("Razão Social do Fornecedor"),
                    cnpj: z.string().regex(/^\d{14}$/).describe("CNPJ do Fornecedor"),
                    contact: z.string().regex(/^\d{9}$/).describe("Contato do Fornecedor"),
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        name: z.string(),
                        cnpj: z.string(),
                        contact: z.string(),
                    }),


                }
            },
        },

        (request, reply) => {
            const { name, cnpj, contact } = request.body as { name: string, cnpj: string, contact: string };

            const newFornecedor: Fornecedor = {
                id: randomUUID(),
                name,
                cnpj,
                contact,
                agendamentos: ""
            };
            Fornecedores.push(newFornecedor);




            return reply.status(201).send(newFornecedor);

        }
    );

    app.get(
        "/Fornecedores/:id",
        {
            schema: {
                description: "Get a Fornecedor by ID",
                tags: ["Fornecedores"],
                params: z.object({
                    id: z.string().describe("ID do Fornecedor"),
                }),
                response: {
                    200: z.object({
                        id: z.string(),
                        name: z.string(),
                        cnpj: z.string(),
                        contact: z.string(),
                    }),
                    404: z.object({
                        mensage: z.string()
                    })
                }
            },
        },
        (request, reply) => {
            const { id } = request.params as { id: string };
            const fornecedor = Fornecedores.find((f) => f.id === id);
            if (!fornecedor) {
                return reply.status(404).send({ message: "Fornecedor not found" });
            }
            return reply.status(200).send(fornecedor);
        }
    );


    app.put(
        "/Fornecedores/:id",
        {
            schema: {
                description: "Update a Fornecedor by ID",
                tags: ["Fornecedores"],
                params: z.object({
                    id: z.string().describe("ID do Fornecedor"),
                }),
                body: z.object({
                    name: z.string().describe("Nome do Fornecedor"),
                    cnpj: z.string().describe("CNPJ do Fornecedor"),
                    contact: z.string().describe("Contato do Fornecedor"),
                }),
                response: {
                    200: z.object({
                        id: z.string(),
                        name: z.string(),
                        cnpj: z.string(),
                        contact: z.string(),
                    }),
                    404: z.object({
                        mensage: z.string()
                    })
                }
            },
        },
        (request, reply) => {
            const { id } = request.params as { id: string };
            const { name, cnpj, contact } = request.body as { name: string; cnpj: string; contact: string };
            const fornecedor = Fornecedores.find((f) => f.id === id);
            if (!fornecedor) {
                return reply.status(404).send({ message: "Fornecedor not found" });
            }
            fornecedor.name = name;
            fornecedor.cnpj = cnpj;
            fornecedor.contact = contact;
            return reply.status(200).send(fornecedor);
        }
    );

    app.delete(
        "/fornecedores/:id",
        {
            schema: {
                description: "Delete a Fornecedor by ID",
                tags: ["Fornecedores"],
                params: z.object({
                    id: z.string().describe("ID do Fornecedor"),
                }),
                response: {
                    200: z.object({
                        message: z.string(),
                    }),
                    404: z.object({
                        mensage: z.string()
                    })
                }
            },
        },
        (request, reply) => {
            const { id } = request.params as { id: string };
            const index = Fornecedores.findIndex((f) => f.id === id);
            if (index === -1) {
                return reply.status(404).send({ message: "Fornecedor not found" });
            }
            Fornecedores.splice(index, 1);
            return reply.status(200).send({ message: "Fornecedor deleted" });
        }
    );
}