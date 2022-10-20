const core = require('@actions/core');
//const github = require('@actions/github');

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

    const xhr = new XMLHttpRequest();

    switch (operation.toLowerCase()) {
        case 'create':
            xhr.open('POST', `https://api.honeycomb.io/1/markers/${dataset}`, false);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Honeycomb-Team", apiKey);
            const json = JSON.stringify(requestDto)
            xhr.send(json);

            console.log(`${xhr.status} ${xhr.statusText}`)

            if (xhr.status === 201) {
                console.log(xhr.responseText);

                response = JSON.parse(xhr.responseText);
                core.setOutput('id', response.id);
                core.setOutput('created_at', response.created_at);
                core.setOutput('updated_at', response.updated_at);
                core.setOutput('message', response.message);

                core.setOutput('start_time', response.start_time);

                if (response.hasOwnProperty('end_time')) {
                    core.setOutput('end_time', response.start_time);
                }
            }
            else {
                throw new Error(`${xhr.status} ${xhr.statusText}`)
            }
            break;
        default:
            throw new Error(`Operation ${operation} is not supported.`);
    }
} catch (error) {
    core.setFailed(error.message);
}