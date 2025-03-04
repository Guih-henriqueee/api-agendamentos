import { FastifyInstance } from "fastify";
import z from "zod";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import { User, Agendamento } from './schema/interfaces'
import { createDeflate } from "node:zlib";
import { create } from "node:domain";

// Banco de dados simulado
const users: User[] = [];
const Agendamentos: Agendamento[] = [];

export async function RouteUsers(app: FastifyInstance) {


    // Registrar multipart (antes das rotas)
    await app.register(fastifyMultipart);

    // 🔹 Rota para obter usuários
    app.get(
        "/users",
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

    // 🔹 Rota para criar usuário
    app.post("/users", {
        schema: {
          description: "Create a new user",
          tags: ["Users"],
          body: z.object({
            name: z.string().min(3, "Name must be at least 3 characters long"),
            email: z.string().email("Invalid email format"),
            password: z.string().min(6, "Password must be at least 6 characters long")
          }),
          response: {
            201: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
            400: z.object({
              message: z.string(),
              error: z.string(),
              statusCode: z.number(),
            }),
          },
        },
      }, (request, reply) => {
        const { name, email, password } = request.body as { name: string; email: string; password: string };
        
        const newUser: User = {
          id: randomUUID(),
          name,
          email,
          password,
          createdAt: new Date(), // Correctly set during creation
          updatedAt: new Date(), // Initially same as createdAt
        };
      
        users.push(newUser);
        return reply.status(201).send(newUser);
      });



    // 🔹 Rota para atualizar usuário
    // PUT /users/:id
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
  
    users[userIndex] = { id, name, email, password, createdAt: users[userIndex].createdAt, updatedAt };
  
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
