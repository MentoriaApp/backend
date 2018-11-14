var mentorList = require('./Controllers/mentorList');
var mentorPhoto = require('./Controllers/mentorPhoto');

module.exports = {
    configRoutes(server){
        server.get('/api/mentor/list', mentorList.fetchMentorList);
        server.get('/api/picture/:mentor', mentorPhoto.fetchPhoto);
        server.get('/', (req, res) => {
            const methods = {
                fetchMentors: '/api/mentor/list',
                menthorPhoto: '/api/picture/:mentor-username'
            }
            
            res.send(methods, {
                "Content-Type": "application/json"
            })
        });
    }
}

