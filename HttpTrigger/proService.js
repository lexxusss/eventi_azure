
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
        Request_Session: session
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

function registerPro(context, params, contexts, originalDetectIntentRequest, session, debug) {
    let proData = mergeParamsFromContexts(contexts);
    let found = _.where(context.bindings.searchProTable, {
        RowKey: getHashForRowKey(
            proData['email.original'], 
            proData['Service-Name-Entity.original']
        )
    });

    if (!found.length) {
        let pro = getProFromParams(proData, originalDetectIntentRequest, session);
        context.bindings.registerProTable = pro;

        return {
            fulfillmentText: 'Thanks, you were registered as a ' + pro.Service + '.',
            source: !debug ? sourceReg : {
                pro: pro,
                found: found,
                proData: proData,
                contexts: contexts,
                all: context.bindings.searchProTable
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
            all: context.bindings.searchProTable
        }
    };
}

function searchPro(context, params, contexts, debug) {
    let proData = mergeParamsFromContexts(contexts);
    let service = {Service: proData['Service-Name-Entity']};
    let pros = _.where(context.bindings.searchProTable, service);

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
            all: context.bindings.searchProTable
        }
    };
}

function registerClient(context, params, contexts, originalDetectIntentRequest, session, debug) {
    let clientData = mergeParamsFromContexts(contexts);
    let found = _.where(context.bindings.searchClientTable, {
        RowKey: getHashForRowKey(clientData['email.original'], clientData['Service-Name-Entity.original'])
    });

    if (!found.length) {
        let client = getClientFromParams(clientData, originalDetectIntentRequest, session);
        context.bindings.registerClientTable = client;

        return {
            fulfillmentText: 'Thanks, you were registered as a ' + client.Name + '.',
            source: !debug ? sourceReg : {
                client: client,
                found: found,
                clientData: clientData,
                contexts: contexts,
                all: context.bindings.searchProTable
            }
        };
    }
}

module.exports = {
    registerPro: registerPro,
    searchPro: searchPro,
    registerClient: registerClient
};
