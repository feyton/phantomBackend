import dotenv from 'dotenv'

dotenv.config()
const serverUrl = process.env.SERVER_URL || 'http://127.0.0.1:3000'
const serverName = process.env.SERVER_NAME || 'LOCAL HOST'

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Phantom backend docs',
            version: '1.0.0',
            description: 'The Documentation for the phantom project',
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC',
            },
            contact: {
                name: 'Fabrice Hafashimana',
            },
        },
        servers: [
            {
                url: serverUrl,
                description: serverName,
            },
        ],
    },
    apis: ['src/**/*.js'],
}

export const optionsToCustomizeSwagger = {
    customCssUrl: '/swagger.css',
    customSiteTitle: 'PHANTOM DOCS',
    customfavIcon:
        'https://feyton.github.io/atpl_capstone_fabrice/assets/favicon.png',
}
