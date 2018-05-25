
var proService = require('./proService');

module.exports = function (context, req) {
    let body = req.body;

    if (body) {
        let query = body.queryResult;

        if (query) {
            let params = query.parameters;
            let intent = query.intent;
            let contexts = query.outputContexts;
            let originalDetectIntentRequest = body.originalDetectIntentRequest;
            let session = body.session;
            let debug = params['debug'];

            if (intent['name'] === RegisterProIntentName) {
                let proResponse = proService.registerPro(context, params, contexts, originalDetectIntentRequest, session, debug);

                return context.res.json(proResponse);
            }

            if (intent['name'] === SearchProIntentName) {
                let clientResponse = proService.registerClient(context, params, contexts, originalDetectIntentRequest, session, debug);

                let proResponse = proService.searchPro(context, params, contexts, debug);

                return context.res.json(proResponse);
            }

            // if (intent['name'] === StopIntentName) {
            //     let stopNotifyResponse = proService.stopNotifyClient(context, params, contexts, debug);
            //
            //     return context.res.json(proResponse);
            // }
            //
            // if (intent['name'] === StartIntentName) {
            //     let stopNotifyResponse = proService.startNotifyClient(context, params, contexts, debug);
            //
            //     return context.res.json(proResponse);
            // }
        }
    }

    context.done();
};

const agent_DF = 'projects/newagent-27b1d/agent/';
const intents_DF = agent_DF + 'intents/';

const RegisterProIntentName = intents_DF + '6d5b7687-480f-42b0-9cda-a65741ff8cdf';
const SearchProIntentName = intents_DF + '4c0d76c5-be0f-4d22-8a96-cbf7a264b8eb';
const StopIntentName = intents_DF + '82eb75b4-ab19-43a8-a47e-55604c00eb98';
const StartIntentName = intents_DF + '058afb0d-0c19-497f-86ac-4f7f99a4b177';
