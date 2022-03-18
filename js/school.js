export async function fetchIcal() {
	let url =
		"https://sms.schoolsoft.se/initcollegesth/jsp/public/right_public_student_ical.jsp?key=b6969667f66a45425d05be25ec0af15e";

	console.log("sent query");

	let response = await fetch(url, {
		// mode: "no-cors",
		mode: "no-cors",
		headers: [],
	});

	let text = await response.text();

	console.log("ok", response.ok, " status", response.status, " text", text);

	console.log(response);
}
