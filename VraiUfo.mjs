import {RR0Catalog} from "@rr0/case"

export class VraiUfo {
  /**
   * @param {Object} messages  The localized Messages_<lang> object (incl. its `ui` block).
   */
  constructor(messages) {
    this.messages = messages
    this.ui = messages.ui
    this.locale = navigator.language
    this.catalog = new RR0Catalog()
    this.score = 0
    this.count = 0
    this.streak = 0
    this.answered = false
  }

  /**
   * @param {number|string} [caseIndex]
   */
  async init(caseIndex) {
    this.buildShell()
    this.cases = await this.catalog.getCases()
    let idx = (caseIndex === undefined || caseIndex === null || caseIndex === "") ? NaN : Number(caseIndex)
    if (!Number.isInteger(idx) || idx < 0 || idx >= this.cases.files.length) {
      idx = Math.floor(Math.random() * this.cases.files.length)
    }
    return this.pickCase(idx)
  }

  buildShell() {
    const ui = this.ui
    const root = document.getElementById("app")
    root.innerHTML = `
      <div class="frame">
        <div class="folder">
          <div class="kicker kicker--eval">${ui.archives}</div>
          <h1 class="title"><span class="t-true">${ui.tTrue}</span> <span class="t-or">${ui.tOr}</span> <span class="t-false">${ui.tFalse}</span> <span class="t-ufo">${ui.ufoWord} ?</span></h1>
          <p class="intro">${ui.intro}</p>
          <div class="divider"></div>
          <div class="loading" data-ref="loading">${ui.loading}</div>
          <div class="case" data-ref="case" hidden>
            <div class="kicker" data-ref="caseHeading"></div>
            <div class="name-row">
              <h2 class="name" data-ref="name"></h2>
              <div class="stamp stamp--pre" data-ref="stamp">${ui.unclassified}</div>
            </div>
            <div class="meta" data-ref="meta"></div>
            <div class="photo">
              <span class="tape tape--l"></span><span class="tape tape--r"></span>
              <div class="photo__inner" data-ref="photo"></div>
            </div>
            <div class="options" data-ref="options">
              <button class="pick-true" data-ref="trueBtn">${ui.tTrue} ${ui.ufoWord}</button>
              <button class="pick-false" data-ref="falseBtn">${ui.tFalse} ${ui.ufoWord}</button>
            </div>
            <div class="verdict" data-ref="verdict" hidden>
              <p class="conclusion" data-ref="conclusion"></p>
              <a class="case-link" data-ref="caseLink" target="_blank" rel="noopener"></a>
              <button class="another" data-ref="another">${this.messages.question.pick}</button>
            </div>
          </div>
          <div class="scorebar">
            <span>${ui.accuracy} <b data-ref="pct">0</b> % \u00B7 <span data-ref="good">0</span>/<span data-ref="total">0</span></span>
            <span class="streak" data-ref="streak" hidden><span>${ui.streakLabel}</span> <span data-ref="streakVal"></span></span>
          </div>
        </div>
        <div class="foot">vraiufo.com \u2014 ${ui.tagline}</div>
      </div>
    `
    this.el = {}
    root.querySelectorAll("[data-ref]").forEach(node => {
      this.el[node.dataset.ref] = node
    })
    this.el.trueBtn.addEventListener("click", () => this.answer("true"))
    this.el.falseBtn.addEventListener("click", () => this.answer("false"))
    this.el.another.addEventListener("click", () => this.pickCase())
  }

  /**
   * @param {number} [caseIndex]
   */
  async pickCase(caseIndex = Math.floor(Math.random() * this.cases.files.length)) {
    this.currentIndex = caseIndex
    window.location.hash = String(caseIndex)
    this.answered = false
    this.el.loading.hidden = false
    this.el.case.hidden = true
    const caseUrl = this.cases.files[caseIndex]
    const pickedCase = this.pickedCase = await this.cases.fetch(caseUrl)
    this.render(pickedCase)
    this.el.loading.hidden = true
    this.el.case.hidden = false
  }

