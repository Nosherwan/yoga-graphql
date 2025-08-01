export const typeDefs = `
	extend type Mutation {
		signUp(
			email: String!
			firstName: String!
			lastName: String!
		): GenericResponse
	}
`;
