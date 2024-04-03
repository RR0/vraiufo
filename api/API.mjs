export class API {

  async getRandom(lang) {
    const client = await pool.connect()
    try {
      const query = `SELECT * FROM ${lang}.ufo`
      console.log(query)
      const result = await client.query(query)
      const size = result.rows.length;
      const n = Math.floor(Math.random() * size)
      console.log(`picking row #${n} among ${size}`)
      return result.rows[n]
    } finally {
      client.release()
    }
  }

  async get(lang, id) {
    const client = await pool.connect()
    try {
      const query = {
        name: 'fetch-ufo',
        text: `SELECT * FROM ${lang}.ufo WHERE id=$1`,
        values: [id],
      }
      console.log(query)
      const result = await client.query(query)
      return result.rows[0]
    } finally {
      client.release()
    }
  }
}
