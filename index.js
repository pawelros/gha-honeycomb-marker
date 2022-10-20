const core = require('@actions/core');
//const github = require('@actions/github');
const axios = require('axios');

class HoneyCombMarkerRequestDto {
    id;
    dataset;
    type;
    message;
    start_time;
    end_time;
    url;

    constructor(id, dataset, type, message, startTime, endTime, url) {
        this.id = id || null;
        this.dataset = dataset || null;
        this.type = type || null;
        this.message = message || null;
        this.start_time = startTime || null;
        this.end_time = endTime || null;
        this.url = url || null;
    }
}

try {
    const apiKey = core.getInput('api-key');
    const id = core.getInput('id');
    const dataset = core.getInput('dataset');
    const operation = core.getInput('operation');
    const type = core.getInput('type');
    const message = core.getInput('message');
    const startTime = core.getInput('start-time');
    const endTime = core.getInput('end-time');
    const url = core.getInput('url');

    const requestDto = new HoneyCombMarkerRequestDto(id, dataset, type, message, startTime, endTime, url);

    let axios_config = {
        headers: {
            "Content-Type": "application/json",
            "X-Honeycomb-Team": apiKey
        }
    }

    switch (operation.toLowerCase()) {
        case 'create':
            axios.post(`https://api.honeycomb.io/1/markers/${dataset}`, requestDto, axios_config)
                .then(setOutputFrom(response))
                .catch(setFailedFrom(error));
            break;
        case 'update':
            if (!requestDto.id) throw new Error('Honeycomb marker `id` is required for update operation type.')

            axios.put(`https://api.honeycomb.io/1/markers/${dataset}/${requestDto.id}`, requestDto, axios_config)
                .then(setOutputFrom(response))
                .catch(setFailedFrom(error));
            break;
        default:
            throw new Error(`Operation ${operation} is not supported.`);
    }
} catch (error) {
    console.log(error)
    core.setFailed(error.message);
}

function setOutputFrom(response) {
    console.log(`Marker ${JSON.stringify(requestDto)}. Response: ${response.data}`);
    console.log(`${response.status} ${response.statusText}`);

    core.setOutput('id', response.data.id);
    core.setOutput('created-at', response.data.created_at);
    core.setOutput('updated-at', response.data.updated_at);
    core.setOutput('message', response.data.message);
    core.setOutput('start-time', response.data.start_time);

    if (response.data.hasOwnProperty('end-time')) {
        core.setOutput('end-time', response.data.start_time);
    }
}

function setFailedFrom(error) {
    if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);

        core.setFailed(error.response.data.error);
    }
}