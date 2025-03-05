import { FastifyInstance } from "fastify";
import z, { array, string, ZodNull } from "zod";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import { User, Agendamento, Fornecedor } from './schema/interfaces'
import { createDeflate } from "node:zlib";
import { create } from "node:domain";
import { GetAuth, validateToken } from './auth/functionAuth'
import { appendFile } from "node:fs";

// Banco de dados simulado
const users: User[] = [];
const Agendamentos: Agendamento[] = [];
const Fornecedores: Fornecedor[] = [];

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

