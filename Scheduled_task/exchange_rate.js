require("dotenv").config({ path: '../.env' });

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.hijiriLogin}.nqvty.mongodb.net/database?retryWrites=true&w=majority`;
const hijiriDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const fetch = require('node-fetch');
const { currency_code } = require('../data/currency_code.json');

hijiriDB.connect(err => {

    if (err) throw err;

    console.log('Exchange rate fetching initialized!')

    const exchange_rates = hijiriDB.db().collection("exchange_rates");
    const updateDB = hijiriDB.db().collection("last_update");
    let rateFetched = [];

    for (const c in currency_code) {
        rateFetched.push(new Promise((resolve, reject) => {    
            let apiEndpoint =
                new fetch.Request(`https://v6.exchangerate-api.com/v6/${process.env.exchangeKEY}/latest/${c}`, {
                method: 'GET'
            });
            fetch(apiEndpoint)
            .then(response => response.json())
            .then((data) => {
                exchange_rates.findOneAndUpdate({ code: c }, 
                    { $set: { conversion_rates: data.conversion_rates } }, 
                    { upsert: true }, (err) => {
                        console.log(c);
                        if (err) return reject(err)
                        else return resolve()
                    })
            }).catch(err => console.error(err))
        }).catch(err => console.error(err)))
    }

    Promise.all(rateFetched)
    .then(() => {
        console.log('Exchange rates fetching complete!')
        updateDB.findOneAndUpdate(
            { collection: 'exchange_rate' },
            { $set: { time: timestamp } },
            { upsert: true })
    })
    .catch(err => console.error(err))
    .finally(()=>(hijiriDB.close()))
})