export const typeDefs = `
	extend type Query {
		catalogues(pageSize: Int, after: Int, filter: [[String]]): CatalogueConnection!

		catalogue(id: Int): Catalogue

		randomCatalogue: Catalogue
	}

	type CatalogueConnection {
		cursor: String
		hasMore: Boolean!
		catalogues: [Catalogue]!
	}

  type Catalogue {
    id: HashID
    title: String
    category: String
    description: String
    slug: String
    web_url: String
    content: String
    image: String
    average_rating: Float
    download_count: Int
    price: Float
    has_in_app_purchases: Boolean
    version: String
    platform: String
    release_date: String
    developer: String
    supported_languages: [String]
    tags: [String]
    app_store_url: String
    play_store_url: String
    published: Boolean
    published_on: String
    created_on: String
    modified_on: String
    modified_by: String
    deleted: Boolean
    youtube_url: String
  }
`;
