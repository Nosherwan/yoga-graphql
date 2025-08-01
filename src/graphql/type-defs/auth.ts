export const typeDefs = `
	extend type Query {

		login(email: String!, password: String!): LoginResponse!

		logout: GenericResponse!
	}

	extend type Mutation {

		registerRequest(
			email: String!
			firstName: String!
			lastName: String!
		): GenericResponse

		createPassword(passwordInput: PasswordInput!): GenericResponse

		forgotPassword(email:String!): GenericResponse

		refreshAccessToken: GenericResponse!
	}

	input PasswordInput {
		uniqid: String!
		password: String!
	}

	type LoginResponse {
		userInfo: UserInfo
		success: Boolean!
		message: String
	}

	type UserInfo {
		email: String
		first_name: String
		last_name: String
		exp: String
		roles: [String]
		title: String
		phone_number: String
	}
`;
