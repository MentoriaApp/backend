const restify = require('restify');
const fetch = require('node-fetch');

const server = restify.createServer()

const fetchMentorList = async (req, res) => {
   const result = await fetch('https://raw.githubusercontent.com/training-center/mentoria/master/mentors-list.md', {
       method: 'GET',
       headers: {
           "Content-Type": "text/html"
       }
   })
   let stream = result.body;
   let mentorList = '';
   stream.on('data', buffer => mentorList += buffer);
   stream.on('end', async () => { mentorList = createMentorList(mentorList); res.send(mentorList) })
}

const createMentorList = (markupFile) => {
    let mentorList = []
    markupFile.match(/(\|(.+)\|)/g).map( entry => {
        if (entry !== "| ÍCONE | SIGNIFICADO |" && 
            entry !== "| --- | --- |" && 
            entry !== "| :snowflake: | pessoa indisponível para contato |" &&
            entry !== "| NOME | TIPO DE MENTORIA | CONTATO |" &&
            entry !== "| :--- | :--- | :--- |"
        ) {
            mentorList.push(entryToModel(entry))
        }
    })

    return mentorList
}

const entryToModel = entry => {
    let readingPart = 0; // 0 - Nome, 1- Tipo Mentoria, 2 - Contatos
    let mentor = {}
    entry.split('|').map(value => { 
        if (value.trim() !== '') {
            switch (readingPart) {
                case 0: mentor.description = extractMentorDescription (value); readingPart++; break;
                case 1: mentor.mentoryType = extractMentoryType (value); readingPart++; break;
                case 2: mentor.contact = extractMentorContacts(value); readingPart++; break;
            }
        }
    })

    mentor.isActive = (mentor.contact !== null)
    return mentor;
}

const extractMentorDescription = entry => {
    let name = entry.match(/(\[.+\])/g)[0].replace(/\[|]/g, '')
    let url = entry.match(/(\(.+\))/g)[0].replace(/\(|\)/g, '')
    let hasProfilePicture = false;
    let username = null;

    if (url.indexOf('github.com') > -1) {
        hasProfilePicture = true;
        username = url.replace('https://github.com/', '').replace('http://github.com/', '').replace(/\//g, '')
    }

    return { name, url, hasProfilePicture, username }
}
const extractMentoryType = entry => {
    return entry.split('/').map( e => e.trim())
}
const extractMentorContacts = entry => {
    if (entry.trim() === ":snowflake:") return null
    let contacts = {}
    entry.trim().split(' ').map(rawData => {
        console.log(rawData)
        try {
            if (rawData == 'Slack') {
                // Means mentor is available @ training center slack channel
                contacts['Slack'] = 'Join @ https://ctgroups.herokuapp.com/'
            } else {
                let key = rawData.match(/(\[.+\])/g)[0].replace(/\[|]/g, '')
                let url = rawData.match(/(\(.+\))/g)[0].replace(/\(|\)/g, '')   
                contacts[key] = url
            }
        } catch {
            console.error('Don`t get fooled by human errors')
        }
    });

    return contacts
}

//@TODO: Fetch profile pic using this -> https://developer.github.com/v3/users/#get-a-single-user
const fetchPhoto = async (req, res) => {
    let { mentor } = req.params
    const url = `https://api.github.com/users/${mentor}` 
    const result = await fetch(url, {
        method: 'GET'
    }).
    then(response => response.json())
    res.send(result.avatar_url)
}

server.get('/api/mentor/list', fetchMentorList)
server.get('/api/picture/:mentor', fetchPhoto)
server.get('/', (req, res) => {
    const methods = {
        fetchMentors: '/api/mentor/list',
        menthorPhoto: '/api/picture/:mentor-username'
    }
    
    res.send(methods, {
        "Content-Type": "application/json"
    })
})

server.use(
    function crossOrigin(req,res,next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        return next();
    }
);
server.listen(process.env.PORT || 1337)