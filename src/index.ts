import * as core from '@actions/core';
import * as config from './config';
import {PortainerClient} from './portainer';

async function run() {
    try {
        const cfg = config.parse();
        core.debug('Parsed Configuration');

        core.startGroup('Authentication');
        const portainer = new PortainerClient(cfg.portainer.url);
        await portainer.login(cfg.portainer.username, cfg.portainer.password);
        core.endGroup();

        core.startGroup('Get State');
        const stacks = await portainer.getStacks(cfg.portainer.endpoint);
        let stack = stacks.find(item => item.name === cfg.stack.name);
        core.endGroup();

        if (stack) {
            core.startGroup('Update existing stack');
            await portainer.updateStack({
                id: stack.id,
                endpoint: cfg.portainer.endpoint,
                file: cfg.stack.file
            })
            core.endGroup();
        } else {
            core.startGroup('Create new stack');
            await portainer.createStack({
                endpoint: cfg.portainer.endpoint,
                name: cfg.stack.name,
                file: cfg.stack.file
            })
            core.endGroup();
        }
    } catch (e) {
        core.setFailed(e.message);
    }
}

run();
