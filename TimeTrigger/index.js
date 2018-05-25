
const _ = require('underscore');
const request = require('request');

module.exports = function (context, myTimer) {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!:', timeStamp);

    context.log(searchClients(context));

    context.done();
};

function searchClients(context) {
    let clients = _.where(context.bindings.searchClientTable);
    clients = _.groupBy(clients, function(client) {
        return client.Service;
    });

    for (let service in clients) {
        let serviceEntity = {Service: service};
        let pros = _.where(context.bindings.searchClientTable, serviceEntity);
        let notify = buildNotifyFromResponse(pros);

        let clientsForService = clients[service];

        // notifyToSlack(context, clientsForService, notify);
    }
}

function buildNotifyFromResponse(pros) {
    let notify = 'There are professionals you may be interested in:\r\n';
    let i = 1;
    _.each(pros, function(pro) {
        notify += i + '. Name: ' + pro.Name + ', Email: ' + pro.Email + '\r\n';

        i++;
    });

    return notify;
}

function notifyToSlack(context, clientsForService, notify) {
    for (let i in clientsForService) {
        let client = clientsForService[i];
        let req = JSON.parse(client.Request_OriginalDetectIntentRequest);

        if (req && req.payload && req.payload.data) {
            let channel = req.payload.data.channel;
            let user = req.payload.data.user;

            context.log({
                user: user, channel: channel
            });


            let webhook = "https://hooks.slack.com/services/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";
            let payload = {text: 'Hello, ' + user + ', channel: '+ channel};
            // let headers = {'Content-type': 'application/json'};
            let headers = {'Content-type': 'application/x-www-form-urlencoded'};

            payload = JSON.stringify(payload);
            let options = {
                url: webhook,
                method: 'POST',
                headers: headers,
                form: payload
            };


            request.post(options, function(err, res) {
                    if (err)
                        context.log({err: err});

                    if (res)
                        context.log({res: res.body});
                }
            );
        }
    }

}
