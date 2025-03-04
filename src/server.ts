import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {RouteAgendamentos, RouteUsers} from './routes';

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
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  
});

app.register(RouteAgendamentos);
app.register(RouteUsers);


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
