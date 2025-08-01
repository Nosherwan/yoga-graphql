export const typeDefs = `
	extend type Query {
		users(pageSize: Int, after: Int, filter: [[String]]): UserConnection!

		user(id: HashID): User
	}

	type UserConnection {
		cursor: String
		hasMore: Boolean!
		users: [User]!
	}

	type User {
		id: HashID
		first_name: String
		last_name: String
		email: String
		registered: Boolean
		created_on: String
		modified_on: String
		deleted: Boolean
		status: String
		roles: [String]
	}
`;
