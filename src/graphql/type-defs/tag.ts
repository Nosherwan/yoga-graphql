export const typeDefs = `
	extend type Query {
		tags: [TagCategory]
	}

	type TagWithCount {
      tag: String
      count: Int
  }

	type TagCategory {
	    category: String
			tags: [TagWithCount]
  }

`;
