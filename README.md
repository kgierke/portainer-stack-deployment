# Portainer Stack Deployment

Github Action for creating/updating docker swarm stacks using the portainer API. The file can be a ".mustache" file to allow for workflow specific overrides (e.g. image).

## Usage

Simply include the following lines to your workflow:

```yaml
jobs:
  name: Example
  runs-on: ubuntu-latest
  steps:
    - name: Clone Repository
-     uses: actions/checkout@v2
    - name: Deploy Stack
      uses: kgierke/portainer-stack-deployment@v1
      with:
        portainer-url: "https://portainer.example.com"
        portainer-username: "admin"
        portainer-password: "password"
        portainer-endpoint: 2
        name: stack-name
        file: path/to/stackfile.yml.mustache
        variables: '{"image": "hello-world"}'
```

## Inputs

The following inputs are available:

| Name                 | Type   | Required | Description                                                                                   |
|----------------------|--------|----------|-----------------------------------------------------------------------------------------------|
| `portainer-url`      | URL    | Yes      | URL to your Portainer instance including the protocol.                                        |
| `portainer-username` | String | Yes      | Username for authenticating requests against the Portainer API.                               |
| `portainer-password` | String | Yes      | Password for authenticating requests against the Portainer API.                               |
| `portainer-endpoint` | Number | Yes      | Portainer endpoint id to use.                                                                 |
| `name`               | String | Yes      | Name for the stack.                                                                           |
| `file`               | String | Yes      | Path to the stack file. Can be either `.yml` or `.mustache`.                                  |
| `variables`          | String | No       | Variables to use when `file` is a `.mustache` template. Variables need to be written as JSON. |
| `delete`             | String | No       | If set to `true` the stack will be deleted (based on the name).                               |
| `prune `             | String | No       | If set to `true` missing/obsolete services will be removed from the exiting stack on update.  |
