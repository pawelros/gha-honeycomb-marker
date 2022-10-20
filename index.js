const core = require('@actions/core');
//const github = require('@actions/github');
const axios = require('axios').default;

class HoneyCombMarkerRequestDto {
    dataset;
    type;
    message;
    start_time;
    end_time;
    url;

    constructor(dataset, type, message, startTime, endTime, url) {
        this.dataset = dataset;
        this.type = type;
        this.message = message;
        this.start_time = startTime;
        this.end_time = endTime;
        this.url = url;
    }
}

try {
    const apiKey = core.getInput('api-key');
    const dataset = core.getInput('dataset');
    const operation = core.getInput('operation');
    const type = core.getInput('type');
    const message = core.getInput('message');
    const startTime = core.getInput('start_time');
    const endTime = core.getInput('end_time');
    const url = core.getInput('url');

    const requestDto = new HoneyCombMarkerRequestDto(dataset, type, message, startTime, endTime, url);

    let axios_config = {
        headers: {
            "Content-Type": "application/json",
            "X-Honeycomb-Team": apiKey
        }
    }

    switch (operation.toLowerCase()) {
        case 'create':

            axios.post(`https://api.honeycomb.io/1/markers/${dataset}`, requestDto, axios_config)
                .then(function (response) {
                    console.log(`${response.status} ${response.statusText}`)
                    if (response.status === 201) {
                        core.setOutput('id', response.data.id);
                        core.setOutput('created_at', response.data.created_at);
                        core.setOutput('updated_at', response.data.updated_at);
                        core.setOutput('message', response.data.message);
        
                        core.setOutput('start_time', response.data.start_time);
        
                        if (response.data.hasOwnProperty('end_time')) {
                            core.setOutput('end_time', response.data.start_time);
                        }
                    }
                    else {
                        throw new Error(`${response.status} ${response.statusText}`)
                    }
                })         
            break;
        default:
            throw new Error(`Operation ${operation} is not supported.`);
    }
} catch (error) {
    core.setFailed(error.message);
}