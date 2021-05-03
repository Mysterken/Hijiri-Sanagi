require("dotenv").config({ path: '../.env' });

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.hijiriLogin}.nqvty.mongodb.net/database?retryWrites=true&w=majority`;
const hijiriDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const fetch = require('node-fetch');

hijiriDB.connect(err => {

    if (err) throw err;
    
    const updateDB = hijiriDB.db().collection("last_update");
    const apiToken = process.env.wanikaniToken;
    let path = 'subjects/';
    var subjectsPromiseArr = [];
    let parameter = '';
    let i = 1;

    var requestHeaders =
        new fetch.Headers({
            Authorization: 'Bearer ' + apiToken,
        });

    function apiEndpoint(EndpointPath) {
        return endpoint = 
            new fetch.Request('https://api.wanikani.com/v2/' + EndpointPath + parameter, {
                    method: 'GET',
                    headers: requestHeaders
            });
    }

    console.log('Wanikani subject fetching initialized!\nFetching page ' + i)

    return updateDB.findOneAndUpdate(
        { collection: 'subjects' },
        { $currentDate: { time: true } },
        { upsert: true })
    .then(doc => {

        if (doc.value) parameter = '?updated_after=' + doc.value.time.toISOString();

        fetch(apiEndpoint(path))
        .then(response => response.json())
        .then(responseBody => { 
            
            var subject = responseBody;

            if (subject.pages.next_url) {
                do {

                    console.log(`Fetching page ${i+1}`)
                    path = 'subjects?page_after_id='+(i*subject.pages.per_page);
        
                    subjectsPromiseArr.push(new Promise((resolve, reject) => {
                        fetch(apiEndpoint(path))
                        .then(response => response.json())
                        .then(responseBody => { return resolve(responseBody.data)})
                        .catch(err => {return reject(err)})
                    }).catch(err => console.error(err)))
        
                    i++;
        
                } while (i < Math.floor((subject.total_count) / subject.pages.per_page) + 1)
            }
    
            return Promise.all(subjectsPromiseArr)
            .then(arr => {

                const subjectsDB = hijiriDB.db().collection("subjects");
                const charactersDB = hijiriDB.db().collection("characters");
                const meaningsDB = hijiriDB.db().collection("meanings");

                let sInserted = cInserted = mInserted = 0;
                let sCount = cCount = mCount = 0;
                let subjectsPromiseArr = [];
                let charactersPromiseArr = [];
                let meaningsPromiseArr = [];
                let subjects = subject.data;
                let charDB = {};
                let meanDB = {};

                for (const p of arr) subjects = subjects.concat(p);

                console.log('Finished fetching subject, now writing them to the Database.\nStarted writing to subject database...')

                for (const s of subjects) {

                    subjectsPromiseArr.push(new Promise((resolve, reject) => {
                        subjectsDB.findOneAndReplace(
                            { id: s.id}, s, 
                            { upsert: true, returnOriginal: true }, (err, res) => {
                            if (err) return reject(err)
                            else if (!res.value) sInserted++; 
                            sCount++;
                            resolve() 
                        })
                    }).catch(err => console.error(err)))

                    if (!charDB[s.data.characters]) charDB[s.data.characters] = [s.id];
                    else charDB[s.data.characters].push(s.id);

                    for (let m of s.data.meanings) {
                        if (!meanDB[m.meaning]) meanDB[m.meaning] = [s.id];
                        else meanDB[m.meaning].push(s.id);
                    }
                }

                function writeOrUpdate(localDB, countChar, arr, DB, query) {
                    console.log(`Started writing to ${query}s database...`)
                    for (const [key, value] of Object.entries(localDB)) {
                        arr.push(new Promise((resolve, reject) => {
                            DB.findOneAndUpdate(
                                { [query]: key }, 
                                { $set: { subjectID: value } }, 
                                { upsert: true, returnOriginal: true }, (err, res) => {
                                if (err) return reject(err)
                                else { 
                                    if (!res.value) countChar ? cInserted++ : mInserted++;
                                    countChar ? cCount++ : mCount++;
                                    resolve() 
                                }
                            })
                        }).catch(err => console.error(err)))
                    }
                }

                writeOrUpdate(charDB, true, charactersPromiseArr, charactersDB, 'character');
                writeOrUpdate(meanDB, false, meaningsPromiseArr, meaningsDB, 'meaning');

                const spa = Promise.all(subjectsPromiseArr).then(() => {
                    console.log(`Finished writing ${sCount} subjects to the database! Inserted ${sInserted} new.`)
                })

                const cpa = Promise.all(charactersPromiseArr).then(() => {
                    console.log(`Finished writing ${cCount} characters to the database! Inserted ${cInserted} new.`)
                })

                const mpa = Promise.all(meaningsPromiseArr).then(() => {
                    console.log(`Finished writing ${mCount} meanings to the database! Inserted ${mInserted} new.`)
                })

                Promise.all([spa, cpa, mpa])
                .then(() => console.log('Complete fetching and writing complete!'))
                .catch(err => console.error(err))
                .then(() => hijiriDB.close())
            })
            .catch(err => console.error(err))
        })
        .catch(err => {return console.error(err)}) 
    })
    .catch(err => { console.error(err); hijiriDB.close() })
})