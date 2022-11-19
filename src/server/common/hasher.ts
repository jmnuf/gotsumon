import b from "bcrypt";

export async function hashUser(username:string, password:string) {
	const salt = await b.genSalt(10);
	const hash = await b.hash(`${username}.${password}`, salt);
	return { hash, salt };
}

export async function compareUser(username:string, password:string, expected:string) {
	const value = `${username}.${password}`;
	return await b.compare(value, expected);
}