  render(pickedCase) {
    this.el.verdict.hidden = true
    this.el.options.hidden = false
    const caseNo = "#" + String(this.currentIndex).padStart(4, "0")
    this.el.caseHeading.textContent = this.ui.caseKicker.replace("{n}", caseNo)

    const stamp = this.el.stamp
    stamp.textContent = this.ui.unclassified
    stamp.className = "stamp stamp--pre"
    stamp.style.animation = ""

    let imageHref = pickedCase.image
    let classifTitle = null
    const classification = pickedCase.classification
    if (classification && classification.hynek) {
      const hynek = this.messages.case.classification.hynek[classification.hynek]
      if (hynek) {
        classifTitle = hynek.title
        if (!imageHref) imageHref = hynek.image
      }
    }

    const photo = this.el.photo
    photo.textContent = ""
    if (imageHref) {
      if (imageHref.includes("youtube.com")) {
        const iframe = document.createElement("iframe")
        iframe.className = "media"
        iframe.src = imageHref
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        iframe.allowFullscreen = true
        photo.append(iframe)
      } else {
        const img = document.createElement("img")
        img.className = "media"
        img.alt = "Illustration"
        img.src = new URL(imageHref, this.cases.options.baseUrl).href
        img.addEventListener("click", () => {
          if (document.fullscreenElement) document.exitFullscreen()
          else img.requestFullscreen?.()
        })
        photo.append(img)
      }
    } else {
      const ph = document.createElement("div")
      ph.className = "placeholder"
      const span = document.createElement("span")
      span.textContent = this.ui.noVisual
      ph.append(span)
      photo.append(ph)
    }

    const parts = []
    if (classifTitle) parts.push(classifTitle)
    const time = pickedCase.time
    if (time) {
      const seg = time.split("/")
      if (seg.length > 1) parts.push(this.messages.question.between(this.dateStr(seg[0]), this.dateStr(seg[1])))
      else parts.push(this.dateStr(time))
    }
    if (pickedCase.place) parts.push(pickedCase.place)

    this.el.name.textContent = pickedCase.title
    this.el.meta.textContent = parts.filter(Boolean).join(" \u00B7 ")
  }

  answer(value) {
    if (this.answered) return
    this.answered = true
    const conclusion = this.pickedCase.conclusion || "unknown"
    const unknownAndTrue = conclusion === "unknown" && value === "true"
    const explainedAndFalse = conclusion !== "unknown" && value === "false"
    const correct = unknownAndTrue || explainedAndFalse

    this.count++
    if (correct) {
      this.score++
      this.streak++
    } else {
      this.streak = 0
    }

    this.el.options.hidden = true
    this.el.verdict.hidden = false

    const genuine = conclusion === "unknown"
    const stamp = this.el.stamp
    stamp.textContent = this.ui.stampLabel[conclusion] || this.ui.stampLabel.unknown
    stamp.className = "stamp stamp--done " + (genuine ? "is-true" : "is-false")
    stamp.style.animation = "none"
    void stamp.offsetWidth
    stamp.style.animation = ""

    const answerMessages = this.messages.answer
    const word = correct ? answerMessages.correct : answerMessages.incorrect
    this.el.conclusion.innerHTML = `<b class="verdict-word ${correct ? "is-true" : "is-false"}">${word}</b> ${answerMessages.conclusion[conclusion]}`
    this.el.caseLink.href = this.pickedCase.url
    this.el.caseLink.textContent = this.ui.caseLink

    this.updateScore()
  }

  updateScore() {
    const pct = this.count ? (this.score / this.count * 100).toLocaleString(this.locale, {
      maximumFractionDigits: 1,
      useGrouping: false
    }) : "0"
    this.el.pct.textContent = pct
    this.el.good.textContent = String(this.score)
    this.el.total.textContent = String(this.count)
    if (this.streak > 1) {
      this.el.streak.hidden = false
      this.el.streakVal.textContent = "\u00D7" + this.streak
    } else {
      this.el.streak.hidden = true
    }
  }

  /**
   * @param {string} time ISO date with possible "circa" (~) sign
   * @return {string} Readable date
   */
  dateStr(time) {
    const date = new Date(time.replaceAll("~", ""))
    let dateStr = date.toLocaleDateString(this.locale, {month: "long", year: "numeric"})
    const parsed = /(~)?(\d\d\d\d)(?:-(\d\d)(?:-(?:(\d\d) (~)?(\d\d:\d\d)))?)?/.exec(time)
    if (!parsed?.[3]) {
      dateStr = dateStr.replace(/[\p{L}.]+\s+(?=\d)/u, "").trim()
    }
    if (parsed?.[1]) {
      dateStr = this.messages.question.circa(dateStr)
    }
    return dateStr
  }
}
