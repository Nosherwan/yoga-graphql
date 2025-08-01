export const typeDefs = `
	scalar HashID

	type Query {
		_empty: String
	}

	type Mutation {
		_empty: String
	}

	type GenericResponse {
		success: Boolean!
		message: String
	}
`;
