/**
 * Application specific interfaces
 */
export interface Config {
    portainer: PortainerConfig
    stack: StackConfig
}

export interface PortainerConfig {
    url: URL
    username: string
    password: string
    endpoint: number
}

export interface StackConfig {
    name: string
    file: string
    delete: boolean
    prune: boolean
}

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
    prune: boolean
}

export interface DeleteStackPayload {
    id: number
    endpoint: number
}

/**
 * Portainer specific interfaces
 */
export interface PortainerStack {
    Id: number
    Name: string
}
