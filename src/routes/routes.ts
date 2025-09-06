import { FastifyInstance } from "fastify";
import z, { array, string, ZodNull } from "zod";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import { Employes } from '../schema/interfaces'
import { createDeflate } from "node:zlib";
import { create } from "node:domain";
import { GetAuth, validateToken } from '../auth/functionAuth'
import { appendFile } from "node:fs";
import { toJSONSchema } from "zod/v4";

// Banco de dados simulado


const Employes: Employes[] = [];



export async function RouteEmployes(app: FastifyInstance) {
    app.post(
        "/Employes",
        {
            schema: {
                description: "Create a new Employes",
                tags: ["Employes"],
                body: z.object({
                    name: z.string().describe("Nome do empregado"),
                    document: z.string().regex(/^\d{11}$/).describe("Insira o CPF do empregado"),
                    salary: z.number().describe("salario do empregado"),
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
            const { name, document, salary } = request.body as { name: string, document: string, salary: number };
            
            const newEmployes: Employes = {
                id: randomUUID(),
                name,
                document,
                salary,

            };
            Employes.push(newEmployes);
            
            
            
            
            return reply.status(201).send(newEmployes);

        }
    );
}
