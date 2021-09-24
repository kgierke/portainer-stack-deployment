import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import {CreateStackPayload, DeleteStackPayload, PortainerStack, Stack, UpdateStackPayload} from "./types";

export class PortainerClient {
    token = null;
    private readonly client: AxiosInstance;

    constructor(url: URL) {
        if (url.pathname !== '/api/') {
            url.pathname = '/api/';
        }

        /**
         * Create axios instance for requests.
         */
        this.client = axios.create({
            baseURL: url.toString()
        });

        /**
         * Create Axios Interceptor for Authorization header if token is set.
         */
        this.client.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
            if (this.token) {
                config.headers['Authorization'] = `Bearer ${this.token}`;
            }

            return config;
        });
    }

    /**
     * Authenticate against the Portainer API and store the JWT.
     *
     * @param username {String} - username to authenticate with.
     * @param password {String} - password to authenticate with.
     */
    async login(username: string, password: string) {
        const {data} = await this.client.post('/auth', {
            username,
            password
        });

        this.token = data.jwt;
    }

    /**
     * Retrieve the swarm ID from the Portainer Endpoint.
     *
     * @param endpoint {Number} - Portainer endpoint ID.
     */
    async getSwarmId(endpoint: number): Promise<number> {
        const {data} = await this.client.get(`/endpoints/${endpoint}/docker/swarm`);

        return data.ID;
    }

    /**
     * Retrieve all existing stacks from swarm.
     *
     * @param endpoint {Number} - Portainer endpoint ID.
     */
    async getStacks(endpoint: number): Promise<Stack[]> {
        const swarmId = await this.getSwarmId(endpoint);
        const {data}: { data: PortainerStack[] } = await this.client.get(
            '/stacks',
            {
                params: {
                    filters: JSON.stringify({
                        SwarmId: swarmId
                    })
                }
            });

        return data.map((item) => ({
            id: item.Id,
            name: item.Name
        }));
    }

    /**
     * Create new stack and return name and id of it.
     *
     * @param payload {CreateStackPayload} - Payload for the stack to be created.
     */
    async createStack(payload: CreateStackPayload): Promise<Stack> {
        const swarmId = await this.getSwarmId(payload.endpoint);
        const {data}: { data: PortainerStack } = await this.client.post(
            '/stacks',
            {
                name: payload.name,
                stackFileContent: payload.file,
                swarmID: swarmId
            },
            {
                params: {
                    endpointId: payload.endpoint,
                    method: 'string',
                    type: 1
                }
            });

        return {
            id: data.Id,
            name: data.Name
        };
    }

    /**
     * Update existing stack with given data.
     *
     * @param payload {UpdateStackPayload} - Payload for the stack to be updated.
     */
    async updateStack(payload: UpdateStackPayload): Promise<Stack> {
        const {data}: { data: PortainerStack } = await this.client.put(
            `/stacks/${payload.id}`,
            {
                stackFileContent: payload.file,
                prune: payload.prune
            },
            {
                params: {
                    endpointId: payload.endpoint
                }
            });

        return {
            id: data.Id,
            name: data.Name
        };
    }

    /**
     * Delete a stack by the given ID.
     *
     * @param payload {DeleteStackPayload} - ID of the stack to be deleted.
     */
    async deleteStack(payload: DeleteStackPayload): Promise<void> {
        await this.client.delete(
            `/stacks/${payload.id}`,
            {
                params: {
                    external: true,
                    endpointId: payload.endpoint
                }
            }
        );
    }
}
