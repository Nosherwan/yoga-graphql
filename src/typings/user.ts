export interface User {
	id?: number;
	first_name?: string;
	last_name?: string;
	email?: string;
	registered?: boolean;
	roles?: string[];
	status?: string;
	phone_number?: string;
	password?: string;
	uniqid?: string;
	refresh_tokens?: string[];
	created_on?: Date;
	modified_on?: Date;
	modified_by?: string;
	deleted?: boolean;
	//added in the context
	isExpired?: boolean;
}
