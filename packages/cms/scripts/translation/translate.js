#! /usr/bin/env node
 
const {Translate} = require("@google-cloud/translate").v2;

const translate = new Translate();

const text = "Hello, world!";
const target = "es";

/** */
async function translateText() {
  const resp = await translate.translate(text, target);
  const translation = resp[0];
  console.log(`${text} => (${target}) ${translation}`);  
}

translateText();

return;



