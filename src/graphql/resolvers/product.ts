export const resolvers = {
	Query: {
		products: async (
			_: any,
			{ pageSize, after, filter }: any,
			{ ctx }: any
		) => {
			return {
				cursor: 0,
				hasMore: false,
				products: [],
			};
		},

		product: async (_: any, { id }: any, { ctx }: any) => {
			return {
				brand: 'gif',
				product: 'picture',
				unit_of_measure: 'inches',
				cost_per_unit: 10,
				total_cost: 10,
				units_per_piece: 1,
				deleted: false,
				show: true,
				product_code: 'pic-001',
				title: 'picture',
				description: 'It is a picture',
				image: '',
				category: 'images',
				sub_category: 'cats',
				sub_cat_order: 1,
				colour: 'white',
				width: '10cm',
				length: '10cm',
				area: '',
				stock_item: true,
				order: 1,
				cat_order: 1,
			};
		},
	},
};
