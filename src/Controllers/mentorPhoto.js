const fetch = require('node-fetch');

module.exports = {
    async fetchPhoto(req,res){
        let { mentor } = req.params
        const url = `https://github.com/${mentor}.png`
        const result = await fetch(url, {
            method: 'GET'
        });

        res.send(result.url);
    }
};
