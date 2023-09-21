class RailwayService {
    authToken
    projectId


    constructor(projectId) {
        this.authToken = process.env.RAILWAY_TOKEN
        this.projectId = projectId
    }

    async _executeQuery({ query, variables }) {
        const result = await fetch("https://backboard.railway.app/graphql/v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Authorization": `Bearer ${this.authToken}`
            },
            body: JSON.stringify({
                query,
                variables
            }),
        });
        const data = await result.json();
        if (!!data.errors) {
            console.log(JSON.stringify(data.errors, null, 2))
            throw new Error(data.errors[0].message)
        } else {
            return data;
        }
    }

    async getEnvironments() {
        const result = await this._executeQuery({
            query: `
            query getEnvironments($projectId: String!) {
                project(id: $projectId) {
                  id
                  name
                  environments {
                    edges {
                      node {
                        id
                        name
                      }
                    }
                  }
                }
              }
            `,
            variables: {
                projectId: this.projectId
            }
        });
        return result.data.project.environments.edges.map((e) => e.node)
    }

    async getLatestDeployment({
        first,
        last,
        after,
        before,
        serviceId,
        environmentId
    }) {
        const result = await this._executeQuery({
            query: `
            query getDeployments(
                    $projectId: String!
                    $serviceId: String!
                    $environmentId: String!
                ) {
                deployments(
                  first: 1
                  input: {
                    projectId: $projectId
                    environmentId: $environmentId
                    serviceId: $serviceId
                  }
                ) {
                  edges {
                    node {
                      id
                      status
                      staticUrl
                    }
                  }
                }
              }
            `,
            variables: {
                projectId: this.projectId,
                serviceId,
                environmentId,
                first,
                last,
                before,
                after
            }
        });
        return result.data.deployments.edges.map(({ node }) => node)[0];
    }

    async getDeployment(deploymentId) {
        const result = await this._executeQuery({
            query: `
            query getDeployment(
                    $deploymentId: String!
                ) {
                deployment(
                  id: $deploymentId
                ) {
                    id
                    status
                    staticUrl
                }
              }
            `,
            variables: {
                deploymentId
            }
        });
        return result.data;
    }

    async getServices() {
        const result = await this._executeQuery({
            query: `
            query getServices($projectId: String!) {
                project(id: $projectId) {
                  id
                  name
                  services {
                    edges {
                      node {
                        id
                        name
                      }
                    }
                  }
                }
              }
            `,
            variables: {
                projectId: this.projectId
            }
        });
        return result.data.project.services.edges.map((e) => e.node)
    }

    async getServiceVariables({ serviceId, environmentId }) {
        const result = await this._executeQuery({
            query: `
            query getServiceVariables(
                $projectId: String!
                $serviceId: String!
                $environmentId: String!
            ) {
                variables(
                    projectId: $projectId
                    environmentId: $environmentId
                    serviceId: $serviceId
                    unrendered: true
                  )
              }
            `,
            variables: {
                projectId: this.projectId,
                serviceId,
                environmentId
            }
        });
        return result.data.variables
    }

    async upsertServiceVariablesInBulk({ serviceId, environmentId, variables }) {
        return this._executeQuery({
            query: `
            mutation upsertServiceVariablesInBulk(
                $projectId: String!
                $serviceId: String!
                $environmentId: String!
                $variables: ServiceVariables!
            ) {
                variableCollectionUpsert(
                    input: {
                        projectId: $projectId,
                        environmentId: $environmentId,
                        serviceId: $serviceId,
                        replace: true,
                        variables: $variables
                    }
                  )
              }
            `,
            variables: {
                projectId: this.projectId,
                serviceId,
                environmentId,
                variables
            }
        });
    }
    async createEnvironment({
        name,
        sourceEnvironmentId,
        ephemeral = true
    }) {
        const result = await this._executeQuery({
            query: `
            mutation environmentCreate(
                $projectId: String!
                $name: String!
                $sourceEnvironmentId: String
                $ephemeral: Boolean
            ) {
                environmentCreate(
                  input: {
                    projectId: $projectId, 
                    name: $name, 
                    sourceEnvironmentId: $sourceEnvironmentId, 
                    ephemeral: $ephemeral
                  }
                ) {
                  id
                  name
                }
              }
            `,
            variables: {
                projectId: this.projectId,
                name,
                sourceEnvironmentId,
                ephemeral
            }
        });
        return result.data.environmentCreate
    }
    async deleteEnvironment(environmentId) {
        const result = await this._executeQuery({
            query: `
            mutation deleteEnvironment($environmentId: String!) {
                environmentDelete(id: $environmentId)
            }
            `,
            variables: {
                environmentId
            }
        });
        return result.data
    }
}

export default RailwayService;