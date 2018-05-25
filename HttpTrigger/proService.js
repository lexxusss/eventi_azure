
const md5 = require('md5');
const _ = require('underscore');

const sourceReg = 'register-pro';
const PartitionKeyPro = 'eventi_pro';
const PartitionKeyClient = 'eventi_client';

function getProFromParams(proData, originalDetectIntentRequest, session) {
    return {
        Email: proData['email.original'],
        Name: proData['given-name.original'],
        Service: proData['Service-Name-Entity.original'],
        PartitionKey: PartitionKeyPro,
        RowKey: getHashForRowKey(proData['email.original'], proData['Service-Name-Entity.original']),

        Request_Paramaters: proData,
        Request_OriginalDetectIntentRequest: originalDetectIntentRequest,
        Request_Session: session
    };
}

function getClientFromParams(clientData, originalDetectIntentRequest, session) {
    return {
        Email: clientData['email.original'],
        Name: clientData['given-name.original'],
        Service: clientData['Service-Name-Entity.original'],
        PartitionKey: PartitionKeyClient,
        RowKey: getHashForRowKey(clientData['email.original'], clientData['Service-Name-Entity.original']),

        Request_Paramaters: clientData,
        Request_OriginalDetectIntentRequest: originalDetectIntentRequest,
        Request_Session: session,

        Notify: 1,
        User_ID: getUserId(originalDetectIntentRequest)
    };
}

function mergeParamsFromContexts(contexts) {
    let params = {};
    for (let i in contexts) {
        let cont = contexts[i];
        for (let j in cont.parameters) {
            let param = cont.parameters[j];
            params[j] = param;
        }
    }

    return params;
}

function buildNotifyFromResponse(pros) {
    let notify = ' There are professionals you may be interested in:\r\n';
    let i = 1;
    _.each(pros, function(pro) {
        notify += i + '. Name: ' + pro.Name + ', Email: ' + pro.Email + '\r\n';

        i++;
    });

    return notify;
}

function getHashForRowKey() {
    let str = '';
    for (let i in arguments) {
        str += arguments[i];
    }

    return md5(str);
}

function getUserId(originalDetectIntentRequest) {
    if (originalDetectIntentRequest &&
        JSON.pase(originalDetectIntentRequest).payload &&
        JSON.pase(originalDetectIntentRequest).payload.data &&
        JSON.pase(originalDetectIntentRequest).payload.data.user
    ) {
        return md5(JSON.pase(originalDetectIntentRequest).payload.data.user);
    }

    return null;
}


/*--- API ---*/
function registerPro(context, params, contexts, originalDetectIntentRequest, session, debug) {
    let proData = mergeParamsFromContexts(contexts);
    let found = _.where(context.bindings.searchProCollection, {
        RowKey: getHashForRowKey(
            proData['email.original'],
            proData['Service-Name-Entity.original']
        )
    });

    if (!found.length) {
        let pro = getProFromParams(proData, originalDetectIntentRequest, session);
        context.bindings.registerProCollection = pro;

        return {
            fulfillmentText: 'Thanks, you were registered as a ' + pro.Service + '.',
            source: !debug ? sourceReg : {
                pro: pro,
                found: found,
                proData: proData,
                contexts: contexts,
                all: context.bindings.searchProCollection
            }
        };
    }

    return {
        fulfillmentText: 'Sorry, you have already been registered.',
        source: !debug ? sourceReg : {
            pro: pro,
            found: found,
            proData: proData,
            contexts: contexts,
            all: context.bindings.searchProCollection
        }
    };
}

function searchPro(context, params, contexts, debug) {
    let proData = mergeParamsFromContexts(contexts);
    let service = {Service: proData['Service-Name-Entity']};
    let pros = _.where(context.bindings.searchProCollection, service);

    let notify = 'Ok, thank you !';
    if (pros.length) {
        notify += buildNotifyFromResponse(pros);
    }
    notify += '\r\nYou\'ll be notified about service opportunities near you ! Bye ))';

    return {
        fulfillmentText: notify,
        source: !debug ? sourceReg : {
            pros: pros,
            notify: notify,
            all: context.bindings.searchProCollection
        }
    };
}

function registerClient(context, params, contexts, originalDetectIntentRequest, session, debug) {
    let clientData = mergeParamsFromContexts(contexts);
    let found = _.where(context.bindings.searchClientCollection, {
        RowKey: getHashForRowKey(clientData['email.original'], clientData['Service-Name-Entity.original'])
    });

    if (!found.length) {
        let client = getClientFromParams(clientData, originalDetectIntentRequest, session);
        context.bindings.registerClientCollection = client;

        return {
            fulfillmentText: 'Thanks, you were registered as a ' + client.Name + '.',
            source: !debug ? sourceReg : {
                client: client,
                found: found,
                clientData: clientData,
                contexts: contexts,
                all: context.bindings.searchProCollection
            }
        };
    }
}

function stopNotifyClient(context, params, contexts, originalDetectIntentRequest, debug) {
    let userId = getUserId(originalDetectIntentRequest);

    if (userId) {
        let found = _.where(context.bindings.searchClientCollection, {
            User_ID: getUserId(originalDetectIntentRequest)
        });

        if (found.length) {
            // let client =
        }
    }
}
/*--- /API ---*/

module.exports = {
    registerPro: registerPro,
    searchPro: searchPro,
    registerClient: registerClient
};
