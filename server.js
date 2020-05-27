const fastify = require('fastify')({logger: true})
fastify.register(require('fastify-accepts'))
const fastifyCaching = require('fastify-caching')
fastify.register(
    fastifyCaching,
    {privacy: fastifyCaching.privacy.NOCACHE},
    (err) => {
      if (err) throw err
    }
)
const path = require('path')
fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
})
const Sqrl = require("squirrelly")
const {Pool} = require('pg')

const pool = new Pool({
    host: 'localhost',
    database: 'vraiufodb',
    user: 'javarome'
})
const uuidPattern = '[0-9a-fA-F]{8}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{12}';
fastify.get('/', async (req, res) => {
    const accept = req.accepts()
    const lang = accept.language(['fr', 'en'])
    const client = await pool.connect()
    try {
        const query = `SELECT id FROM ${lang}.ufo`
        console.log(query)
        const result = await client.query(query)
        const size = result.rows.length;
        const n = Math.floor(Math.random() * size)
        console.log(`picking row #${n} among ${size}`)
        const row = result.rows[n]
        res.redirect(`/${row.id}`)
    } finally {
        client.release()
    }
})
fastify.get(`/:id(${uuidPattern})`, async (req, res) => {
    const accept = req.accepts()
    const lang = accept.language(['fr', 'en'])
    const client = await pool.connect()
    try {
        const query = {
            name: 'fetch-ufo',
            text: `SELECT * FROM ${lang}.ufo WHERE id=$1`,
            values: [req.params.id],
        }
        console.log(query)
        const result = await client.query(query)
        const row = result.rows[0]
        let rendered = await Sqrl.renderFile(`index_${lang}.html`, row)
        res
            .code(200)
            .type('text/html; charset=utf-8')
            .send(rendered)
    } finally {
        client.release()
    }
})
fastify.get('/submit', async (req, res) => {
    res.redirect('/');
})

const listenPort = 8080;
const start = async () => {
    try {
        await fastify.listen(listenPort)
        fastify.log.info(`Listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()
