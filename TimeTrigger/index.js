
const _ = require('underscore');
const request = require('request-promise');

module.exports = function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!:', timeStamp);

    context.log(searchClients(context));
    
    context.done();
};



function buildNotifyFromResponse(pros) {
    let notify = 'There are professionals you may be interested in:\r\n';
    let i = 1;
    _.each(pros, function(pro) {
        notify += i + '. Name: ' + pro.Name + ', Email: ' + pro.Email + '\r\n';

        i++;
    });

    return notify;
}

function searchClients(context) {
    let clients = _.where(context.bindings.searchClientTable);
    clients = _.groupBy(clients, function(client) {
        return client.Service;
    });

    // return clients;

    for (let service in clients) {
        let serviceEntity = {Service: service};
        let pros = _.where(context.bindings.searchClientTable, serviceEntity);
        let notify = buildNotifyFromResponse(pros);

        let client = clients[service];
        
        let notifyToS = notifyToSlack(client);

        context.log(notifyToS);
    }
}

function notifyToSlack(client) {
    let req = client.Request_OriginalDetectIntentRequest;

    return client;

    if (req.payload.data !== undefined) {
        let channel = req.payload.data.channel;
        let user = req.payload.data.user;

        request(
            {
                method: 'POST',
                uri: 'https://hooks.slack.com/services/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',
                form: {
                    text: 'Hello !!'
                }
            }
        , function (error, response, body) {
            if(response.statusCode == 201){
                console.log('document saved as: http://mikeal.iriscouch.com/testjs/'+ rand)
            } else {
                console.log('error: '+ response.statusCode)
                console.log(body)
            }
            }
        )
    }

}
