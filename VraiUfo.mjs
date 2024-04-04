export class VraiUfo {
  /**
   * @member {string[]}
   */
  casesFiles

  /**
   * @member {string[]}
   */
  peopleFiles

  /**
   * @readonly
   * @member {URL}
   */
  baseUrl

  /**
   * @readonly
   * @member {Messages}
   */
  messages

  /**
   * @member {Case}
   */
  pickedCase

  /**
   * @member {number}
   */
  counter = 0

  /**
   * @member {number}
   */
  correctAnswersCount = 0

  /**
   *
   * @param {Messages} messages
   * @param {URL} baseUrl
   */
  constructor(messages, baseUrl) {
    this.messages = messages
    this.baseUrl = baseUrl
  }

  answer(value) {
    const answerMessages = this.messages.answer
    const conclusion = this.pickedCase.conclusion || "unknown"
    const unknownAndTrue = conclusion === "unknown" && value
    const explainedAndFalse = conclusion !== "unknown" && !value
    const correct = unknownAndTrue || explainedAndFalse
    this.form.style.display = "none"
    this.pickButton.style.display = "inline-block"
    this.correctAnswersCount += correct ? 1 : 0
    this.counter++
    this.score.textContent = answerMessages.result(this.correctAnswersCount, this.counter)
    this.name.textContent = answerMessages[correct ? "correct" : "incorrect"]
    this.description.innerHTML = `<a href="${this.pickedCase.url}">${answerMessages.conclusion[conclusion]}</a>`
  }

  /**
   *
   * @param {string} casesDirsUrl
   * @param {string} peopleDirsUrl
   */
  async init(casesDirsUrl, peopleDirsUrl) {
    this.name = document.querySelector("#question .name")
    this.description = document.querySelector("#question .description")
    this.score = document.querySelector("#question .score")
    this.image = document.querySelector("#question .image")
    this.form = document.querySelector("#question .options")
    this.pickButton = document.querySelector("#question #pick")
    this.casesFiles = /** @type {string[]} */ await this.fetchArray(new URL(casesDirsUrl, this.baseUrl), "/case.json")
    this.peopleFiles = /** @type {string[]} */ await this.fetchArray(new URL(peopleDirsUrl, this.baseUrl), "/people.json")
    return this.pick()
  }

  /**
   *
   * @param {URL} url
   * @param {string} suffix
   * @template T
   * @return {Promise<T[]>}
   */
  async fetchArray(url, suffix) {
    const casesJson = await this.fetchJson(url)
    return casesJson.map(dir => dir + suffix)
  }

  /**
   * @param {URL} url
   * @template T
   * @return {Promise<T>}
   */
  async fetchJson(url) {
    const casesResponse = await fetch(url, {headers: {"accept": "application/json"}})
    return await casesResponse.json()
  }

  async pick() {
    this.pickButton.style.display = "none"
    this.form.style.display = "block"
    const caseIndex = Math.floor(Math.random() * this.casesFiles.length)
    const caseUrl = this.casesFiles[caseIndex]
    const pickedCase = this.pickedCase = await this.fetchJson(new URL(caseUrl, this.baseUrl))
    console.debug(pickedCase)
    const caseFile = "/case.json"
    pickedCase.url = new URL(caseUrl.replace(caseFile, "/index.html"), this.baseUrl)
    if (!pickedCase.title) {
      let titleFromUrl = caseUrl.substring(0, caseUrl.length - caseFile.length)
      titleFromUrl = titleFromUrl.substring(titleFromUrl.lastIndexOf("/") + 1)
      pickedCase.title = titleFromUrl.replaceAll(/([A-Z])/g, " $1").trim()
    }
    const str = []
    const classification = pickedCase.classification
    if (classification) {
      const hynek = classification.hynek
      if (hynek) {
        const hynekStr = this.messages.case.classification.hynek[hynek]
        pickedCase.image = hynekStr.image
        str.push(hynekStr.title)
      }
    }
    this.image.firstElementChild.remove()
    if (pickedCase.image) {
      const img = document.createElement("img")
      img.src = new URL(pickedCase.image, this.baseUrl).href
      this.image.append(img)
    }
    const time = pickedCase.time
    if (time) {
      const parts = time.split("/")
      if (parts.length > 1) {
        str.push(this.dateStr(parts[0]) + " à " + this.dateStr(parts[1]))
      } else {
        str.push(this.dateStr(time))
      }
    }
    this.name.textContent = pickedCase.title
    this.description.textContent = str.join(", ")
  }

  dateStr(time) {
    const parsed = /(\d\d\d\d)(?:-(\d\d)(?:-(\d\d))?)?/.exec(time)
    const date = new Date(time)
    let dateStr = date.toLocaleDateString(navigator.language, {month: "long", year: "numeric"})
    if (!parsed[2]) {
      dateStr = dateStr.replaceAll("janvier", "")
    }
    return dateStr
  }
}
