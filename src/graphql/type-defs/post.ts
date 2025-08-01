export const typeDefs = `
	extend type Query {
		posts(pageSize: Int, after: Int, filter: [[String]]): PostConnection!

		post(slug: String!): Post
	}

	type PostConnection {
		cursor: String
		hasMore: Boolean!
		posts: [Post]!
	}

	type Post {
    id: HashID
    title: String
    slug: String
    content: String
    author: String
    excerpt: String
    image: String
    category: String
    tags: [String]
    status: String
    published_on: String
    created_on: String
    modified_on: String
    modified_by: String
    deleted: Boolean
}
`;
