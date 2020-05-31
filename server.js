import {API} from "./api/API.mjs";

import Fastify from 'fastify'
import fastifyAccepts from 'fastify-accepts'
import fastifyCaching from 'fastify-caching'
import path, {dirname} from 'path'
import {fileURLToPath} from 'url';

import fastifyStatic from 'fastify-static';
import Sqrl from "squirrelly"

const fastify = Fastify({logger: true})

fastify.register(fastifyAccepts)
fastify.register(
    fastifyCaching,
    {privacy: fastifyCaching.privacy.NOCACHE},
    (err) => {
      if (err) throw err
    }
)
fastify.register(fastifyStatic, {
  root: path.join(dirname(fileURLToPath(import.meta.url)), 'public'),
  prefix: '/public/', // optional: default '/'
})
const uuidPattern = '[0-9a-fA-F]{8}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{12}';

const api = new API();

fastify.get('/', async (req, res) => {
  const accept = req.accepts()
  const lang = accept.language(['fr', 'en'])
  const row = await api.getRandom(lang)
  res.redirect(`/${row.id}`)
})

fastify.get(`/:id(${uuidPattern})`, async (req, res) => {
  const accept = req.accepts()
  const lang = accept.language(['fr', 'en'])
  const row = await api.get(lang, req.params.id)
  const rendered = await Sqrl.renderFile(`index_${lang}.html`, row)
  res
      .code(200)
      .type('text/html; charset=utf-8')
      .send(rendered)
})

fastify.get(`/api`, async (req, res) => {
  const accept = req.accepts()
  const lang = accept.language(['fr', 'en'])
  const row = await api.getRandom(lang)
  res
      .code(200)
      .type('application/json; charset=utf-8')
      .send(row)
})

fastify.get(`/api/:id(${uuidPattern})`, async (req, res) => {
  const accept = req.accepts()
  const lang = accept.language(['fr', 'en'])
  const row = await api.get(lang, req.params.id)
  res
      .code(200)
      .type('application/json; charset=utf-8')
      .send(row)
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
