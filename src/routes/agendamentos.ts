import { FastifyInstance } from "fastify";
import z, { array, string, ZodNull } from "zod";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import { Agendamento } from '../schema/interfaces'
import { createDeflate } from "node:zlib";
import { create } from "node:domain";
import { GetAuth, validateToken } from '../auth/functionAuth'
import { appendFile } from "node:fs";

// Banco de dados simulado

const Agendamentos: Agendamento[] = [];




export async function RouteAgendamentos(app: FastifyInstance) {
    // 🔹 Rota para listar Agendamentos
    app.get(
        "/Agendamentos",
        {
            schema: {
                description: "List all Agendamentos",
                tags: ["Agendamentos"],
                response: {
                    200: z.array(
                        z.object({
                            id: z.string().uuid(),
                            name: z.string(),
                            price: z.number(),
                            description: z.string(),
                            quantity: z.number(),
                            status: z.string(),
                            createdAt: z.string(),
                            updatedAt: z.string(),
                        })
                    ),
                },
            },
        },
        (request, reply) => {
            return reply.status(200).send(Agendamentos);
        }
    );

    // 🔹 Rota para criar Agendamento
    // POST /Agendamentos
    app.post("/Agendamentos", {
        schema: {
            description: "Create a new Agendamento",
            tags: ["Agendamentos"],
            body: z.object({
                name: z.string().min(3),
                price: z.number().min(0),
                description: z.string().min(3),
                quantity: z.number().min(0),
                dataEntrega: z.date(),
                xml: z.string(),
                commits: z.string(),
                status: z.string(),
                userCreated: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                }),
                fornecedor: z.object({
                    id: z.string(),
                    name: z.string(),
                    contact: z.string(),
                }),
            }),
            response: {
                201: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    price: z.number(),
                    description: z.string(),
                    quantity: z.number(),
                    status: z.string(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                }),
                400: z.object({
                    message: z.string(),
                    error: z.string(),
                    statusCode: z.number(),
                }),
            },
        },
    }, (request, reply) => {
        const {
            name,
            price,
            description,
            quantity,
            dataEntrega,
            xml,
            commits,
            status,
            userCreated,
            fornecedor,
        } = request.body as Agendamento;

        const newAgendamento: Agendamento = {
            id: randomUUID(),
            name,
            description,
            price,
            quantity,
            dataEntrega,
            xml,
            commits,
            status,
            createdAt: new Date(), // Set createdAt during creation
            updatedAt: new Date(), // Set updatedAt during creation
            userCreated,
            userUpdated: userCreated,
            fornecedor,
            userId: userCreated.id,
            userName: userCreated.name,
            userEmail: userCreated.email,
        };

        Agendamentos.push(newAgendamento);

        return reply.status(201).send(newAgendamento);
    });

    // 🔹 Rota para atualizar Agendamento
    // PUT /Agendamentos/:id
    app.put("/Agendamentos/:id", {
        schema: {
            description: "Update an Agendamento",
            tags: ["Agendamentos"],
            params: z.object({ id: z.string().uuid("Invalid UUID format") }),
            body: z.object({
                name: z.string().min(3),
                price: z.number().min(0),
                description: z.string().min(3),
                quantity: z.number().min(0),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                    price: z.number(),
                    description: z.string(),
                }),
                400: z.object({
                    message: z.string(),
                    error: z.string(),
                    statusCode: z.number(),
                }),
                404: z.object({
                    message: z.string(),
                    error: z.string(),
                    statusCode: z.number(),
                }),
            },
        },
    }, (request, reply) => {
        const { id } = request.params as { id: string };
        const { name, price, description, quantity } = request.body as {
            name: string;
            price: number;
            description: string;
            quantity: number;
        };

        const agendamentoIndex = Agendamentos.findIndex((agendamento) => agendamento.id === id);
        if (agendamentoIndex === -1) {
            return reply.status(404).send({
                message: "Agendamento not found",
                error: "Not Found",
                statusCode: 404,
            });
        }

        Agendamentos[agendamentoIndex] = {
            ...Agendamentos[agendamentoIndex],
            name,
            price,
            description,
            quantity,
            updatedAt: new Date(), // Update the updatedAt timestamp
        };

        return reply.status(200).send(Agendamentos[agendamentoIndex]);
    });

    // 🔹 Rota para deletar Agendamento
    app.delete(
        "/Agendamentos/:id",
        {
            schema: {
                description: "Delete an Agendamento",
                tags: ["Agendamentos"],
                params: z.object({ id: z.string().uuid("Invalid UUID format") }),
                response: {
                    204: z.void().describe("Agendamento deleted successfully"),
                    404: z.object({
                        message: z.string(),
                        error: z.string(),
                        statusCode: z.number(),
                    }),
                },
            },
        },
        (request, reply) => {
            const { id } = request.params as { id: string };

            // Encontrar e remover Agendamento por ID
            const AgendamentoIndex = Agendamentos.findIndex((agendamento) => agendamento.id === id);
            if (AgendamentoIndex === -1) {
                return reply.status(404).send({
                    message: "Agendamento not found",
                    error: "Not Found",
                    statusCode: 404,
                });
            }

            // Remover o Agendamento
            Agendamentos.splice(AgendamentoIndex, 1);

            return reply.status(204).send();
        }
    );
}
