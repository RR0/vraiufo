import {RR0Case, RR0CaseCatalog, RR0Catalog} from "@rr0/case"

export class VraiUfo {
  /**
   * @type RR0CaseCatalog
   */
  cases
  /**
   * @type RR0Catalog
   */
  catalog

  /**
   * @readonly
   * @member {Messages}
   */
  messages
  /**
   * @member {RR0Case}
   */
  pickedCase

  /**
   * @member {People}
   */
  pickedPeople

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
   */
  constructor(messages) {
    this.messages = messages
    this.catalog = new RR0Catalog()
  }

  answer(value) {
    const answerMessages = this.messages.answer
    const conclusion = this.pickedCase.conclusion || "unknown"
    const unknownAndTrue = conclusion === "unknown" && value === "true"
    const explainedAndFalse = conclusion !== "unknown" && value === "false"
    const correct = unknownAndTrue || explainedAndFalse
    this.form.style.opacity = "0"
    this.pickButton.style.display = "inline-block"
    this.correctAnswersCount += correct ? 1 : 0
    this.name.classList.add(correct ? "true" : "false")
    this.counter++
    this.score.innerHTML = answerMessages.result(this.correctAnswersCount, this.counter)
    this.name.textContent = answerMessages[correct ? "correct" : "incorrect"]
    this.description.innerHTML = `<a href="${this.pickedCase.url}">${answerMessages.conclusion[conclusion]}</a>`
  }

  /**
   *
   * @param {number} caseIndex
   */
  async init(caseIndex) {
    this.name = document.querySelector("#question .name")
    this.description = document.querySelector("#question .description")
    this.score = document.querySelector("#question .score")
    this.image = document.querySelector("#question .image")
    this.form = document.querySelector("#question .options")
    this.form.append(this.createButton("true"))
    this.form.append(this.messages.question.or)
    this.form.append(this.createButton("false"))
    this.form.append("?")
    this.pickButton = document.querySelector("#question .pick")
    this.pickButton.textContent = this.messages.question.pick
    this.cases = await this.catalog.getCases()
    caseIndex = caseIndex || Math.floor(Math.random() * this.cases.files.length)
    return this.pickCase(caseIndex)
  }

  /**
   * @param {string} clazz
   * @return {HTMLButtonElement}
   */
  createButton(clazz) {
    const button = document.createElement("button")
    button.className = clazz
    button.innerHTML = this.messages.question[clazz]
    button.addEventListener("click", () => this.answer(clazz))
    return button
  }

  /**
   * @param {number} caseIndex
   * @return {Promise<void>}
   */
  async pickCase(caseIndex = Math.floor(Math.random() * this.cases.files.length)) {
    this.pickButton.style.display = "none"
    this.form.style.opacity = "1"
    this.name.className = "name"
    window.location.hash = String(caseIndex)
    const cases = this.cases.files
    const caseUrl = cases[caseIndex]
    const pickedCase = this.pickedCase = await this.cases.fetch(caseUrl)
    console.debug(caseIndex, pickedCase)
    const str = []
    const classification = pickedCase.classification
    const imageHref = pickedCase.image
    if (classification) {
      const hynek = classification.hynek
      if (hynek) {
        const hynekStr = this.messages.case.classification.hynek[hynek]
        if (!imageHref) {
          pickedCase.image = hynekStr.image
        }
        str.push(hynekStr.title)
      }
    }
    this.image.firstElementChild?.remove()
    if (imageHref) {
      let img
      if (imageHref.includes("youtube.com")) {
        img = document.createElement("iframe")
      } else {
        img = document.createElement("img")
        img.setAttribute("onclick",
          `this.classList.contains('zoomed') ? document.exitFullscreen() && this.classList.toggle('zoomed', false): this.classList.toggle('zoomed', true) && this.requestFullscreen()`)
      }
      img.src = new URL(imageHref, this.cases.options.baseUrl).href
      this.image.append(img)
    }
    const time = pickedCase.time
    if (time) {
      const parts = time.split("/")
      if (parts.length > 1) {
        str.push(this.messages.question.between(this.dateStr(parts[0]), this.dateStr(parts[1])))
      } else {
        str.push(this.dateStr(time))
      }
    }
    if (pickedCase.place) {
      str.push(pickedCase.place)
    }
    this.name.textContent = pickedCase.title
    this.description.textContent = str.join(", ")
  }

  async fetchPeople(peopleUrl) {
    const pickedPeople = this.pickedPeople = await this.fetchJson(new URL(peopleUrl, this.baseUrl))
    const peopleFile = "/people.json"
    pickedPeople.url = new URL(peopleUrl.replace(peopleFile, "/index.html"), this.baseUrl)
    if (!pickedPeople.title) {
      let titleFromUrl = peopleUrl.substring(0, peopleUrl.length - peopleFile.length)
      titleFromUrl = titleFromUrl.substring(titleFromUrl.lastIndexOf("/") + 1)
      pickedPeople.title = titleFromUrl.replaceAll(/([a-z0-9])([A-Z0-9])/g, "$1 $2").trim()
    }
    return pickedPeople
  }

  /**
   * @param {number} peopleIndex
   * @return Promise<void>
   */
  async pickPeople(peopleIndex = Math.floor(Math.random() * this.peopleFiles.length)) {
    this.pickButton.style.display = "none"
    this.form.style.opacity = "1"
    this.name.className = "name"
    const peopleUrl = this.peopleFiles[peopleIndex]
    const pickedPeople = await this.fetchPeople(peopleUrl)
    console.debug(peopleIndex, pickedPeople)
    const str = []
    const imageHref = pickedPeople.image
    this.image.firstElementChild?.remove()
    if (imageHref) {
      let img
      if (imageHref.indexOf("youtube.com") > 0) {
        img = document.createElement("div")
        img.innerHTML = `<iframe width="560" height="315" src="${imageHref}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      } else {
        img = document.createElement("img")
        img.src = new URL(imageHref, this.baseUrl).href
      }
      this.image.append(img)
    }
    const time = pickedPeople.time
    if (time) {
      const parts = time.split("/")
      if (parts.length > 1) {
        str.push(this.dateStr(parts[0]) + " à " + this.dateStr(parts[1]))
      } else {
        str.push(this.dateStr(time))
      }
    }
    if (pickedPeople.place) {
      str.push(pickedPeople.place)
    }
    this.name.textContent = pickedPeople.title
    this.description.textContent = str.join(", ")
  }

  /**
   * @param {string} time ISO date with possible "circa" (~) sign
   * @return {string} Readable date
   */
  dateStr(time) {
    const date = new Date(time.replaceAll("~", ""))
    let dateStr = date.toLocaleDateString(navigator.language, {month: "long", year: "numeric"})
    const parsed = /(~)?(\d\d\d\d)(?:-(\d\d)(?:-(?:(\d\d) (~)?(\d\d:\d\d)))?)?/.exec(time)
    if (!parsed?.[3]) {
      dateStr = dateStr.replaceAll("janvier", "").replaceAll("january", "")
    }
    if (parsed[1]) {
      dateStr = this.messages.question.circa(dateStr)
    }
    return dateStr
  }
}
