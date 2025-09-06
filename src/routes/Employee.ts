import { FastifyInstance } from "fastify";
import z, { array, string, ZodNull } from "zod";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import { Employee } from '../schema/interfaces'
import { createDeflate } from "node:zlib";
import { create } from "node:domain";
import { GetAuth, validateToken } from '../auth/functionAuth'
import { appendFile } from "node:fs";
import { toJSONSchema } from "zod/v4";

// Banco de dados simulado


const Employee: Employee[] = [];



export async function RouteEmployee(app: FastifyInstance) {
    app.post(
        "/Employee",
        {
            schema: {
                description: "Create a new Employee",
                tags: ["Employee"],
                body: z.object({
                    name: z.string().describe("Nome do empregado"),
                    document: z.string().regex(/^\d{11}$/).describe("Insira o CPF do empregado"),
                    salary: z.number().describe("salario do empregado"),
                    manager: z.string().describe("Insira o CPF do empregado"),
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        name: z.string(),
                        document: z.string()
                        
                        }),

                    
                }
                },
            },
        
        (request, reply) => {
            const { name, document, salary, manager } = request.body as { name: string, document: string, salary: number, manager: string };
            
            const newEmployee: Employee = {
                id: randomUUID(),
                name,
                document,
                salary,
                manager

            };
            Employee.push(newEmployee);
            
            
            
            
            return reply.status(201).send(newEmployee);

        }
    );
}
