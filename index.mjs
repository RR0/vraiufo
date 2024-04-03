'use strict'

const questionElem = document.getElementById('question');

export class VraiUFO {

  answer(value) {
    fetch('api')
        .then(async (response) => {
          let content = await response.json();
          let template = `
  <h2>{{it.assertion}}</h2>
  <img alt="image" src="{{it.media_url}}"/>
  <form action="javascript:vraiUFO.answer()">
    <button onclick="vraiUFO.answer(true)">Vrai</button>
    ou
    <button onclick="vraiUFO.answer(false)">Faux</button>
  </form>
`;
          content = Sqrl.render(template, content)
          questionElem.innerHTML = content
          return content;
        })
  }
}

export const vraiUFO = new VraiUFO();
