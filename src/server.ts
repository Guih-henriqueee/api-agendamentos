import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import routes from './routes';

const app = fastify().withTypeProvider<ZodTypeProvider>();


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);


app.register(fastifyCors, {
    origin: '*',
});

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Agendamentos API',
            description: 'Backend - Painel de Agendamentos',
            version: '0.0.1v beta',
            contact: {
                name: 'Guilherme Martins',
                url: 'https://github.com/guih-henriqueee',
                email: 'gmartinsdevelop@gmail.com',

            },


        },
        servers: [{ 
            url: 'http://sandbox:3000', 
            description: 'Sand Box' 
        }],
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    name: 'apiKey',
                    in: 'header',
                },
            },
        },
        security: [{ apiKey: [] }],

    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
});

app.register(routes);


app.get('/', () => {
    return { hello: 'world' };
});


app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
