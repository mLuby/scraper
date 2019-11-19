const uuid = require("uuid/v4")
const request = require('request-promise')
var sqlite3 = require('sqlite3').verbose()
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey("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")
// const mailgun = require("mailgun-js");
// const mg = mailgun({apiKey: "5eade11d694d41aab7503c2e4a5d5248-09001d55-40c2684f", domain: "sandbox2c7ba554d0dc422490d57a417fa86d7c.mailgun.org"})

// CONFIG

const DATABASE_FILE_PATH = "./database.sql"
const SERVER_EMAIL = "m+domio-server@mluby.com"
const ADMIN_EMAIL = "domio-admin@mailinator.com"
const SCRAPE_INTERVAL = 5000 // in ms
const API_ENDPOINT = "https://interview.domio.io/properties/"

// SIDE EFFECTS

async function scrapeProperties () {
  // request properties
  const scrapeId = `<${uuid().split("-")[0]}>` // only need first few chars
  console.log(Date.now(), scrapeId, "Requesting new properties…")
  const {properties} = await request({url: API_ENDPOINT, json: true})

  // update properties
  console.log(Date.now(), scrapeId, "Storing updated property prices…")
  await new Promise((resolve, reject) => db.serialize(function() {
    const stmt = db.prepare("INSERT INTO Properties VALUES (?, ?, ?, ?, ?)")
    properties.forEach(({id, type, dynamicDisplayPrice, basePrice}) =>
      stmt.run(id, type, dynamicDisplayPrice, basePrice, Date.now())
    )
    stmt.finalize()
    resolve()
    // uncomment to inspect rows in db
    // db.each("SELECT rowid, id, type, dynamicDisplayPrice, basePrice, timestamp FROM Properties", console.log)
  }))

  // send admin notifications
  console.log(Date.now(), scrapeId, "Notifying admin if necessary…")
  const notificationPromises = [
    properties
    .filter(aptNeedsNotification)
    .map(({id, dynamicDisplayPrice, basePrice}) => channels.map(channel => channel.send({
      from: channel.SERVER,
      to: channel.ADMIN,
      subject: `Admin Price Alert: Apartment ${id}`,
      body: `Apartment ${id} dynamic price ${dynamicDisplayPrice} is less than base price ${basePrice}.`,
    }))),
    properties
    .filter(homeNeedsNotification)
    .map(({id, dynamicDisplayPrice, basePrice}) => channels.map(channel => channel.send({
      from: channel.SERVER,
      to: channel.ADMIN,
      subject: `Admin Price Alert: Home ${id}`,
      body: `Home ${id} dynamic price ${dynamicDisplayPrice} is greater than base price ${basePrice}.`,
    }))),
  ]
  await Promise.all(flatten(flatten(notificationPromises)))

  console.log(Date.now(), scrapeId, "Done.")
}

// HELPERS

function flatten (listOfLists) {
  return listOfLists.reduce((flatList, list) => [...flatList, ...list], [])
}

function homeNeedsNotification ({type, dynamicDisplayPrice, basePrice}) {
  return type === "home" && dynamicDisplayPrice > basePrice
}

function aptNeedsNotification ({type, dynamicDisplayPrice, basePrice}) {
  return type === "apartment" && dynamicDisplayPrice < basePrice
}

// START

const db = new sqlite3.Database(DATABASE_FILE_PATH)
db.run("CREATE TABLE IF NOT EXISTS Properties (id TEXT, type TEXT, dynamicDisplayPrice TEXT, basePrice TEXT, timestamp TEXT)")
const channels = [{
  type: "email",
  // mailgun:
  // send: data => new Promise((resolve, reject) => mg.messages().send(data, (err, result) => err ? reject(err) : resolve(result))),
  // sendgrid:
  // send: sgMail.send, // asm: { group_id: 10213 }, // unsubscribe group https://mc.sendgrid.com/unsubscribe-groups
  // test:
  send: data => new Promise(resolve => {console.log("[emailed]", data); setTimeout(resolve)}),
  SERVER: SERVER_EMAIL,
  ADMIN: ADMIN_EMAIL,
}]
scrapeProperties() // once at beginning then on interval
// setInterval(scrapeProperties, SCRAPE_INTERVAL)
