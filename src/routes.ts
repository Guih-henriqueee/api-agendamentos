import { FastifyInstance } from "fastify";
import z from "zod";
import { randomUUID } from "node:crypto";


interface User {
    id: string;
    name: string;
    email: string;
}


const users: User[] = [];

export default function routes(app: FastifyInstance) {

       app.get("/users", {
        schema: {
            description: "Get all users",
            tags: ["Users"],
            response: {
                200: z.array(
                    z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string().email(),
                    })
                ),
            },
        },
    }, async (request, reply) => {
        return users;   });

       app.post("/users", {
        schema: {
            description: "Create a new user",
            tags: ["Users"],
            body: z.object({
                name: z.string(),
                email: z.string().email(),
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string().email(),
                }),
            },
        },
    }, (request, reply) => {
           const { name, email } = request.body as { name: string; email: string };

           const newUser: User = {
            id: randomUUID(),
            name,
            email,
        };

           users.push(newUser);

           return reply.status(201).send(newUser);
    });
}
