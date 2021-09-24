import * as core from '@actions/core';
import * as config from './config';
import {PortainerClient} from './portainer';

async function run() {
    try {
        const cfg = config.parse();
        core.debug(`Stack parsed: ${cfg.stack.file}`);

        core.startGroup('Authentication');
        const portainer = new PortainerClient(cfg.portainer.url);
        await portainer.login(cfg.portainer.username, cfg.portainer.password);
        core.info("Retrieved authentication token from Portainer");
        core.endGroup();

        core.startGroup('Get current state');
        const stacks = await portainer.getStacks(cfg.portainer.endpoint);
        let stack = stacks.find(item => item.name === cfg.stack.name);
        core.endGroup();

        if (stack) {
            if (cfg.stack.delete) {
                core.startGroup('Delete existing stack');
                core.info(`Delete existing stack (ID: ${stack.id})...`);
                await portainer.deleteStack({
                    id: stack.id,
                    endpoint: cfg.portainer.endpoint
                });
                core.info("Stack deleted.");
                core.endGroup();
            } else {
                core.startGroup('Update existing stack');
                core.info(`Updating existing stack (ID: ${stack.id}; prune: ${cfg.stack.prune})...`);
                await portainer.updateStack({
                    id: stack.id,
                    endpoint: cfg.portainer.endpoint,
                    file: cfg.stack.file,
                    prune: cfg.stack.prune,
                })
                core.info("Stack updated.");
                core.endGroup();
            }
        } else {
            core.startGroup('Create new stack');
            core.info("Creating new stack...");
            await portainer.createStack({
                endpoint: cfg.portainer.endpoint,
                name: cfg.stack.name,
                file: cfg.stack.file
            })
            core.info("Stack created.");
            core.endGroup();
        }
    } catch (e) {
        core.setFailed(`Action failed with error: ${e}`);
    }
}

run();
