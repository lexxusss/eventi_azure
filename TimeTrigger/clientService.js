
let azure = require('azure-storage');

let connectionString = 'DefaultEndpointsProtocol=https;AccountName=alex-hello-world;AccountKey=za80V9bcmvI4LkaVjmSsCBt2SjSGQhe00mL2qRqNNYQqVAGbJ7r2tJ3elxDLRpcnRGWeo9iQ2CQ4RxAJX1Us6g==;EndpointSuffix=documents.azure.com';

function updateClient(context, client) {
    let tableService = azure.createTableService(connectionString);
    tableService.replaceEntity('registerClientCollection', client, (error, result, response) => {
        let res = {
            statusCode: error ? 400 : 204,
            body: null
        };
        context.log(res);
    });
}

function createClient(context, client) {
    let tableService = azure.createTableService(connectionString);
    tableService.insertEntity('registerClientCollection', client, (error, result, response) => {
        let res = {
            statusCode: error ? 400 : 204,
            body: null
        };
        context.log(res);
    });
}

module.exports = {
    updateClient: updateClient,
    createClient: createClient
};
