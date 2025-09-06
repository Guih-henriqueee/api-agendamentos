import { FastifyInstance } from "fastify";
import z, { array, string, ZodNull } from "zod";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import { User } from '../schema/interfaces'
import { createDeflate } from "node:zlib";
import { create } from "node:domain";
import { GetAuth, validateToken } from '../auth/functionAuth'
import { appendFile } from "node:fs";

// Banco de dados simulado
const users: User[] = [];

export async function RouteUsers(app: FastifyInstance) {


    // Registrar multipart (antes das rotas)
    await app.register(fastifyMultipart);

    // 🔹 Rota para obter usuários
    app.get(
        "/Users",
        {
            schema: {
                description: "Get all users",
                tags: ["Users"],
                response: {
                    200: z.array(
                        z.object({
                            id: z.string(),
                            name: z.string(),
                            email: z.string(),
                        })
                    ),
                },
            },
        },
        async () => users
    );
    //  Rota para criar usuário

    app.post("/Users", {
        schema: {
            description: "Create a new user",
            tags: ["Users"],
            body: z.object({
                name: z.string().min(3, "Name must be at least 3 characters long").describe("Nome do usuário"),
                email: z.string().email("Invalid email format").describe("Email do usuário"),
                password: z.string().min(6, "Password must be at least 6 characters long").describe("Senha do usuário"),
                cpf: z.string().regex(/^\d{11}&/, "CPF must be at least 11 characters long").describe("CPF do usuário"),
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    token: z.string(),
                }),
                400: z.object({
                    message: z.string(),
                    error: z.string(),
                    statusCode: z.number(),
                }),
            },
        },
    }, (request, reply) => {
        const { name, email, password, cpf } = request.body as { name: string; email: string; password: string; cpf: string };

        // Verifica se o CPF já existe
        const cpfExists = users.find((user) => user.cpf === cpf);
        if (cpfExists) {
            return reply.status(400).send({ message: "CPF already exists" });
        }

        // Verifica se o email já existe
        const emailExists = users.find((user) => user.email === email);
        if (emailExists) {
            return reply.status(400).send({ message: "Email already exists" });
        }

        // Gerando o token para o usuário
        const userToken = GetAuth(email, randomUUID(), cpf);

        // Criando o novo usuário
        const newUser: User = {
            id: randomUUID(),
            name,
            email,
            cpf,
            password,
            token: userToken,
            createdAt: new Date(), // Correctly set during creation
            updatedAt: new Date(), // Initially same as createdAt
        };

        // Adicionando o usuário ao banco (aqui é uma simulação)
        users.push(newUser);

        // Retorna o novo usuário com o token gerado
        return reply.status(201).send(newUser);
    });


    //  Rota para atualizar usuário
    app.put("/users/:id", {
        schema: {
            description: "Update a user",
            tags: ["Users"],
            params: z.object({ id: z.string().uuid("Invalid UUID format") }),
            body: z.object({
                name: z.string().min(3, "Name must be at least 3 characters long"),
                email: z.string().email("Invalid email format"),
                password: z.string().min(6, "Password must be at least 6 characters long"),
                updatedAt: z.date().default(new Date()), // updatedAt should be updated on each modification
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
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
        const { name, email, password, updatedAt } = request.body as { name: string; email: string; password: string; updatedAt: Date };

        const userIndex = users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            return reply.status(404).send({
                message: "User not found",
                error: "Not Found",
                statusCode: 404,
            });
        }

        const nameOrEmailExists = users.some((user) => (user.name === name || user.email === email) && user.id !== id);
        if (nameOrEmailExists) {
            return reply.status(400).send({
                message: "Name or email already exists",
                error: "Bad Request",
                statusCode: 400,
            });
        }

        users[userIndex] = { id, name, email, password, cpf: users[userIndex].cpf , createdAt: users[userIndex].createdAt, updatedAt, token: users[userIndex].token };

        return reply.status(200).send({ id, name, email });
    });


    // 🔹 Rota para deletar usuário
    app.delete(
        "/users/:id",
        {
            schema: {
                description: "Delete a user",
                tags: ["Users"],
                params: z.object({
                    id: z.string().uuid("Invalid UUID format"),
                }),
                response: {
                    204: z.void().describe("User deleted successfully"),
                    404: z
                        .object({
                            message: z.string(),
                            error: z.string(),
                            statusCode: z.number(),
                        })
                        .describe("User not found"),
                },
            },
        },
        (request, reply) => {
            const { id } = request.params as { id: string };

            // Encontrar e remover usuário por ID
            const userIndex = users.findIndex((user) => user.id === id);
            if (userIndex === -1) {
                return reply.status(404).send({
                    message: "User not found",
                    error: "Not Found",
                    statusCode: 404,
                });
            }

            // Remover o usuário
            users.splice(userIndex, 1);

            return reply.status(204).send();
        }
    );
};