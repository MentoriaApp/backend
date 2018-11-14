const fetch = require('node-fetch');

module.exports = {
    async fetchPhoto(req,res){
        let { mentor } = req.params
        const url = `http://api.github.com/users/${mentor}` 
        const result = await fetch(url, {
            method: 'GET'
        }).
        then(response => response.json())
        res.send(result.avatar_url)
    }
};