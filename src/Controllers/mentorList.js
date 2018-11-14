const fetch = require('node-fetch');

function createMentorList(markupFile){
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

function entryToModel(entry){
    let readingPart = 0; // 0 - Nome, 1- Tipo Mentoria, 2 - Contatos
    let mentor = {}
    entry.split('|').map(value => { 
        if (value.trim() !== '') {
            switch (readingPart) {
                case 0: mentor.description = extractMentorDescription(value); readingPart++; break;
                case 1: mentor.mentoryType = extractMentoryType(value); readingPart++; break;
                case 2: mentor.contact = extractMentorContacts(value); readingPart++; break;
            }
        }
    })

    mentor.isActive = (mentor.contact !== null)
    return mentor;
}

function extractMentorDescription(entry){
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

function extractMentoryType(entry){
    return entry.replace(/\[\[.+\]\]\(.+\)/g, '').split('/').map( e => e.trim())
}

function extractMentorContacts(entry){
    if (entry.trim() === ":snowflake:") return null
    let contacts = {}
    entry.trim().split(' ').map(rawData => {
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
            console.error(`Don't get fooled by human errors. You received: ${rawData} as paramether`)
        }
    });

    return contacts
}


module.exports = {
    async fetchMentorList(req, res){
        const result = await fetch('https://raw.githubusercontent.com/training-center/mentoria/master/mentors-list.md', {
            method: 'GET',
            headers: {
                "Content-Type": "text/html"
            }
        })
        let stream = result.body;
        let mentorList = '';
        stream.on('data', buffer => mentorList += buffer);
        stream.on('end', async () => { mentorList = createMentorList(mentorList); res.send(mentorList) });
    }
};

