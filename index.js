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
    treat_missing_dataset_as_warning;

    constructor(id, dataset, type, message, startTime, endTime, url, treat_missing_dataset_as_warning) {
        this.id = id || null;
        this.dataset = dataset || null;
        this.type = type || null;
        this.message = message || null;
        this.start_time = parseInt(startTime) || null;
        this.end_time = parseInt(endTime) || null;
        this.url = url || null;
        this.treat_missing_dataset_as_warning = treat_missing_dataset_as_warning || false;
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
    const treat_missing_dataset_as_warning = core.getBooleanInput('treat-missing-dataset-as-warning');

    const requestDto = new HoneyCombMarkerRequestDto(id, dataset, type, message, startTime, endTime, url);

    let axios_config = {
        headers: {
            "Content-Type": "application/json",
            "X-Honeycomb-Team": apiKey
        }
    }

    this.treat_missing_dataset_as_warning = treat_missing_dataset_as_warning;
    console.log(this);

    const processError = (error) => {
        console.log(this.treat_missing_dataset_as_warning)
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);

        if (error.response.status == 404 && error.response.data == '{ error: \'dataset not found\' }'
            && this.treat_missing_dataset_as_warning) {
            core.notice(`Dataset ${this.requestDto.dataset} not found.`)
            return;
        }

        core.setFailed(error.response.data.error);
    }

    const processResponse = (response) => {
        console.log(`Marker ${JSON.stringify(requestDto)}. Response: ${JSON.stringify(response.data)}`);
        console.log(`${response.status} ${response.statusText}`);

        core.setOutput('id', response.data.id);
        core.setOutput('created-at', response.data.created_at);
        core.setOutput('updated-at', response.data.updated_at);
        core.setOutput('message', response.data.message);
        core.setOutput('start-time', response.data.start_time);
        core.setOutput('end-time', response.data.start_time);
    }

    switch (operation.toLowerCase()) {
        case 'create':
            axios.post(`https://api.honeycomb.io/1/markers/${dataset}`, requestDto, axios_config)
                .then(processResponse)
                .catch(processError);
            break;
        case 'update':
            if (!requestDto.id) throw new Error('Honeycomb marker `id` is required for update operation type.')
            if (!requestDto.dataset) throw new Error('Honeycomb marker `dataset` is required for update operation type.')

            axios.put(`https://api.honeycomb.io/1/markers/${dataset}/${requestDto.id}`, requestDto, axios_config)
                .then(processResponse)
                .catch(processError);
            break;
        default:
            throw new Error(`Operation ${operation} is not supported.`);
    }
} catch (error) {
    console.log(error)
    core.setFailed(error.message);
}
