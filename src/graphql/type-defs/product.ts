export const typeDefs = `
	extend type Query {
		products(pageSize: Int, after: Int, filter: [[String]]): ProductConnection!

		product(id: Int): Product
	}

	type ProductConnection {
		cursor: String
		hasMore: Boolean!
		products: [Product]!
	}

	type Product {
		id: HashID
		brand: String
		product: String
		unit_of_measure: String
		cost_per_unit: Float
		total_cost: Float
		units_per_piece: Float
		deleted: Boolean
		show: Boolean
		product_code: String
		title: String
		description: String
		image: String
		category: String
		sub_category: String
		sub_cat_order: Int
		colour: String
		width: String
		length: String
		area: String
		stock_item: Boolean
		order: Int
		cat_order: Int
	}
`;
