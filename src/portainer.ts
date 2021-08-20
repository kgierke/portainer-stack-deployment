import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

export interface Stack {
    id: number
    name: string
}

export interface CreateStackPayload {
    name: string
    endpoint: number
    file: string
}

export interface UpdateStackPayload {
    id: number
    endpoint: number
    file: string
}

export class PortainerClient {
    private readonly client: AxiosInstance;
    token = null;

    constructor(url: URL) {
        if (url.pathname !== '/api/') {
            url.pathname = '/api/';
        }

        this.client = axios.create({
            baseURL: url.toString()
        });

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
    async getSwarmId(endpoint: number) {
        const {data} = await this.client.get(`/endpoints/${endpoint}/docker/swarm`);

        return data.ID;
    }

    async getStacks(endpoint: number): Promise<[Stack]> {
        const swarmId = await this.getSwarmId(endpoint);
        const {data} = await this.client.get('/stacks', {
            params: {
                filters: JSON.stringify({
                    SwarmId: swarmId
                })
            }
        });

        return data.map((item: any) => ({
            id: item.Id,
            name: item.Name
        }));
    }

    async createStack(payload: CreateStackPayload) {
        const swarmId = await this.getSwarmId(payload.endpoint);
        const {data} = await this.client.post('/stacks', {
            name: payload.name,
            stackFileContent: payload.file,
            swarmID: swarmId
        }, {
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

    async updateStack(payload: UpdateStackPayload) {
        await this.client.put(`/stacks/${payload.id}`, {
            stackFileContent: payload.file
        }, {params: {endpointId: payload.endpoint}})
    }
}
