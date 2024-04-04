const messages_fr = {
  answer: {
    correct: "Correct !",
    incorrect: "Incorrect",
    conclusion: {
      hoax: "C'était un canular",
      misinterpretation: "C'était une méprise",
      unknown: "Ce cas reste non-identifié pour l'instant"
    },
    result: (good, total) => good + " bonnes réponses sur " + total
  },
  case: {
    classification: {
      hynek: {
        NL: {
          title: "Lumière Nocturne",
          image: "/science/crypto/ufo/observation/classification/hynek/ln/Logo.jpg"
        },
        DD: {
          title: "Disque Diurne",
          image: "/science/crypto/ufo/observation/classification/hynek/dd/Logo.jpg"
        },
        RV: {
          title: "Radar-Visuel",
          image: "/science/crypto/ufo/observation/classification/hynek/rv/Logo.jpg"
        },
        CE1: {
          title: "Rencontre Rapprochée du 1er type (observation proche)",
          image: "/science/crypto/ufo/observation/classification/hynek/rr/1/Logo.jpg"
        },
        CE2: {
          title: "Rencontre Rapprochée du 2ème type (interaction proche)",
          image: "/science/crypto/ufo/observation/classification/hynek/rr/2/Logo.jpg"
        },
        CE3: {
          title: "Rencontre Rapprochée du 3ème type (observation d'occupant)",
          image: "/science/crypto/ufo/observation/classification/hynek/rr/3/Logo.jpg"
        },
        CE4: {
          title: "Enlèvement",
          image: "/time/1/9/3/5/06/AstoundingStories.jpg"
        },
        CE5: {
          title: "Contact",
          image: "/people/v/VorilhonClaude/rael1.jpg"
        }
      }
    }
  }
}
export default messages_fr
