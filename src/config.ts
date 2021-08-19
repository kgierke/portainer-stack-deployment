import * as core from '@actions/core';
import * as fs from 'fs';

const parsePortainerConfig = () => {
    return {
        url: new URL(core.getInput('portainer-url', {required: true})),
        username: core.getInput('portainer-username', {required: true}),
        password: core.getInput('portainer-password', {required: true}),
        endpoint: parseInt(core.getInput('portainer-endpoint', {required: true}))
    };
};

const parseStackConfig = () => {
    const filePath = core.getInput('file', {required: true});
    const file = fs.readFileSync(filePath, 'utf-8');

    return {
        name: core.getInput('name', {required: true}),
        file
    };
};

export function parse() {
    return {
        portainer: parsePortainerConfig(),
        stack: parseStackConfig()
    };
}
